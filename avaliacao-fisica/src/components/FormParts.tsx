import type { ReactNode } from 'react';
import type { FormState } from '@/app/actions';

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-500">{error}</span>}
    </label>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  return <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{state.message}</p>;
}
