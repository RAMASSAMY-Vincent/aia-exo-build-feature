'use server';
import { extractReviewsFromZip } from '@/lib/parse-takeout';
import {
  computeAverageRating,
  computeMonthlyTrend,
  type MonthlyTrend,
} from '@/lib/reviews';

export type ParseResult =
  | { ok: true; averageRating: number; totalReviews: number; trend: MonthlyTrend | null }
  | { ok: false; error: string };

export async function parseReviews(
  _prev: ParseResult | null,
  formData: FormData,
): Promise<ParseResult> {
  const file = formData.get('zip');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Choisis un fichier ZIP avant de lancer l’analyse.' };
  }
  try {
    const buffer = await file.arrayBuffer();
    const reviews = await extractReviewsFromZip(buffer);
    if (reviews.length === 0) {
      return {
        ok: false,
        error: 'Aucune review trouvée dans ce ZIP. Vérifie que c’est bien un export Google Takeout « Fiche d’établissement ».',
      };
    }
    return {
      ok: true,
      averageRating: computeAverageRating(reviews),
      totalReviews: reviews.length,
      trend: computeMonthlyTrend(reviews),
    };
  } catch {
    return {
      ok: false,
      error: 'Impossible de lire ce ZIP. Vérifie que c’est bien un export Google Takeout valide.',
    };
  }
}
