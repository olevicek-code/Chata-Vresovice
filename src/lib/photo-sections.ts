/** Photo types shared by the server and the browser (no Redis imports here,
 * so client components can use them). */

export type PhotoSection = "galerie" | "o-chate";

export const PHOTO_SECTIONS: Record<PhotoSection, string> = {
  galerie: "Galerie",
  "o-chate": "Hlavní fotka v sekci O chatě",
};

export type Photo = {
  id: string;
  url: string;
  width: number;
  height: number;
  caption: string;
  section: PhotoSection;
  createdAt: string;
};

export function isPhotoSection(value: unknown): value is PhotoSection {
  return typeof value === "string" && value in PHOTO_SECTIONS;
}
