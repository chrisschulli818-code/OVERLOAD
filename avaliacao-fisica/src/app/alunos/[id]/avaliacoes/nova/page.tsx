import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AssessmentForm } from '@/components/AssessmentForm';
import { mockStudents } from '@/data/mock';

export default async function NovaAvaliacao(props: PageProps<'/alunos/[id]/avaliacoes/nova'>) {
  const { id } = await props.params;
  const s = mockStudents.find((x) => x.id === id);
  if (!s) notFound();
  return (
    <div className="space-y-6">
      <Link href={`/alunos/${s.id}`} className="text-sm text-muted hover:text-foreground">← {s.nome}</Link>
      <h1 className="text-2xl font-bold">Nova avaliação</h1>
      <AssessmentForm sexo={s.sexo} idade={s.idade} />
    </div>
  );
}
