import { useState } from 'react';
import { GRUPOS_MUSCULARES, GRUPO_MUSCULAR_LABEL, type Exercicio, type GrupoMuscular } from '../types/treino';
import type { DadosExercicio } from '../api/treinos';

export function ExercicioLinha({
  exercicio,
  onSalvar,
  onExcluir,
}: {
  exercicio: Exercicio;
  onSalvar: (dados: Partial<DadosExercicio>) => Promise<void>;
  onExcluir: () => Promise<void>;
}) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(exercicio.nome);
  const [grupoMuscular, setGrupoMuscular] = useState<GrupoMuscular | ''>(
    exercicio.grupoMuscular ?? '',
  );
  const [series, setSeries] = useState(exercicio.seriesPlanejadas ?? '');
  const [repeticoes, setRepeticoes] = useState(exercicio.repeticoesPlanejadas ?? '');
  const [peso, setPeso] = useState(exercicio.pesoPlanejado ?? '');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    try {
      await onSalvar({
        nome,
        grupoMuscular: grupoMuscular || undefined,
        seriesPlanejadas: series === '' ? undefined : Number(series),
        repeticoesPlanejadas: repeticoes === '' ? undefined : Number(repeticoes),
        pesoPlanejado: peso === '' ? undefined : Number(peso),
      });
      setEditando(false);
    } finally {
      setSalvando(false);
    }
  }

  if (!editando) {
    return (
      <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-800/50 text-sm">
        <div>
          <span className="font-medium">{exercicio.nome}</span>
          {exercicio.grupoMuscular && (
            <span className="ml-2 text-xs text-emerald-400">
              {GRUPO_MUSCULAR_LABEL[exercicio.grupoMuscular]}
            </span>
          )}
          <div className="text-slate-400 text-xs mt-0.5">
            {exercicio.seriesPlanejadas ?? '—'}x{exercicio.repeticoesPlanejadas ?? '—'}
            {exercicio.pesoPlanejado != null ? ` · ${exercicio.pesoPlanejado}kg` : ''}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setEditando(true)}
            className="text-slate-400 hover:text-slate-100 text-xs"
          >
            Editar
          </button>
          <button onClick={() => onExcluir()} className="text-red-400 hover:text-red-300 text-xs">
            Excluir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 border-b border-slate-800/50 space-y-2 text-sm">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do exercício"
        className="w-full rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 outline-none focus:border-emerald-500"
      />
      <div className="flex flex-wrap gap-2">
        <select
          value={grupoMuscular}
          onChange={(e) => setGrupoMuscular(e.target.value as GrupoMuscular)}
          className="rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 outline-none focus:border-emerald-500"
        >
          <option value="">Grupo muscular</option>
          {GRUPOS_MUSCULARES.map((g) => (
            <option key={g} value={g}>
              {GRUPO_MUSCULAR_LABEL[g]}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          value={series}
          onChange={(e) => setSeries(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="Séries"
          className="w-20 rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 outline-none focus:border-emerald-500"
        />
        <input
          type="number"
          min={0}
          value={repeticoes}
          onChange={(e) => setRepeticoes(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="Reps"
          className="w-20 rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 outline-none focus:border-emerald-500"
        />
        <input
          type="number"
          min={0}
          step="0.5"
          value={peso}
          onChange={(e) => setPeso(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="Peso (kg)"
          className="w-24 rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 outline-none focus:border-emerald-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={salvar}
          disabled={salvando}
          className="rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold px-3 py-1.5 text-xs"
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          onClick={() => setEditando(false)}
          className="rounded-md border border-slate-700 text-slate-300 px-3 py-1.5 text-xs"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
