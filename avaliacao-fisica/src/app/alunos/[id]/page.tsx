import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ImcBadge } from '@/components/ImcBadge';
import { mockAssessments, mockStudents } from '@/data/mock';

const fmt = new Intl.DateTimeFormat('pt-BR');
const yn = (v: boolean, detail?: string | null) => (v ? `Sim${detail ? ` — ${detail}` : ''}` : 'Não');

export default async function AlunoPage(props: PageProps<'/alunos/[id]'>) {
  const { id } = await props.params;
  const s = mockStudents.find((x) => x.id === id);
  if (!s) notFound();
  const list = mockAssessments.filter((a) => a.studentId === id).sort((a, b) => +b.data - +a.data);
  const last = list[0];
  const first = list[list.length - 1];

  const anamnese: [string, string][] = [
    ['Já treinou antes?', yn(s.jaTreinouAntes)],
    ['Treina há quanto tempo?', s.tempoDeTreino ?? '—'],
    ['Tempo sem atividade física', s.tempoSemAtividadeFisica ?? '—'],
    ['Objetivo', s.objetivo ?? '—'],
    ['Frequência semanal', s.frequenciaSemanal ? `${s.frequenciaSemanal}x` : '—'],
    ['Tempo de treino por dia', s.tempoTreinoPorDia ?? '—'],
    ['Doença/problema de saúde', yn(s.temDoencaOuProblemaSaude, s.doencaOuProblemaSaudeDetalhe)],
    ['Limitação de movimento', yn(s.temLimitacaoMovimento, s.limitacaoMovimentoDetalhe)],
    ['Dor em algum movimento', yn(s.temDorEmMovimento, s.dorEmMovimentoDetalhe)],
    ['Cirurgias', yn(s.fezCirurgias, s.cirurgiasDetalhe)],
    ['Medicamento controlado', yn(s.usaMedicamentoControlado, s.medicamentoControladoDetalhe)],
    ['Fazendo dieta', yn(s.estaFazendoDieta)],
    ['Consumo de álcool', yn(s.consomeAlcool)],
    ['Fuma', yn(s.fuma)],
  ];

  const delta = (a?: number | null, b?: number | null) =>
    a != null && b != null && list.length > 1 ? `${a - b > 0 ? '+' : ''}${(a - b).toFixed(1)}` : null;

  const stats = [
    ['Peso', last?.peso, 'kg', delta(last?.peso, first?.peso)],
    ['IMC', last?.imc, '', delta(last?.imc, first?.imc)],
    ['% Gordura', last?.composicao.percentualGordura, '%', delta(last?.composicao.percentualGordura, first?.composicao.percentualGordura)],
    ['Massa magra', last?.composicao.massaMagra, 'kg', delta(last?.composicao.massaMagra, first?.composicao.massaMagra)],
  ] as const;

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-muted hover:text-foreground">← Alunos</Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{s.nome}</h1>
          <p className="text-sm text-muted">{s.idade} anos · {s.contato} · {s.email}</p>
        </div>
        <Link href={`/alunos/${s.id}/avaliacoes/nova`} className="btn">+ Nova avaliação</Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, v, unit, d]) => (
          <div key={label} className="card">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 text-2xl font-bold">{v ?? '—'}<span className="ml-1 text-sm font-medium text-muted">{unit}</span></p>
            {d && <p className="mt-1 text-xs text-accent">{d} desde a 1ª avaliação</p>}
          </div>
        ))}
      </div>

      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-semibold">Histórico de avaliações</h2>
        {list.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma avaliação registrada ainda.</p>
        ) : (
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-xs text-muted">
              <tr><th className="pb-2">Data</th><th>Peso</th><th>IMC</th><th>Classificação</th><th>% Gordura</th><th>Massa magra</th></tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="py-2.5 font-medium">{fmt.format(a.data)}</td>
                  <td>{a.peso} kg</td><td>{a.imc}</td>
                  <td><ImcBadge value={a.classificacaoImc} /></td>
                  <td>{a.composicao.percentualGordura}%</td><td>{a.composicao.massaMagra} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold">Anamnese</h2>
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {anamnese.map(([q, a]) => (
            <div key={q} className="border-b border-border pb-2">
              <dt className="text-xs text-muted">{q}</dt><dd className="text-sm font-medium">{a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
