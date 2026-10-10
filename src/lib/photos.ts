/**
 * Photos uploaded from the admin page. The image files themselves live in
 * Vercel Blob (needs BLOB_READ_WRITE_TOKEN – Project → Storage → create/
 * connect a Blob store), only the list of photos with captions and order
 * is kept in Redis next to the reservations.
 */

import { getJsonList, getJsonListSafe, setJsonList } from "./redis";
import type { Photo, PhotoSection } from "./photo-sections";

export { PHOTO_SECTIONS, isPhotoSection, type Photo, type PhotoSection } from "./photo-sections";

const REDIS_KEY = "chata-vresovice:photos";

export async function getPhotos(): Promise<Photo[]> {
  return getJsonList<Photo>(REDIS_KEY);
}

export async function savePhotos(photos: Photo[]) {
  await setJsonList(REDIS_KEY, photos);
}

/** Photos for one section in display order; empty if storage isn't set up. */
export async function getPublicPhotos(section: PhotoSection): Promise<Photo[]> {
  const photos = await getJsonListSafe<Photo>(REDIS_KEY);
  return photos.filter((p) => p.section === section);
}
