import { describe, expect, it } from 'vitest';
import {
  computeMonthlyTrend,
  formatMonthLabel,
  type Review,
} from './reviews';

// Seul `createTime` compte pour la tendance ; le reste est du remplissage.
function review(createTime: string): Review {
  return {
    reviewer: { displayName: 'Anon' },
    starRating: 'FIVE',
    createTime,
  };
}

// n avis dans un mois donné (jour arbitraire mais stable, milieu de mois UTC).
function monthly(isoMonth: string, count: number): Review[] {
  return Array.from({ length: count }, () => review(`${isoMonth}-15T12:00:00Z`));
}

describe('computeMonthlyTrend', () => {
  it('hausse : +100 % → up', () => {
    const trend = computeMonthlyTrend([
      ...monthly('2026-04', 2),
      ...monthly('2026-05', 4),
    ]);
    expect(trend).toMatchObject({
      direction: 'up',
      latestCount: 4,
      latestMonthIndex: 4,
      previousCount: 2,
      previousMonthIndex: 3,
      deltaPercent: 100,
    });
  });

  it('baisse : cas échantillon 4 → 3 = −25 % → down', () => {
    const trend = computeMonthlyTrend([
      ...monthly('2026-04', 4),
      ...monthly('2026-05', 3),
    ]);
    expect(trend).toMatchObject({
      direction: 'down',
      latestYear: 2026,
      latestMonthIndex: 4,
      latestCount: 3,
      previousYear: 2026,
      previousMonthIndex: 3,
      previousCount: 4,
      deltaPercent: -25,
    });
  });

  it('égalité : 4 → 4 = 0 % → flat', () => {
    const trend = computeMonthlyTrend([
      ...monthly('2026-04', 4),
      ...monthly('2026-05', 4),
    ]);
    expect(trend).toMatchObject({ direction: 'flat', deltaPercent: 0 });
  });

  it('mois précédent à 0 (gap) → none', () => {
    // Janvier puis mars : février est vide → rien à comparer.
    const trend = computeMonthlyTrend([
      ...monthly('2026-01', 5),
      ...monthly('2026-03', 2),
    ]);
    expect(trend).toEqual({
      direction: 'none',
      latestYear: 2026,
      latestMonthIndex: 2,
      latestCount: 2,
    });
  });

  it('mois unique → none', () => {
    const trend = computeMonthlyTrend(monthly('2026-05', 3));
    expect(trend).toEqual({
      direction: 'none',
      latestYear: 2026,
      latestMonthIndex: 4,
      latestCount: 3,
    });
  });

  it("bascule d'année : décembre 2025 → janvier 2026", () => {
    const trend = computeMonthlyTrend([
      ...monthly('2025-12', 2),
      ...monthly('2026-01', 5),
    ]);
    expect(trend).toMatchObject({
      direction: 'up',
      latestYear: 2026,
      latestMonthIndex: 0,
      previousYear: 2025,
      previousMonthIndex: 11,
      deltaPercent: 150,
    });
  });

  it('regroupement en UTC aux bornes de mois (indépendant de la TZ)', () => {
    // 00:30 UTC le 1er mars reste « mars » ; en TZ négative en heure locale ce
    // serait « février » → ce test échouerait si le code n'utilisait pas getUTC*.
    const trend = computeMonthlyTrend([
      review('2026-02-15T12:00:00Z'),
      review('2026-03-01T00:30:00Z'),
    ]);
    expect(trend).toMatchObject({
      latestMonthIndex: 2,
      previousMonthIndex: 1,
    });
  });

  it('ignore les dates invalides sans planter', () => {
    const trend = computeMonthlyTrend([
      review('pas-une-date'),
      ...monthly('2026-04', 2),
      ...monthly('2026-05', 2),
    ]);
    expect(trend).toMatchObject({ direction: 'flat', latestCount: 2 });
  });

  it('liste vide → null', () => {
    expect(computeMonthlyTrend([])).toBeNull();
  });

  it('que des dates invalides → null', () => {
    expect(computeMonthlyTrend([review('nope'), review('')])).toBeNull();
  });
});

describe('formatMonthLabel', () => {
  it('formate en français (UTC, déterministe)', () => {
    expect(formatMonthLabel(2026, 4)).toBe('mai 2026');
    expect(formatMonthLabel(2026, 3)).toBe('avril 2026');
    expect(formatMonthLabel(2025, 11)).toBe('décembre 2025');
  });
});
