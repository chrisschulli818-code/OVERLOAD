import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import * as execucoesApi from '../api/execucoes';
import * as treinosApi from '../api/treinos';
import { SerieRow } from '../components/SerieRow';
import { DIAS_SEMANA } from '../types/treino';
import type { DiaSemana, Treino } from '../types/treino';
import type { RegistroExecucao } from '../types/execucao';
import { dataDeHojeIso, diaSemanaDeHoje } from '../utils/data';

export function TreinoDoDia() {
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [registros, setRegistros] = useState<RegistroExecucao[]>([]);
  const [diaSelecionado, setDiaSelecionado] = useState<DiaSemana>(diaSemanaDeHoje());
  const [dataSelecionada, setDataSelecionada] = useState(dataDeHojeIso());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const [listaTreinos, listaRegistros] = await Promise.all([
      treinosApi.listarTreinos(),
      execucoesApi.listarExecucoesDoDia(dataSelecionada),
    ]);
    setTreinos(listaTreinos);
    setRegistros(listaRegistros);
  }, [dataSelecionada]);

  useEffect(() => {
    setCarregando(true);
    carregar()
      .catch(() => setErro('Erro ao carregar dados do treino.'))
      .finally(() => setCarregando(false));
  }, [carregar]);

  const treinosDoDia = useMemo(
    () => treinos.filter((t) => t.diaSemana === diaSelecionado),
    [treinos, diaSelecionado],
  );

  function registrosDoExercicio(exercicioId: string) {
    return registros.filter((r) => r.exercicioId === exercicioId);
  }

  async function handleSalvarSerie(
    exercicioId: string,
    serieNumero: number,
    dados: { repeticoesFeitas: number; pesoUsado: number },
  ) {
    setErro(null);
    try {
      await execucoesApi.registrarSerie({
        exercicioId,
        serieNumero,
        repeticoesFeitas: dados.repeticoesFeitas,
        pesoUsado: dados.pesoUsado,
        data: dataSelecionada,
      });
      await carregar();
    } catch {
      setErro('Erro ao registrar a série.');
    }
  }

  async function handleExcluirRegistro(id: string) {
    setErro(null);
    try {
      await execucoesApi.excluirExecucao(id);
      await carregar();
    } catch {
      setErro('Erro ao excluir o registro.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Treino do Dia</h1>
          <Link to="/" className="text-sm text-slate-400 hover:text-slate-100">
            ← Voltar
          </Link>
        </header>

        {erro && <p className="text-red-400 text-sm">{erro}</p>}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <label className="text-sm text-slate-400">Dia da semana</label>
            <select
              value={diaSelecionado}
              onChange={(e) => setDiaSelecionado(e.target.value as DiaSemana)}
              className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-emerald-500"
            >
              {DIAS_SEMANA.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-400">Data</label>
            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {carregando ? (
          <p className="text-slate-400">Carregando...</p>
        ) : treinosDoDia.length === 0 ? (
          <p className="text-slate-500">
            Nenhum treino cadastrado para {diaSelecionado}.{' '}
            <Link to="/treinos" className="text-emerald-400 hover:underline">
              Cadastrar treino
            </Link>
          </p>
        ) : (
          <div className="space-y-4">
            {treinosDoDia.map((treino) => (
              <div
                key={treino.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4"
              >
                <h2 className="text-lg font-semibold">{treino.nomeTreino}</h2>
                {treino.exercicios.map((exercicio) => {
                  const numSeries = exercicio.seriesPlanejadas ?? 3;
                  const registrosDoEx = registrosDoExercicio(exercicio.id);
                  return (
                    <div key={exercicio.id} className="space-y-2">
                      <h3 className="text-sm font-medium text-slate-200">
                        {exercicio.nome}
                        {exercicio.pesoPlanejado != null && (
                          <span className="text-slate-500 font-normal">
                            {' '}
                            (planejado: {exercicio.seriesPlanejadas ?? '—'}x
                            {exercicio.repeticoesPlanejadas ?? '—'} @ {exercicio.pesoPlanejado}kg)
                          </span>
                        )}
                      </h3>
                      <div className="space-y-1.5">
                        {Array.from({ length: numSeries }, (_, i) => i + 1).map((serieNumero) => (
                          <SerieRow
                            key={serieNumero}
                            serieNumero={serieNumero}
                            registro={registrosDoEx.find((r) => r.serieNumero === serieNumero)}
                            repeticoesPlanejadas={exercicio.repeticoesPlanejadas}
                            pesoPlanejado={exercicio.pesoPlanejado}
                            onSalvar={(dados) =>
                              handleSalvarSerie(exercicio.id, serieNumero, dados)
                            }
                            onExcluir={() => {
                              const registro = registrosDoEx.find(
                                (r) => r.serieNumero === serieNumero,
                              );
                              return registro
                                ? handleExcluirRegistro(registro.id)
                                : Promise.resolve();
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
