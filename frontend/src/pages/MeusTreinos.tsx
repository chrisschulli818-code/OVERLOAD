import { AxiosError } from 'axios';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import * as treinosApi from '../api/treinos';
import { TreinoCard } from '../components/TreinoCard';
import { DIAS_SEMANA } from '../types/treino';
import type { DiaSemana, Treino } from '../types/treino';

function mensagemErro(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    return err.response?.data?.error ?? fallback;
  }
  return fallback;
}

export function MeusTreinos() {
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [novoDia, setNovoDia] = useState<DiaSemana>('Segunda');
  const [novoNome, setNovoNome] = useState('');
  const [criando, setCriando] = useState(false);

  const carregar = useCallback(async () => {
    const dados = await treinosApi.listarTreinos();
    setTreinos(dados);
  }, []);

  useEffect(() => {
    carregar()
      .catch((err) => setErro(mensagemErro(err, 'Erro ao carregar treinos.')))
      .finally(() => setCarregando(false));
  }, [carregar]);

  async function handleCriarTreino(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCriando(true);
    try {
      await treinosApi.criarTreino({ diaSemana: novoDia, nomeTreino: novoNome });
      setNovoNome('');
      await carregar();
    } catch (err) {
      setErro(mensagemErro(err, 'Erro ao criar treino.'));
    } finally {
      setCriando(false);
    }
  }

  const treinosOrdenados = [...treinos].sort(
    (a, b) => DIAS_SEMANA.indexOf(a.diaSemana) - DIAS_SEMANA.indexOf(b.diaSemana),
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Meus Treinos</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/treinos/importar-pdf"
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Importar de PDF
            </Link>
            <Link to="/" className="text-sm text-slate-400 hover:text-slate-100">
              ← Voltar
            </Link>
          </div>
        </header>

        {erro && <p className="text-red-400 text-sm">{erro}</p>}

        <form
          onSubmit={handleCriarTreino}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap gap-3 items-end"
        >
          <div className="space-y-1">
            <label className="text-sm text-slate-400">Dia da semana</label>
            <select
              value={novoDia}
              onChange={(e) => setNovoDia(e.target.value as DiaSemana)}
              className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-emerald-500"
            >
              {DIAS_SEMANA.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 flex-1 min-w-[200px]">
            <label className="text-sm text-slate-400">Nome do treino</label>
            <input
              required
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: Treino A - Peito e Tríceps"
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={criando}
            className="rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold px-4 py-2 transition"
          >
            {criando ? 'Criando...' : 'Novo treino'}
          </button>
        </form>

        {carregando ? (
          <p className="text-slate-400">Carregando...</p>
        ) : treinosOrdenados.length === 0 ? (
          <p className="text-slate-500">Nenhum treino cadastrado ainda.</p>
        ) : (
          <div className="space-y-4">
            {treinosOrdenados.map((treino) => (
              <TreinoCard
                key={treino.id}
                treino={treino}
                onAtualizarTreino={async (dados) => {
                  await treinosApi.atualizarTreino(treino.id, dados);
                  await carregar();
                }}
                onExcluirTreino={async () => {
                  await treinosApi.excluirTreino(treino.id);
                  await carregar();
                }}
                onAdicionarExercicio={async (dados) => {
                  await treinosApi.criarExercicio(treino.id, dados);
                  await carregar();
                }}
                onAtualizarExercicio={async (exercicioId, dados) => {
                  await treinosApi.atualizarExercicio(treino.id, exercicioId, dados);
                  await carregar();
                }}
                onExcluirExercicio={async (exercicioId) => {
                  await treinosApi.excluirExercicio(treino.id, exercicioId);
                  await carregar();
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
