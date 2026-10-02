import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ImcBadge } from '@/components/ImcBadge';
import { connection } from 'next/server';
import { DbError } from '@/components/DbError';
import { DeleteButton } from '@/components/DeleteButton';
import { EvolutionChart } from '@/components/EvolutionChart';
import { deleteAssessment, deleteStudent } from '@/app/actions';
import { getStudent, listAssessments } from '@/db/queries';
import type { Assessment, Student } from '@/types';

const fmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });
const yn = (v: boolean, detail?: string | null) => (v ? `Sim${detail ? ` — ${detail}` : ''}` : 'Não');

export default async function AlunoPage(props: PageProps<'/alunos/[id]'>) {
  await connection();
  const { id } = await props.params;
  let s: Student | null;
  let list: Assessment[];
  try {
    s = await getStudent(id);
    list = s ? await listAssessments(id) : [];
  } catch (e) {
    return <DbError error={e} />;
  }
  if (!s) notFound();
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

  const chrono = [...list].reverse();
  const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
  const series = (pick: (a: Assessment) => number | null) =>
    chrono.flatMap((a) => {
      const v = pick(a);
      return v === null ? [] : [{ label: shortDate.format(a.data), value: v }];
    });

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
        <div className="flex flex-wrap gap-2">
          <Link href={`/alunos/${s.id}/editar`} className="btn-ghost">Editar</Link>
          <DeleteButton action={deleteStudent.bind(null, s.id)} confirmText={`Excluir ${s.nome} e todas as avaliações? Esta ação não pode ser desfeita.`}>Excluir aluno</DeleteButton>
          <Link href={`/alunos/${s.id}/avaliacoes/nova`} className="btn">+ Nova avaliação</Link>
        </div>
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

      {list.length > 1 && (
        <div className="grid gap-4 md:grid-cols-2">
          <EvolutionChart title="Peso" unit="kg" points={series((a) => a.peso)} />
          <EvolutionChart title="% de gordura" unit="%" points={series((a) => a.composicao.percentualGordura)} />
        </div>
      )}

      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-semibold">Histórico de avaliações</h2>
        {list.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma avaliação registrada ainda.</p>
        ) : (
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-xs text-muted">
              <tr className="[&_th]:pb-2"><th>Data</th><th>Peso</th><th>IMC</th><th>Classificação</th><th>% Gordura</th><th>Massa magra</th><th></th></tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="py-2.5 font-medium">{fmt.format(a.data)}</td>
                  <td>{a.peso} kg</td><td>{a.imc}</td>
                  <td><ImcBadge value={a.classificacaoImc} /></td>
                  <td>{a.composicao.percentualGordura}%</td><td>{a.composicao.massaMagra} kg</td>
                  <td>
                    <div className="flex items-center justify-end gap-3 py-1.5">
                      <Link href={`/alunos/${s.id}/avaliacoes/${a.id}/editar`} className="text-xs font-medium text-accent hover:underline">Editar</Link>
                      <DeleteButton action={deleteAssessment.bind(null, s.id, a.id)} confirmText="Excluir esta avaliação?">Excluir</DeleteButton>
                    </div>
                  </td>
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
