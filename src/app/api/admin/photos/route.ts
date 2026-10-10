import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { del, put } from "@vercel/blob";
import { isAdminRequest } from "@/lib/admin-auth";
import { generateId, storageErrorMessage } from "@/lib/redis";
import { getPhotos, isPhotoSection, savePhotos, type Photo } from "@/lib/photos";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
// The admin page shrinks photos in the browser before sending them, so a
// real upload is well under this; it also stays below Vercel's 4.5 MB
// request body limit for serverless functions.
const MAX_BYTES = 4 * 1024 * 1024;

function unauthorized() {
  return NextResponse.json({ error: "Nepřihlášeno." }, { status: 401 });
}

function blobMissing() {
  return NextResponse.json(
    {
      error:
        "Úložiště fotek není nastavené – ve Vercelu připojte Blob úložiště (chybí BLOB_READ_WRITE_TOKEN).",
    },
    { status: 500 }
  );
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    return NextResponse.json({ photos: await getPhotos() });
  } catch (err) {
    console.error("[admin/photos] GET failed:", err);
    return NextResponse.json({ error: storageErrorMessage("Nepodařilo se načíst fotky.") }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  if (!process.env.BLOB_READ_WRITE_TOKEN) return blobMissing();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }

  const file = form.get("file");
  const section = form.get("section");
  const caption = String(form.get("caption") ?? "").trim().slice(0, 200);
  const width = Number(form.get("width")) || 0;
  const height = Number(form.get("height")) || 0;

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Vyberte prosím fotku." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Podporované jsou jen fotky JPG, PNG nebo WebP." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Fotka je příliš velká." }, { status: 400 });
  }
  if (!isPhotoSection(section)) {
    return NextResponse.json({ error: "Vyberte, kam fotka patří." }, { status: 400 });
  }

  try {
    const id = generateId("photo");
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const blob = await put(`photos/${id}.${ext}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
    });

    const photo: Photo = {
      id,
      url: blob.url,
      width,
      height,
      caption,
      section,
      createdAt: new Date().toISOString(),
    };

    const photos = await getPhotos();
    // A new main "O chatě" photo goes first so it replaces the current one;
    // gallery photos are appended to the end.
    if (section === "o-chate") photos.unshift(photo);
    else photos.push(photo);
    await savePhotos(photos);
    revalidatePath("/");

    return NextResponse.json({ photo }, { status: 201 });
  } catch (err) {
    console.error("[admin/photos] POST failed:", err);
    return NextResponse.json({ error: storageErrorMessage("Nepodařilo se nahrát fotku.") }, { status: 500 });
  }
}

/** Edit a caption, move a photo to another section, or nudge it one place
 * up/down within its section. */
export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatné JSON tělo požadavku." }, { status: 400 });
  }
  const { id, caption, section, move } = body as {
    id?: string;
    caption?: string;
    section?: string;
    move?: string;
  };
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Chybí id fotky." }, { status: 400 });
  }

  try {
    const photos = await getPhotos();
    const idx = photos.findIndex((p) => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Fotka nenalezena." }, { status: 404 });
    }
    const photo = photos[idx];

    if (typeof caption === "string") photo.caption = caption.trim().slice(0, 200);
    if (section !== undefined) {
      if (!isPhotoSection(section)) {
        return NextResponse.json({ error: "Neplatná sekce." }, { status: 400 });
      }
      photo.section = section;
    }

    if (move === "up" || move === "down") {
      // Swap with the nearest photo of the same section in that direction.
      const step = move === "up" ? -1 : 1;
      for (let j = idx + step; j >= 0 && j < photos.length; j += step) {
        if (photos[j].section === photo.section) {
          [photos[idx], photos[j]] = [photos[j], photos[idx]];
          break;
        }
      }
    }

    await savePhotos(photos);
    revalidatePath("/");
    return NextResponse.json({ photos });
  } catch (err) {
    console.error("[admin/photos] PATCH failed:", err);
    return NextResponse.json({ error: storageErrorMessage("Nepodařilo se uložit změnu.") }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Chybí id fotky." }, { status: 400 });
  }

  try {
    const photos = await getPhotos();
    const photo = photos.find((p) => p.id === id);
    if (!photo) {
      return NextResponse.json({ error: "Fotka nenalezena." }, { status: 404 });
    }
    await savePhotos(photos.filter((p) => p.id !== id));
    revalidatePath("/");
    // Remove the file last: if this fails, the photo is already gone from
    // the site and only an orphaned file is left in storage.
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      await del(photo.url).catch((err) =>
        console.error("[admin/photos] deleting blob failed:", err)
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/photos] DELETE failed:", err);
    return NextResponse.json({ error: storageErrorMessage("Nepodařilo se smazat fotku.") }, { status: 500 });
  }
}
