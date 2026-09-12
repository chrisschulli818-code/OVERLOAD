import { useState, type FormEvent } from 'react';
import { ExercicioLinha } from './ExercicioLinha';
import type { DadosExercicio } from '../api/treinos';
import { DIAS_SEMANA, GRUPOS_MUSCULARES, GRUPO_MUSCULAR_LABEL } from '../types/treino';
import type { DiaSemana, GrupoMuscular, Treino } from '../types/treino';

export function TreinoCard({
  treino,
  onAtualizarTreino,
  onExcluirTreino,
  onAdicionarExercicio,
  onAtualizarExercicio,
  onExcluirExercicio,
}: {
  treino: Treino;
  onAtualizarTreino: (dados: Partial<{ diaSemana: DiaSemana; nomeTreino: string }>) => Promise<void>;
  onExcluirTreino: () => Promise<void>;
  onAdicionarExercicio: (dados: DadosExercicio) => Promise<void>;
  onAtualizarExercicio: (exercicioId: string, dados: Partial<DadosExercicio>) => Promise<void>;
  onExcluirExercicio: (exercicioId: string) => Promise<void>;
}) {
  const [editandoTreino, setEditandoTreino] = useState(false);
  const [diaSemana, setDiaSemana] = useState<DiaSemana>(treino.diaSemana);
  const [nomeTreino, setNomeTreino] = useState(treino.nomeTreino);
  const [mostrarFormExercicio, setMostrarFormExercicio] = useState(false);

  async function salvarTreino() {
    await onAtualizarTreino({ diaSemana, nomeTreino });
    setEditandoTreino(false);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
      {editandoTreino ? (
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={diaSemana}
            onChange={(e) => setDiaSemana(e.target.value as DiaSemana)}
            className="rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
          >
            {DIAS_SEMANA.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input
            value={nomeTreino}
            onChange={(e) => setNomeTreino(e.target.value)}
            className="flex-1 min-w-[160px] rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
          />
          <button
            onClick={salvarTreino}
            className="rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3 py-1.5 text-xs"
          >
            Salvar
          </button>
          <button
            onClick={() => setEditandoTreino(false)}
            className="rounded-md border border-slate-700 text-slate-300 px-3 py-1.5 text-xs"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wide text-emerald-400">
              {treino.diaSemana}
            </span>
            <h3 className="text-lg font-semibold">{treino.nomeTreino}</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditandoTreino(true)}
              className="text-slate-400 hover:text-slate-100 text-xs"
            >
              Editar
            </button>
            <button
              onClick={() => onExcluirTreino()}
              className="text-red-400 hover:text-red-300 text-xs"
            >
              Excluir treino
            </button>
          </div>
        </div>
      )}

      <div>
        {treino.exercicios.map((ex) => (
          <ExercicioLinha
            key={ex.id}
            exercicio={ex}
            onSalvar={(dados) => onAtualizarExercicio(ex.id, dados)}
            onExcluir={() => onExcluirExercicio(ex.id)}
          />
        ))}
        {treino.exercicios.length === 0 && (
          <p className="text-slate-500 text-sm py-2">Nenhum exercício adicionado ainda.</p>
        )}
      </div>

      {mostrarFormExercicio ? (
        <FormNovoExercicio
          onCancelar={() => setMostrarFormExercicio(false)}
          onSalvar={async (dados) => {
            await onAdicionarExercicio(dados);
            setMostrarFormExercicio(false);
          }}
        />
      ) : (
        <button
          onClick={() => setMostrarFormExercicio(true)}
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          + Adicionar exercício
        </button>
      )}
    </div>
  );
}

function FormNovoExercicio({
  onSalvar,
  onCancelar,
}: {
  onSalvar: (dados: DadosExercicio) => Promise<void>;
  onCancelar: () => void;
}) {
  const [nome, setNome] = useState('');
  const [grupoMuscular, setGrupoMuscular] = useState<GrupoMuscular | ''>('');
  const [series, setSeries] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [peso, setPeso] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await onSalvar({
        nome,
        grupoMuscular: grupoMuscular || undefined,
        seriesPlanejadas: series === '' ? undefined : Number(series),
        repeticoesPlanejadas: repeticoes === '' ? undefined : Number(repeticoes),
        pesoPlanejado: peso === '' ? undefined : Number(peso),
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 bg-slate-800/50 rounded-md p-3">
      <input
        required
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do exercício"
        className="w-full rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
      />
      <div className="flex flex-wrap gap-2">
        <select
          value={grupoMuscular}
          onChange={(e) => setGrupoMuscular(e.target.value as GrupoMuscular)}
          className="rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
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
          onChange={(e) => setSeries(e.target.value)}
          placeholder="Séries"
          className="w-20 rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
        />
        <input
          type="number"
          min={0}
          value={repeticoes}
          onChange={(e) => setRepeticoes(e.target.value)}
          placeholder="Reps"
          className="w-20 rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
        />
        <input
          type="number"
          min={0}
          step="0.5"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          placeholder="Peso (kg)"
          className="w-24 rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold px-3 py-1.5 text-xs"
        >
          {salvando ? 'Adicionando...' : 'Adicionar'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-md border border-slate-700 text-slate-300 px-3 py-1.5 text-xs"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
