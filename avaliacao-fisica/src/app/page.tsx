import Link from 'next/link';
import { ImcBadge } from '@/components/ImcBadge';
import { mockAssessments, mockStudents } from '@/data/mock';

const fmt = new Intl.DateTimeFormat('pt-BR');

export default function Home() {
  const rows = mockStudents.map((s) => {
    const list = mockAssessments.filter((a) => a.studentId === s.id).sort((a, b) => +b.data - +a.data);
    return { s, last: list[0], total: list.length };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Alunos</h1>
          <p className="text-sm text-muted">{rows.length} alunos cadastrados</p>
        </div>
        <button className="btn">+ Novo aluno</button>
      </div>

      <input className="input max-w-sm" placeholder="Buscar por nome ou e-mail…" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ s, last, total }) => (
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
