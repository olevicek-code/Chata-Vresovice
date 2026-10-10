"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import { PHOTO_SECTIONS, type Photo, type PhotoSection } from "@/lib/photo-sections";

// Phone photos are often 4000+ px and 5–10 MB; this is plenty for a
// full-screen gallery and keeps each upload around half a megabyte.
const MAX_SIDE = 2000;
const JPEG_QUALITY = 0.85;

const inputClass =
  "mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-forest-dark outline-none focus:border-forest/40";

/** Shrinks and re-encodes a photo in the browser. Redrawing it on a canvas
 * also drops all EXIF metadata, including the GPS location phones embed. */
async function shrinkImage(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  );
  if (!blob) throw new Error("encode failed");
  return { blob, width, height };
}

export default function AdminPhotos({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [section, setSection] = useState<PhotoSection>("galerie");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/photos", { cache: "no-store" });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nepodařilo se načíst fotky.");
        return;
      }
      setPhotos(data.photos ?? []);
      setError(null);
    } catch {
      setError("Nepodařilo se spojit se serverem.");
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) return;
    setError(null);

    for (let i = 0; i < files.length; i++) {
      setProgress(`Nahrávám ${i + 1} z ${files.length}…`);
      let shrunk;
      try {
        shrunk = await shrinkImage(files[i]);
      } catch {
        setError(
          `Fotku „${files[i].name}“ se nepodařilo otevřít. Zkuste ji uložit jako JPG.`
        );
        continue;
      }

      const form = new FormData();
      form.append("file", new File([shrunk.blob], "photo.jpg", { type: "image/jpeg" }));
      form.append("section", section);
      form.append("caption", caption);
      form.append("width", String(shrunk.width));
      form.append("height", String(shrunk.height));

      try {
        const res = await fetch("/api/admin/photos", { method: "POST", body: form });
        if (res.status === 401) return onUnauthorized();
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Nepodařilo se nahrát fotku.");
          break;
        }
      } catch {
        setError("Nepodařilo se spojit se serverem.");
        break;
      }
    }

    setProgress(null);
    setFiles([]);
    setCaption("");
    if (fileInput.current) fileInput.current.value = "";
    await load();
  }

  async function patch(id: string, changes: Record<string, string>) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...changes }),
      });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Nepodařilo se uložit změnu.");
        return;
      }
      setPhotos(data.photos ?? []);
    } catch {
      setError("Nepodařilo se spojit se serverem.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Opravdu smazat tuto fotku z webu?")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/photos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Nepodařilo se smazat fotku.");
        return;
      }
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Nepodařilo se spojit se serverem.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <form onSubmit={upload} className="mb-6 rounded-2xl bg-background p-5 ring-1 ring-black/5">
        <h3 className="font-display text-base text-forest-dark">Nahrát fotky</h3>
        <p className="mt-1 text-xs text-stone">
          Fotky se před nahráním samy zmenší a odstraní se z nich údaje o poloze.
          Můžete vybrat víc fotek najednou.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-stone sm:col-span-2">
            Fotky
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="mt-1 block w-full text-sm text-forest-dark file:mr-3 file:rounded-lg file:border-0 file:bg-forest/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-forest-dark"
            />
          </label>
          <label className="text-xs text-stone">
            Kam patří
            <select
              value={section}
              onChange={(e) => setSection(e.target.value as PhotoSection)}
              className={inputClass}
            >
              {Object.entries(PHOTO_SECTIONS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-stone">
            Popisek (nepovinné, např. „Obývák s krbem“)
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={200}
              className={inputClass}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={files.length === 0 || progress !== null}
          className="mt-4 flex items-center gap-2 rounded-xl bg-forest-dark px-4 py-2 text-sm font-semibold text-cream transition-opacity disabled:opacity-50"
        >
          <ImagePlus className="h-4 w-4" />
          {progress ??
            (files.length > 1 ? `Nahrát ${files.length} fotky` : "Nahrát fotku")}
        </button>
      </form>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-stone">Načítám…</p>
      ) : (
        (Object.keys(PHOTO_SECTIONS) as PhotoSection[]).map((sec) => {
          const list = photos.filter((p) => p.section === sec);
          return (
            <div key={sec} className="mb-8">
              <h3 className="mb-3 font-display text-base text-forest-dark">
                {PHOTO_SECTIONS[sec]}{" "}
                <span className="text-sm text-stone">({list.length})</span>
              </h3>
              {sec === "o-chate" && list.length > 1 && (
                <p className="mb-3 text-xs text-stone">
                  Na webu se zobrazuje jen první fotka.
                </p>
              )}
              {list.length === 0 ? (
                <p className="rounded-2xl bg-background p-5 text-sm text-stone ring-1 ring-black/5">
                  Zatím žádné fotky.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((p, i) => (
                    <div
                      key={p.id}
                      className={`overflow-hidden rounded-2xl bg-background ring-1 ring-black/5 ${
                        busyId === p.id ? "opacity-50" : ""
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt={p.caption}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <div className="space-y-2 p-3">
                        <input
                          type="text"
                          defaultValue={p.caption}
                          placeholder="Popisek"
                          maxLength={200}
                          onBlur={(e) => {
                            if (e.target.value.trim() !== p.caption) {
                              patch(p.id, { caption: e.target.value });
                            }
                          }}
                          className="w-full rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs text-forest-dark outline-none focus:border-forest/40"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <select
                            value={p.section}
                            disabled={busyId === p.id}
                            onChange={(e) => patch(p.id, { section: e.target.value })}
                            className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs text-forest-dark outline-none"
                          >
                            {Object.entries(PHOTO_SECTIONS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <div className="flex shrink-0 items-center">
                            <button
                              title="Posunout dopředu"
                              disabled={busyId === p.id || i === 0}
                              onClick={() => patch(p.id, { move: "up" })}
                              className="rounded-lg p-1.5 text-stone/60 hover:bg-forest/10 hover:text-forest-dark disabled:opacity-30"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              title="Posunout dozadu"
                              disabled={busyId === p.id || i === list.length - 1}
                              onClick={() => patch(p.id, { move: "down" })}
                              className="rounded-lg p-1.5 text-stone/60 hover:bg-forest/10 hover:text-forest-dark disabled:opacity-30"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <button
                              title="Smazat fotku"
                              disabled={busyId === p.id}
                              onClick={() => remove(p.id)}
                              className="rounded-lg p-1.5 text-stone/60 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
