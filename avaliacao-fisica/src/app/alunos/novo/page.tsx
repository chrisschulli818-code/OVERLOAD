import Link from 'next/link';
import { StudentForm } from '@/components/StudentForm';

export default function NovoAluno() {
  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-muted hover:text-foreground">← Alunos</Link>
      <h1 className="text-2xl font-bold">Novo aluno</h1>
      <StudentForm />
    </div>
  );
}
