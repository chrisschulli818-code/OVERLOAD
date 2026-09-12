import { useState } from 'react';
import type { RegistroExecucao } from '../types/execucao';

export function SerieRow({
  serieNumero,
  registro,
  pesoPlanejado,
  repeticoesPlanejadas,
  onSalvar,
  onExcluir,
}: {
  serieNumero: number;
  registro?: RegistroExecucao;
  pesoPlanejado: number | null;
  repeticoesPlanejadas: number | null;
  onSalvar: (dados: { repeticoesFeitas: number; pesoUsado: number }) => Promise<void>;
  onExcluir: () => Promise<void>;
}) {
  const [repeticoes, setRepeticoes] = useState(
    registro?.repeticoesFeitas ?? repeticoesPlanejadas ?? 0,
  );
  const [peso, setPeso] = useState(registro?.pesoUsado ?? pesoPlanejado ?? 0);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    try {
      await onSalvar({ repeticoesFeitas: repeticoes, pesoUsado: peso });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-md p-2 ${
        registro ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800/50'
      }`}
    >
      <span className="w-16 text-sm text-slate-400">Série {serieNumero}</span>
      <input
        type="number"
        min={0}
        value={repeticoes}
        onChange={(e) => setRepeticoes(Number(e.target.value))}
        placeholder="Reps"
        className="w-20 rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
      />
      <span className="text-slate-500 text-sm">reps ×</span>
      <input
        type="number"
        min={0}
        step="0.5"
        value={peso}
        onChange={(e) => setPeso(Number(e.target.value))}
        placeholder="Peso"
        className="w-24 rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
      />
      <span className="text-slate-500 text-sm">kg</span>
      <button
        onClick={salvar}
        disabled={salvando}
        className="rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold px-3 py-1.5 text-xs ml-auto"
      >
        {salvando ? 'Salvando...' : registro ? 'Atualizar' : 'Registrar'}
      </button>
      {registro && (
        <button
          onClick={() => onExcluir()}
          className="text-red-400 hover:text-red-300 text-xs px-1"
        >
          Excluir
        </button>
      )}
    </div>
  );
}
