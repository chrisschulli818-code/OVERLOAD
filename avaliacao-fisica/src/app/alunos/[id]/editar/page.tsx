import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { DbError } from '@/components/DbError';
import { StudentForm } from '@/components/StudentForm';
import { getStudent } from '@/db/queries';
import type { Student } from '@/types';

export default async function EditarAluno(props: PageProps<'/alunos/[id]/editar'>) {
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
      <h1 className="text-2xl font-bold">Editar aluno</h1>
      <StudentForm initial={s} />
    </div>
  );
}
