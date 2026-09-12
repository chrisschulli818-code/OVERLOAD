import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function Home() {
  const [status, setStatus] = useState<'checando' | 'online' | 'offline'>('checando');

  useEffect(() => {
    api
      .get('/health')
      .then(() => setStatus('online'))
      .catch(() => setStatus('offline'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Overload — Acompanhamento de Treinos</h1>
      <p className="text-slate-400">
        Backend:{' '}
        <span
          className={
            status === 'online'
              ? 'text-emerald-400'
              : status === 'offline'
                ? 'text-red-400'
                : 'text-slate-400'
          }
        >
          {status}
        </span>
      </p>
    </div>
  );
}
