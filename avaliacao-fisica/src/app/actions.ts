'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { getStudent } from '@/db/queries';
import { assessments, students } from '@/db/schema';
import {
  assessmentSchema,
  fieldErrors,
  formToObject,
  studentSchema,
  type FieldErrors,
} from '@/lib/validation';
import { calcularAvaliacao } from '@/utils/calculations';

export interface FormState {
  errors?: FieldErrors;
  message?: string;
}

const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

function pgCode(e: unknown): string | undefined {
  const err = e as { code?: string; cause?: { code?: string } };
  return err.cause?.code ?? err.code;
}

export async function createStudent(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = studentSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: 'Revise os campos destacados.' };

  let id: string;
  try {
    [{ id }] = await db.insert(students).values(parsed.data).returning({ id: students.id });
  } catch (e) {
    if (pgCode(e) === '23505') return { errors: { email: 'E-mail já cadastrado' } };
    console.error(e);
    return { message: 'Não foi possível salvar o aluno. Tente novamente.' };
  }
  revalidatePath('/');
  redirect(`/alunos/${id}`);
}

export async function updateStudent(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  if (!isUuid(id)) return { message: 'Aluno não encontrado.' };
  const parsed = studentSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: 'Revise os campos destacados.' };

  try {
    const res = await db
      .update(students)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning({ id: students.id });
    if (res.length === 0) return { message: 'Aluno não encontrado.' };
  } catch (e) {
    if (pgCode(e) === '23505') return { errors: { email: 'E-mail já cadastrado' } };
    console.error(e);
    return { message: 'Não foi possível salvar o aluno. Tente novamente.' };
  }
  revalidatePath('/');
  revalidatePath(`/alunos/${id}`);
  redirect(`/alunos/${id}`);
}

export async function deleteStudent(id: string): Promise<void> {
  if (!isUuid(id)) return;
  await db.delete(students).where(eq(students.id, id)); // avaliações saem em cascata
  revalidatePath('/');
  redirect('/');
}

/** Valida e calcula os campos derivados; o servidor é a fonte da verdade. */
async function buildAssessmentValues(studentId: string, fd: FormData) {
  const student = await getStudent(studentId);
  if (!student) return { error: { message: 'Aluno não encontrado.' } as FormState };

  const parsed = assessmentSchema.safeParse(formToObject(fd));
  if (!parsed.success) {
    return { error: { errors: fieldErrors(parsed.error), message: 'Revise os campos destacados.' } as FormState };
  }
  const d = parsed.data;
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
  return {
    values: {
      ...d,
      imc: calc.imc,
      classificacaoImc: calc.classificacaoImc,
      percentualGordura: calc.percentualGordura,
      massaGorda: calc.massaGorda,
      massaMagra: calc.massaMagra,
    },
  };
}

export async function createAssessment(studentId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const built = await buildAssessmentValues(studentId, fd);
  if (built.error) return built.error;
  try {
    await db.insert(assessments).values({ ...built.values, studentId });
  } catch (e) {
    console.error(e);
    return { message: 'Não foi possível salvar a avaliação. Tente novamente.' };
  }
  revalidatePath(`/alunos/${studentId}`);
  revalidatePath('/');
  redirect(`/alunos/${studentId}`);
}

export async function updateAssessment(
  studentId: string,
  assessmentId: string,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  if (!isUuid(assessmentId)) return { message: 'Avaliação não encontrada.' };
  const built = await buildAssessmentValues(studentId, fd);
  if (built.error) return built.error;
  try {
    const res = await db
      .update(assessments)
      .set(built.values)
      .where(and(eq(assessments.id, assessmentId), eq(assessments.studentId, studentId)))
      .returning({ id: assessments.id });
    if (res.length === 0) return { message: 'Avaliação não encontrada.' };
  } catch (e) {
    console.error(e);
    return { message: 'Não foi possível salvar a avaliação. Tente novamente.' };
  }
  revalidatePath(`/alunos/${studentId}`);
  revalidatePath('/');
  redirect(`/alunos/${studentId}`);
}

export async function deleteAssessment(studentId: string, assessmentId: string): Promise<void> {
  if (!isUuid(studentId) || !isUuid(assessmentId)) return;
  await db.delete(assessments).where(and(eq(assessments.id, assessmentId), eq(assessments.studentId, studentId)));
  revalidatePath(`/alunos/${studentId}`);
  revalidatePath('/');
  redirect(`/alunos/${studentId}`);
}
