'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { getStudent } from '@/db/queries';
import { assessments, students } from '@/db/schema';
import { assessmentSchema, fieldErrors, formToObject, studentSchema, type FieldErrors } from '@/lib/validation';
import { calcularAvaliacao } from '@/utils/calculations';

export interface FormState {
  errors?: FieldErrors;
  message?: string;
}

export async function createStudent(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = studentSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: 'Revise os campos destacados.' };

  let id: string;
  try {
    [{ id }] = await db.insert(students).values(parsed.data).returning({ id: students.id });
  } catch (e) {
    const code = (e as { code?: string; cause?: { code?: string } }).cause?.code ?? (e as { code?: string }).code;
    if (code === '23505') return { errors: { email: 'E-mail já cadastrado' } };
    console.error(e);
    return { message: 'Não foi possível salvar o aluno. Tente novamente.' };
  }
  revalidatePath('/');
  redirect(`/alunos/${id}`);
}

export async function createAssessment(studentId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const student = await getStudent(studentId);
  if (!student) return { message: 'Aluno não encontrado.' };

  const parsed = assessmentSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: 'Revise os campos destacados.' };
  const d = parsed.data;

  // O servidor é a fonte da verdade para os valores calculados.
  const calc = calcularAvaliacao({
    altura: d.altura,
    peso: d.peso,
    sexo: student.sexo,
    idade: student.idade,
    dobras: {
      triceps: d.dobraTriceps, peito: d.dobraPeito, axilarMedia: d.dobraAxilarMedia, subescapular: d.dobraSubescapular,
      abdominal: d.dobraAbdominal, supraIliaca: d.dobraSupraIliaca, coxa: d.dobraCoxa,
    },
  });

  try {
    await db.insert(assessments).values({
      ...d,
      studentId,
      imc: calc.imc,
      classificacaoImc: calc.classificacaoImc,
      percentualGordura: calc.percentualGordura,
      massaGorda: calc.massaGorda,
      massaMagra: calc.massaMagra,
    });
  } catch (e) {
    console.error(e);
    return { message: 'Não foi possível salvar a avaliação. Tente novamente.' };
  }
  revalidatePath(`/alunos/${studentId}`);
  revalidatePath('/');
  redirect(`/alunos/${studentId}`);
}
