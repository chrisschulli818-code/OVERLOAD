import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import * as progressoApi from '../api/progresso';
import type { ExercicioProgresso, PontoProgresso } from '../types/progresso';

const PERIODOS = [
  { label: '30 dias', dias: 30 },
  { label: '90 dias', dias: 90 },
  { label: '180 dias', dias: 180 },
  { label: 'Tudo', dias: null },
] as const;

const COR_LINHA = '#34d399'; // emerald-400 — cor de destaque já usada em todo o app
const COR_GRADE = '#1e293b'; // slate-800 — hairline recessiva sobre o fundo escuro
const COR_EIXO = '#64748b'; // slate-500 — texto muted

function formatarDataEixo(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}

function TooltipPersonalizado({
  active,
  payload,
  label,
  sufixo,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  sufixo: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm">
      <p className="text-slate-400">{label}</p>
      <p className="text-slate-100 font-semibold">
        {payload[0].value}
        {sufixo}
      </p>
    </div>
  );
}

export function Progresso() {
  const [exercicios, setExercicios] = useState<ExercicioProgresso[]>([]);
  const [exercicioId, setExercicioId] = useState<string>('');
  const [periodoDias, setPeriodoDias] = useState<number | null>(90);
  const [pontos, setPontos] = useState<PontoProgresso[]>([]);
  const [carregandoExercicios, setCarregandoExercicios] = useState(true);
  const [carregandoPontos, setCarregandoPontos] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    progressoApi
      .listarExerciciosParaProgresso()
      .then((lista) => {
        setExercicios(lista);
        if (lista.length > 0) setExercicioId(lista[0].id);
      })
      .catch(() => setErro('Erro ao carregar exercícios.'))
      .finally(() => setCarregandoExercicios(false));
  }, []);

  const carregarPontos = useCallback(async () => {
    if (!exercicioId) return;
    setCarregandoPontos(true);
    setErro(null);
    try {
      const inicio =
        periodoDias != null
          ? new Date(Date.now() - periodoDias * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
          : undefined;
      const dados = await progressoApi.listarProgresso(exercicioId, inicio);
      setPontos(dados);
    } catch {
      setErro('Erro ao carregar progresso.');
    } finally {
      setCarregandoPontos(false);
    }
  }, [exercicioId, periodoDias]);

  useEffect(() => {
    carregarPontos();
  }, [carregarPontos]);

  const dadosGrafico = useMemo(
    () => pontos.map((p) => ({ ...p, dataLabel: formatarDataEixo(p.data) })),
    [pontos],
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Progressão por Exercício</h1>
          <Link to="/" className="text-sm text-slate-400 hover:text-slate-100">
            ← Voltar
          </Link>
        </header>

        {erro && <p className="text-red-400 text-sm">{erro}</p>}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap gap-4 items-end">
          <div className="space-y-1 flex-1 min-w-[220px]">
            <label className="text-sm text-slate-400">Exercício</label>
            {carregandoExercicios ? (
              <p className="text-slate-500 text-sm">Carregando...</p>
            ) : exercicios.length === 0 ? (
              <p className="text-slate-500 text-sm">
                Nenhum exercício cadastrado.{' '}
                <Link to="/treinos" className="text-emerald-400 hover:underline">
                  Cadastrar treino
                </Link>
              </p>
            ) : (
              <select
                value={exercicioId}
                onChange={(e) => setExercicioId(e.target.value)}
                className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-emerald-500"
              >
                {exercicios.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.nome} — {ex.treino.nomeTreino} ({ex.treino.diaSemana})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-1">
            {PERIODOS.map((p) => (
              <button
                key={p.label}
                onClick={() => setPeriodoDias(p.dias)}
                className={`rounded-md px-3 py-2 text-sm transition ${
                  periodoDias === p.dias
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {carregandoPontos ? (
          <p className="text-slate-400">Carregando gráfico...</p>
        ) : pontos.length === 0 ? (
          <p className="text-slate-500">
            Nenhum registro de execução para este exercício no período selecionado.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-300 mb-3">Peso máximo por dia (kg)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dadosGrafico} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={COR_GRADE} vertical={false} />
                  <XAxis
                    dataKey="dataLabel"
                    stroke={COR_EIXO}
                    tick={{ fill: COR_EIXO, fontSize: 12 }}
                    axisLine={{ stroke: COR_GRADE }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={COR_EIXO}
                    tick={{ fill: COR_EIXO, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip content={<TooltipPersonalizado sufixo="kg" />} />
                  <Line
                    type="monotone"
                    dataKey="pesoMaximo"
                    stroke={COR_LINHA}
                    strokeWidth={2}
                    dot={{ r: 4, fill: COR_LINHA, strokeWidth: 2, stroke: '#0f172a' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-300 mb-3">
                Volume total por dia (séries × reps × peso)
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dadosGrafico} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={COR_GRADE} vertical={false} />
                  <XAxis
                    dataKey="dataLabel"
                    stroke={COR_EIXO}
                    tick={{ fill: COR_EIXO, fontSize: 12 }}
                    axisLine={{ stroke: COR_GRADE }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={COR_EIXO}
                    tick={{ fill: COR_EIXO, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip content={<TooltipPersonalizado sufixo="kg" />} />
                  <Line
                    type="monotone"
                    dataKey="volumeTotal"
                    stroke={COR_LINHA}
                    strokeWidth={2}
                    dot={{ r: 4, fill: COR_LINHA, strokeWidth: 2, stroke: '#0f172a' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
