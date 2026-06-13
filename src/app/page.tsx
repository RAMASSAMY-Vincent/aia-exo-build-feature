'use client';
import { useActionState } from 'react';
import { parseReviews, type ParseResult } from './actions';
import { AverageRating } from '@/components/average-rating';

export default function Home() {
  const [state, action, pending] = useActionState<ParseResult | null, FormData>(
    parseReviews,
    null,
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-12 px-6 py-16 sm:py-24">
      <header className="flex flex-col gap-4">
        <h1 className="text-heading-lg font-medium leading-heading-lg tracking-[-0.02em] text-ink-black">
          Analyse ton export Google&nbsp;Reviews
        </h1>
        <p className="text-body-lg leading-body-lg text-slate-gray">
          Upload ton export Takeout «&nbsp;Fiche d&rsquo;établissement Google&nbsp;» et obtiens immédiatement ta note moyenne globale.
        </p>
      </header>

      <form action={action} className="flex flex-col gap-4">
        <label htmlFor="zip" className="text-body font-medium text-ink-black">
          Fichier ZIP Google Takeout
        </label>
        <input
          id="zip"
          name="zip"
          type="file"
          accept=".zip,application/zip"
          required
          className="block w-full rounded-input border border-cloud-canvas bg-paper-white p-3 text-body text-ink-black outline-none transition focus:border-aia-blue focus:ring-2 focus:ring-aia-blue/30 file:mr-3 file:cursor-pointer file:rounded-pill file:border-0 file:bg-ink-black file:px-4 file:py-1.5 file:text-body file:font-medium file:text-paper-white"
        />
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-pill bg-aia-blue px-6 py-3 text-body-lg font-medium text-paper-white transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Analyse en cours…' : 'Analyser'}
        </button>
        {state && state.ok === false && (
          <p className="text-body text-signal-orange">{state.error}</p>
        )}
      </form>

      {state?.ok && (
        <AverageRating
          averageRating={state.averageRating}
          totalReviews={state.totalReviews}
        />
      )}
    </main>
  );
}
