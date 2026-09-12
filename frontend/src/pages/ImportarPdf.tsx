import { AxiosError } from 'axios';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { extrairFichaDePdf, salvarFicha } from '../api/pdf';
import { DIAS_SEMANA } from '../types/treino';
import type { DiaSemana } from '../types/treino';
import type { DiaExtraido, ExercicioExtraido, FichaExtraida } from '../types/importacao';

function mensagemErro(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    return err.response?.data?.error ?? fallback;
  }
  return fallback;
}

export function ImportarPdf() {
  const navigate = useNavigate();
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [ficha, setFicha] = useState<FichaExtraida | null>(null);
  const [extraindo, setExtraindo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function handleArquivoChange(e: ChangeEvent<HTMLInputElement>) {
    setArquivo(e.target.files?.[0] ?? null);
  }

  async function handleExtrair(e: FormEvent) {
    e.preventDefault();
    if (!arquivo) return;
    setErro(null);
    setExtraindo(true);
    try {
      const resultado = await extrairFichaDePdf(arquivo);
      setFicha(resultado);
    } catch (err) {
      setErro(mensagemErro(err, 'Erro ao extrair o PDF.'));
    } finally {
      setExtraindo(false);
    }
  }

  function atualizarDia(index: number, dados: Partial<DiaExtraido>) {
    if (!ficha) return;
    const dias = [...ficha.dias];
    dias[index] = { ...dias[index], ...dados };
    setFicha({ dias });
  }

  function removerDia(index: number) {
    if (!ficha) return;
    setFicha({ dias: ficha.dias.filter((_, i) => i !== index) });
  }

  function atualizarExercicio(diaIndex: number, exIndex: number, dados: Partial<ExercicioExtraido>) {
    if (!ficha) return;
    const dias = [...ficha.dias];
    const exercicios = [...dias[diaIndex].exercicios];
    exercicios[exIndex] = { ...exercicios[exIndex], ...dados };
    dias[diaIndex] = { ...dias[diaIndex], exercicios };
    setFicha({ dias });
  }

  function removerExercicio(diaIndex: number, exIndex: number) {
    if (!ficha) return;
    const dias = [...ficha.dias];
    dias[diaIndex] = {
      ...dias[diaIndex],
      exercicios: dias[diaIndex].exercicios.filter((_, i) => i !== exIndex),
    };
    setFicha({ dias });
  }

  function adicionarExercicio(diaIndex: number) {
    if (!ficha) return;
    const dias = [...ficha.dias];
    dias[diaIndex] = {
      ...dias[diaIndex],
      exercicios: [
        ...dias[diaIndex].exercicios,
        { nome: '', series: null, repeticoes: null, peso: null },
      ],
    };
    setFicha({ dias });
  }

  async function handleSalvar() {
    if (!ficha) return;
    setErro(null);
    setSalvando(true);
    try {
      await salvarFicha(ficha);
      navigate('/treinos');
    } catch (err) {
      setErro(mensagemErro(err, 'Erro ao salvar a ficha de treino.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Importar Treino via PDF</h1>
          <Link to="/treinos" className="text-sm text-slate-400 hover:text-slate-100">
            ← Voltar
          </Link>
        </header>

        {erro && <p className="text-red-400 text-sm">{erro}</p>}

        {!ficha && (
          <form
            onSubmit={handleExtrair}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4"
          >
            <p className="text-slate-400 text-sm">
              Envie o PDF da sua ficha de treino. O sistema vai extrair os dias, exercícios,
              séries, repetições e peso planejado automaticamente. Você poderá revisar e corrigir
              tudo antes de salvar.
            </p>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleArquivoChange}
              className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-slate-100 hover:file:bg-slate-700"
            />
            <button
              type="submit"
              disabled={!arquivo || extraindo}
              className="rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold px-4 py-2 transition"
            >
              {extraindo ? 'Extraindo...' : 'Extrair treino do PDF'}
            </button>
          </form>
        )}

        {ficha && (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-sm text-emerald-300">
              Revise os dados extraídos antes de salvar. A extração pode conter erros — corrija o
              que for necessário.
            </div>

            {ficha.dias.map((dia, diaIndex) => (
              <div
                key={diaIndex}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3"
              >
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex flex-wrap gap-2 items-center flex-1">
                    <select
                      value={dia.dia_semana}
                      onChange={(e) =>
                        atualizarDia(diaIndex, { dia_semana: e.target.value as DiaSemana })
                      }
                      className="rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                    >
                      {DIAS_SEMANA.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <input
                      value={dia.nome_treino}
                      onChange={(e) => atualizarDia(diaIndex, { nome_treino: e.target.value })}
                      className="flex-1 min-w-[180px] rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={() => removerDia(diaIndex)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Remover dia
                  </button>
                </div>

                <div className="space-y-2">
                  {dia.exercicios.map((ex, exIndex) => (
                    <div
                      key={exIndex}
                      className="flex flex-wrap gap-2 items-center bg-slate-800/50 rounded-md p-2"
                    >
                      <input
                        value={ex.nome}
                        onChange={(e) =>
                          atualizarExercicio(diaIndex, exIndex, { nome: e.target.value })
                        }
                        placeholder="Nome do exercício"
                        className="flex-1 min-w-[140px] rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                      />
                      <input
                        type="number"
                        min={0}
                        value={ex.series ?? ''}
                        onChange={(e) =>
                          atualizarExercicio(diaIndex, exIndex, {
                            series: e.target.value === '' ? null : Number(e.target.value),
                          })
                        }
                        placeholder="Séries"
                        className="w-20 rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                      />
                      <input
                        type="number"
                        min={0}
                        value={ex.repeticoes ?? ''}
                        onChange={(e) =>
                          atualizarExercicio(diaIndex, exIndex, {
                            repeticoes: e.target.value === '' ? null : Number(e.target.value),
                          })
                        }
                        placeholder="Reps"
                        className="w-20 rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        value={ex.peso ?? ''}
                        onChange={(e) =>
                          atualizarExercicio(diaIndex, exIndex, {
                            peso: e.target.value === '' ? null : Number(e.target.value),
                          })
                        }
                        placeholder="Peso (kg)"
                        className="w-24 rounded-md bg-slate-800 border border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => removerExercicio(diaIndex, exIndex)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                  {dia.exercicios.length === 0 && (
                    <p className="text-slate-500 text-sm">Nenhum exercício neste dia.</p>
                  )}
                </div>

                <button
                  onClick={() => adicionarExercicio(diaIndex)}
                  className="text-sm text-emerald-400 hover:text-emerald-300"
                >
                  + Adicionar exercício
                </button>
              </div>
            ))}

            {ficha.dias.length === 0 && (
              <p className="text-slate-500">Nenhum dia de treino restante para salvar.</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSalvar}
                disabled={salvando || ficha.dias.length === 0}
                className="rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold px-4 py-2 transition"
              >
                {salvando ? 'Salvando...' : 'Salvar treinos'}
              </button>
              <button
                onClick={() => {
                  setFicha(null);
                  setArquivo(null);
                }}
                className="rounded-md border border-slate-700 text-slate-300 px-4 py-2"
              >
                Cancelar e importar outro PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
