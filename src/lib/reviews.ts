export type StarRating = 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';

export type Review = {
  reviewer: { displayName: string };
  starRating: StarRating;
  comment?: string;
  createTime: string;
};

const STAR_TO_NUMBER: Record<StarRating, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

export function starToNumber(s: StarRating): number {
  return STAR_TO_NUMBER[s];
}

export function computeAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + starToNumber(r.starRating), 0);
  return sum / reviews.length;
}

/**
 * Évolution du volume d'avis : dernier mois présent dans les données comparé au
 * mois calendaire précédent. La variante `none` (pas de mois précédent à
 * comparer) n'expose structurellement aucun pourcentage.
 */
export type MonthlyTrend =
  | {
      direction: 'none';
      latestYear: number;
      latestMonthIndex: number;
      latestCount: number;
    }
  | {
      direction: 'up' | 'down' | 'flat';
      latestYear: number;
      latestMonthIndex: number;
      latestCount: number;
      previousYear: number;
      previousMonthIndex: number;
      previousCount: number;
      deltaPercent: number;
    };

// Ordinal mois calendaire (année*12 + mois, 0-indexé) → décrémenter gère la
// bascule d'année : janvier (ord % 12 === 0) - 1 retombe sur décembre année-1.
function monthOrdinal(year: number, monthIndex: number): number {
  return year * 12 + monthIndex;
}

export function computeMonthlyTrend(reviews: Review[]): MonthlyTrend | null {
  const countByOrdinal = new Map<number, number>();
  for (const review of reviews) {
    const date = new Date(review.createTime);
    // createTime finit par « Z » : lecture en UTC pour un regroupement stable
    // quelle que soit la timezone de la machine. Dates invalides ignorées.
    if (Number.isNaN(date.getTime())) continue;
    const ordinal = monthOrdinal(date.getUTCFullYear(), date.getUTCMonth());
    countByOrdinal.set(ordinal, (countByOrdinal.get(ordinal) ?? 0) + 1);
  }

  if (countByOrdinal.size === 0) return null;

  const latestOrdinal = Math.max(...countByOrdinal.keys());
  const latestCount = countByOrdinal.get(latestOrdinal) ?? 0;
  const latestYear = Math.floor(latestOrdinal / 12);
  const latestMonthIndex = latestOrdinal % 12;

  const previousOrdinal = latestOrdinal - 1;
  const previousCount = countByOrdinal.get(previousOrdinal) ?? 0;

  // Aucun avis le mois précédent (gap dans l'historique ou mois unique) :
  // rien de significatif à comparer.
  if (previousCount === 0) {
    return { direction: 'none', latestYear, latestMonthIndex, latestCount };
  }

  const deltaPercent = Math.round(
    ((latestCount - previousCount) / previousCount) * 100,
  );
  const direction = deltaPercent > 0 ? 'up' : deltaPercent < 0 ? 'down' : 'flat';

  return {
    direction,
    latestYear,
    latestMonthIndex,
    latestCount,
    previousYear: Math.floor(previousOrdinal / 12),
    previousMonthIndex: previousOrdinal % 12,
    previousCount,
    deltaPercent,
  };
}

/** « mai 2026 » — formatage forcé en UTC pour rester déterministe. */
export function formatMonthLabel(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthIndex, 1)));
}
