import { desc, eq, ilike, or } from 'drizzle-orm';
import { db } from './index';
import { assessments, students } from './schema';
import type { Assessment, Student } from '@/types';

type StudentRow = typeof students.$inferSelect;
type AssessmentRow = typeof assessments.$inferSelect;

export const toAssessment = (r: AssessmentRow): Assessment => ({
  id: r.id,
  studentId: r.studentId,
  data: r.data,
  altura: r.altura,
  peso: r.peso,
  imc: r.imc,
  classificacaoImc: r.classificacaoImc,
  circunferencias: {
    ombro: r.circOmbro, torax: r.circTorax, cintura: r.circCintura, abdominal: r.circAbdominal, quadril: r.circQuadril,
    bracoNormal: { esquerdo: r.circBracoNormalEsq, direito: r.circBracoNormalDir },
    bracoContraido: { esquerdo: r.circBracoContraidoEsq, direito: r.circBracoContraidoDir },
    antebraco: { esquerdo: r.circAntebracoEsq, direito: r.circAntebracoDir },
    coxa: { esquerdo: r.circCoxaEsq, direito: r.circCoxaDir },
    panturrilha: { esquerdo: r.circPanturrilhaEsq, direito: r.circPanturrilhaDir },
  },
  dobras: {
    triceps: r.dobraTriceps, peito: r.dobraPeito, axilarMedia: r.dobraAxilarMedia, subescapular: r.dobraSubescapular,
    abdominal: r.dobraAbdominal, supraIliaca: r.dobraSupraIliaca, coxa: r.dobraCoxa,
  },
  composicao: { massaMagra: r.massaMagra, massaGorda: r.massaGorda, percentualGordura: r.percentualGordura },
  fotos: { anterior: r.fotoAnterior, posterior: r.fotoPosterior, ladoEsquerdo: r.fotoLadoEsquerdo, ladoDireito: r.fotoLadoDireito },
  observacoes: r.observacoes,
  createdAt: r.createdAt,
});

const toStudent = (r: StudentRow): Student => r;

export interface StudentSummary {
  student: Student;
  last: Assessment | null;
  total: number;
}

export async function listStudents(search?: string): Promise<StudentSummary[]> {
  const term = search?.trim();
  const rows = await db.query.students.findMany({
    where: term ? or(ilike(students.nome, `%${term}%`), ilike(students.email, `%${term}%`)) : undefined,
    orderBy: students.nome,
    with: { assessments: { orderBy: desc(assessments.data) } },
  });
  return rows.map(({ assessments: list, ...s }) => ({
    student: toStudent(s),
    last: list[0] ? toAssessment(list[0]) : null,
    total: list.length,
  }));
}

export async function getStudent(id: string): Promise<Student | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const row = await db.query.students.findFirst({ where: eq(students.id, id) });
  return row ? toStudent(row) : null;
}

export async function listAssessments(studentId: string): Promise<Assessment[]> {
  const rows = await db.select().from(assessments).where(eq(assessments.studentId, studentId)).orderBy(desc(assessments.data));
  return rows.map(toAssessment);
}
