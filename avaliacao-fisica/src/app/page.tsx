import Link from 'next/link';
import { connection } from 'next/server';
import { DbError } from '@/components/DbError';
import { ImcBadge } from '@/components/ImcBadge';
import { listStudents, type StudentSummary } from '@/db/queries';

const fmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

export default async function Home(props: PageProps<'/'>) {
  await connection();
  const sp = await props.searchParams;
  const q = typeof sp.q === 'string' ? sp.q : '';

  let rows: StudentSummary[];
  try {
    rows = await listStudents(q);
  } catch (e) {
    return <DbError error={e} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Alunos</h1>
          <p className="text-sm text-muted">{rows.length} {rows.length === 1 ? 'aluno' : 'alunos'}{q && ` para “${q}”`}</p>
        </div>
        <Link href="/alunos/novo" className="btn">+ Novo aluno</Link>
      </div>

      <form action="/" className="max-w-sm">
        <input name="q" defaultValue={q} className="input" placeholder="Buscar por nome ou e-mail…" />
      </form>

      {rows.length === 0 && (
        <p className="card text-sm text-muted">Nenhum aluno encontrado. Cadastre o primeiro em “Novo aluno”.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ student: s, last, total }) => (
          <Link key={s.id} href={`/alunos/${s.id}`} className="card block transition hover:border-accent">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-soft font-bold text-accent">
                {s.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{s.nome}</p>
                <p className="truncate text-xs text-muted">{s.idade} anos · {s.email}</p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div><dt className="text-xs text-muted">Peso</dt><dd className="font-semibold">{last?.peso ?? '—'} kg</dd></div>
              <div><dt className="text-xs text-muted">% Gordura</dt><dd className="font-semibold">{last?.composicao.percentualGordura ?? '—'}%</dd></div>
              <div><dt className="text-xs text-muted">Avaliações</dt><dd className="font-semibold">{total}</dd></div>
            </dl>
            <div className="mt-4 flex items-center justify-between">
              <ImcBadge value={last?.classificacaoImc ?? null} />
              <span className="text-xs text-muted">{last ? fmt.format(last.data) : 'Sem avaliação'}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
