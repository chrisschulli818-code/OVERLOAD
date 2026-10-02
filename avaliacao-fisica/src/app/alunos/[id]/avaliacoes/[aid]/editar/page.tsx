import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { AssessmentForm } from '@/components/AssessmentForm';
import { DbError } from '@/components/DbError';
import { getAssessment, getStudent } from '@/db/queries';
import type { Assessment, Student } from '@/types';

export default async function EditarAvaliacao(props: PageProps<'/alunos/[id]/avaliacoes/[aid]/editar'>) {
  await connection();
  const { id, aid } = await props.params;
  let s: Student | null;
  let a: Assessment | null = null;
  try {
    s = await getStudent(id);
    if (s) a = await getAssessment(id, aid);
  } catch (e) {
    return <DbError error={e} />;
  }
  if (!s || !a) notFound();
  return (
    <div className="space-y-6">
      <Link href={`/alunos/${s.id}`} className="text-sm text-muted hover:text-foreground">← {s.nome}</Link>
      <h1 className="text-2xl font-bold">Editar avaliação</h1>
      <AssessmentForm studentId={s.id} sexo={s.sexo} idade={s.idade} initial={a} />
    </div>
  );
}
