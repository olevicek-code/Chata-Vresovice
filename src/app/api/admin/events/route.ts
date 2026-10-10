import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { generateId, storageErrorMessage } from "@/lib/redis";
import { getEvents, saveEvents, sortEvents, type LocalEvent } from "@/lib/events";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function unauthorized() {
  return NextResponse.json({ error: "Nepřihlášeno." }, { status: 401 });
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Validates the event form; returns the cleaned fields or an error message. */
function parseEvent(body: Record<string, unknown>):
  | { ok: true; fields: Omit<LocalEvent, "id" | "createdAt"> }
  | { ok: false; error: string } {
  const title = text(body.title, 120);
  const place = text(body.place, 120);
  const description = text(body.description, 600);
  const url = text(body.url, 500);
  const startDate = text(body.startDate, 10);
  const endDate = text(body.endDate, 10);

  if (title.length < 2) return { ok: false, error: "Vyplňte prosím název akce." };
  if (place.length < 2) return { ok: false, error: "Vyplňte prosím místo konání." };
  if (!DATE_RE.test(startDate)) return { ok: false, error: "Vyberte prosím datum akce." };
  if (endDate && (!DATE_RE.test(endDate) || endDate < startDate)) {
    return { ok: false, error: "Konec akce nemůže být před začátkem." };
  }
  if (url && !/^https?:\/\//i.test(url)) {
    return { ok: false, error: "Odkaz musí začínat http:// nebo https://." };
  }

  return {
    ok: true,
    fields: {
      title,
      place,
      startDate,
      endDate: endDate && endDate !== startDate ? endDate : undefined,
      description: description || undefined,
      url: url || undefined,
    },
  };
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    return NextResponse.json({ events: sortEvents(await getEvents()) });
  } catch (err) {
    console.error("[admin/events] GET failed:", err);
    return NextResponse.json({ error: storageErrorMessage("Nepodařilo se načíst akce.") }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatné JSON tělo požadavku." }, { status: 400 });
  }

  const parsed = parseEvent(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const event: LocalEvent = {
      id: generateId("event"),
      ...parsed.fields,
      createdAt: new Date().toISOString(),
    };
    const events = await getEvents();
    events.push(event);
    await saveEvents(events);
    revalidatePath("/");
    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error("[admin/events] POST failed:", err);
    return NextResponse.json({ error: storageErrorMessage("Nepodařilo se uložit akci.") }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatné JSON tělo požadavku." }, { status: 400 });
  }
  const id = text(body.id, 100);
  if (!id) return NextResponse.json({ error: "Chybí id akce." }, { status: 400 });

  const parsed = parseEvent(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const events = await getEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Akce nenalezena." }, { status: 404 });
    }
    events[idx] = { ...events[idx], ...parsed.fields };
    // Spread keeps old optional values when the form cleared them – drop those.
    if (!parsed.fields.endDate) delete events[idx].endDate;
    if (!parsed.fields.description) delete events[idx].description;
    if (!parsed.fields.url) delete events[idx].url;
    await saveEvents(events);
    revalidatePath("/");
    return NextResponse.json({ event: events[idx] });
  } catch (err) {
    console.error("[admin/events] PUT failed:", err);
    return NextResponse.json({ error: storageErrorMessage("Nepodařilo se uložit akci.") }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Chybí id akce." }, { status: 400 });
  try {
    const events = await getEvents();
    await saveEvents(events.filter((e) => e.id !== id));
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/events] DELETE failed:", err);
    return NextResponse.json({ error: storageErrorMessage("Nepodařilo se smazat akci.") }, { status: 500 });
  }
}
