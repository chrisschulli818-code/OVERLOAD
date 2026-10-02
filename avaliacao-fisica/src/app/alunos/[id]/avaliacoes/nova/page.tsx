import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AssessmentForm } from '@/components/AssessmentForm';
import { connection } from 'next/server';
import { DbError } from '@/components/DbError';
import { getStudent } from '@/db/queries';
import type { Student } from '@/types';

export default async function NovaAvaliacao(props: PageProps<'/alunos/[id]/avaliacoes/nova'>) {
  await connection();
  const { id } = await props.params;
  let s: Student | null;
  try {
    s = await getStudent(id);
  } catch (e) {
    return <DbError error={e} />;
  }
  if (!s) notFound();
  return (
    <div className="space-y-6">
      <Link href={`/alunos/${s.id}`} className="text-sm text-muted hover:text-foreground">← {s.nome}</Link>
      <h1 className="text-2xl font-bold">Nova avaliação</h1>
      <AssessmentForm studentId={s.id} sexo={s.sexo} idade={s.idade} />
    </div>
  );
}
