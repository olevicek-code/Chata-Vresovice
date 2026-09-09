import { renderOgImage } from "@/lib/og-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Chata Vřesovice – odpočinek uprostřed přírody";

export default async function Image() {
  return renderOgImage();
}
