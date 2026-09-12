import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const { usuario, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-3xl font-bold text-center">Overload — Acompanhamento de Treinos</h1>
      <p className="text-slate-400">Olá, {usuario?.nome}!</p>

      <div className="flex gap-3">
        {usuario?.role === 'ADMIN' && (
          <Link
            to="/admin"
            className="rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 transition"
          >
            Painel do Administrador
          </Link>
        )}
        <button
          onClick={() => logout()}
          className="rounded-md border border-slate-700 text-slate-300 hover:text-slate-100 px-4 py-2 transition"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
