import JSZip from 'jszip';
import type { Review } from './reviews';

export async function extractReviewsFromZip(buffer: ArrayBuffer): Promise<Review[]> {
  const zip = await JSZip.loadAsync(buffer);
  const reviewFiles = Object.values(zip.files).filter(
    (f) => !f.dir && /reviews.*\.json$/i.test(f.name),
  );
  const all: Review[] = [];
  for (const f of reviewFiles) {
    const raw = await f.async('string');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.reviews)) {
      all.push(...parsed.reviews);
    }
  }
  return all;
}
