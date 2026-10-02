'use client';

/** Botão de exclusão com confirmação. `action` é uma Server Action já vinculada ao id. */
export function DeleteButton({ action, confirmText, children }: {
  action: () => Promise<void>;
  confirmText: string;
  children: React.ReactNode;
}) {
  return (
    <form action={action} onSubmit={(e) => { if (!window.confirm(confirmText)) e.preventDefault(); }}>
      <button type="submit" className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-500/10 dark:text-red-300">
        {children}
      </button>
    </form>
  );
}
