import { formatMonthLabel, type MonthlyTrend } from '@/lib/reviews';

type Props = {
  averageRating: number;
  totalReviews: number;
  trend: MonthlyTrend | null;
};

// Pourcentage sans décimale : 0.25 → « 25 % » (espace insécable fr-FR).
const percentFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  maximumFractionDigits: 0,
});

const StarSvg = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9 shrink-0">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ArrowUpSvg = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden>
    <path d="M12 4l7 8h-4v8h-6v-8H5z" />
  </svg>
);

const ArrowDownSvg = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden>
    <path d="M12 20l7-8h-4V4h-6v8H5z" />
  </svg>
);

export function AverageRating({ averageRating, totalReviews, trend }: Props) {
  const fillPercent = (Math.max(0, Math.min(5, averageRating)) / 5) * 100;
  const formatted = averageRating.toLocaleString('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const suffix = totalReviews > 1 ? 'reçus' : 'reçu';

  return (
    <section className="flex flex-col items-center gap-6 rounded-card bg-paper-white p-10 text-center shadow-feature">
      <div className="flex items-baseline gap-2 font-medium leading-display-lg tracking-[-0.02em] text-ink-black">
        <span className="text-display-lg">{formatted}</span>
        <span className="text-subheading font-normal text-slate-gray">/ 5</span>
      </div>
      <div className="relative inline-flex" aria-label={`Note moyenne ${formatted} sur 5`}>
        <div className="flex gap-1.5 text-frost-gray">
          {[0, 1, 2, 3, 4].map((i) => (
            <StarSvg key={`bg-${i}`} />
          ))}
        </div>
        <div
          className="absolute inset-y-0 left-0 flex gap-1.5 overflow-hidden text-aia-blue"
          style={{ width: `${fillPercent}%` }}
          aria-hidden
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <StarSvg key={`fg-${i}`} />
          ))}
        </div>
      </div>
      <p className="text-body leading-body text-slate-gray">
        Calculée sur <span className="text-ink-black">{totalReviews}</span> avis Google {suffix}
      </p>
      {trend && (
        <div className="flex flex-col items-center gap-1 text-body leading-body text-slate-gray">
          <p>
            <span className="text-ink-black">{trend.latestCount}</span> avis en{' '}
            {formatMonthLabel(trend.latestYear, trend.latestMonthIndex)}
          </p>
          {trend.direction === 'none' ? (
            <p className="text-silver-mist">pas de mois précédent à comparer</p>
          ) : trend.direction === 'flat' ? (
            <p>
              stable vs {formatMonthLabel(trend.previousYear, trend.previousMonthIndex)}
            </p>
          ) : (
            <p>
              <span
                className={
                  trend.direction === 'up' ? 'text-signal-green' : 'text-signal-red'
                }
              >
                <span className="inline-flex items-center gap-1 font-medium align-middle">
                  {trend.direction === 'up' ? <ArrowUpSvg /> : <ArrowDownSvg />}
                  {trend.direction === 'up' ? '+' : '−'}
                  {percentFormatter.format(Math.abs(trend.deltaPercent) / 100)}
                </span>
              </span>{' '}
              vs {formatMonthLabel(trend.previousYear, trend.previousMonthIndex)}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
