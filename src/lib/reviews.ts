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
