import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { ClassificacaoIMC, Sexo } from '@/types';

const values = <T extends Record<string, string>>(o: T) =>
  Object.values(o) as [T[keyof T], ...T[keyof T][]];

export const sexoEnum = pgEnum('sexo', values(Sexo));
export const classificacaoImcEnum = pgEnum('classificacao_imc', values(ClassificacaoIMC));

export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: varchar('nome', { length: 150 }).notNull(),
  idade: integer('idade').notNull(),
  sexo: sexoEnum('sexo').notNull(),
  contato: varchar('contato', { length: 30 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),

  // Anamnese
  jaTreinouAntes: boolean('ja_treinou_antes').notNull().default(false),
  tempoDeTreino: text('tempo_de_treino'),
  tempoSemAtividadeFisica: text('tempo_sem_atividade_fisica'),
  objetivo: text('objetivo'),
  frequenciaSemanal: integer('frequencia_semanal'),
  tempoTreinoPorDia: text('tempo_treino_por_dia'),
  temDoencaOuProblemaSaude: boolean('tem_doenca_ou_problema_saude').notNull().default(false),
  doencaOuProblemaSaudeDetalhe: text('doenca_ou_problema_saude_detalhe'),
  temLimitacaoMovimento: boolean('tem_limitacao_movimento').notNull().default(false),
  limitacaoMovimentoDetalhe: text('limitacao_movimento_detalhe'),
  temDorEmMovimento: boolean('tem_dor_em_movimento').notNull().default(false),
  dorEmMovimentoDetalhe: text('dor_em_movimento_detalhe'),
  fezCirurgias: boolean('fez_cirurgias').notNull().default(false),
  cirurgiasDetalhe: text('cirurgias_detalhe'),
  usaMedicamentoControlado: boolean('usa_medicamento_controlado').notNull().default(false),
  medicamentoControladoDetalhe: text('medicamento_controlado_detalhe'),
  estaFazendoDieta: boolean('esta_fazendo_dieta').notNull().default(false),
  consomeAlcool: boolean('consome_alcool').notNull().default(false),
  fuma: boolean('fuma').notNull().default(false),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

const num = (name: string) => doublePrecision(name);

export const assessments = pgTable(
  'assessments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    data: date('data', { mode: 'date' }).notNull(),

    // IMC
    altura: num('altura'), // m
    peso: num('peso'), // kg
    imc: num('imc'),
    classificacaoImc: classificacaoImcEnum('classificacao_imc'),

    // Circunferências (cm)
    circOmbro: num('circ_ombro'),
    circTorax: num('circ_torax'),
    circCintura: num('circ_cintura'),
    circAbdominal: num('circ_abdominal'),
    circQuadril: num('circ_quadril'),
    circBracoNormalEsq: num('circ_braco_normal_esq'),
    circBracoNormalDir: num('circ_braco_normal_dir'),
    circBracoContraidoEsq: num('circ_braco_contraido_esq'),
    circBracoContraidoDir: num('circ_braco_contraido_dir'),
    circAntebracoEsq: num('circ_antebraco_esq'),
    circAntebracoDir: num('circ_antebraco_dir'),
    circCoxaEsq: num('circ_coxa_esq'),
    circCoxaDir: num('circ_coxa_dir'),
    circPanturrilhaEsq: num('circ_panturrilha_esq'),
    circPanturrilhaDir: num('circ_panturrilha_dir'),

    // Dobras cutâneas (mm)
    dobraTriceps: num('dobra_triceps'),
    dobraPeito: num('dobra_peito'),
    dobraAxilarMedia: num('dobra_axilar_media'),
    dobraSubescapular: num('dobra_subescapular'),
    dobraAbdominal: num('dobra_abdominal'),
    dobraSupraIliaca: num('dobra_supra_iliaca'),
    dobraCoxa: num('dobra_coxa'),

    // Composição corporal
    massaMagra: num('massa_magra'),
    massaGorda: num('massa_gorda'),
    percentualGordura: num('percentual_gordura'),

    // Fotos (URLs)
    fotoAnterior: text('foto_anterior'),
    fotoPosterior: text('foto_posterior'),
    fotoLadoEsquerdo: text('foto_lado_esquerdo'),
    fotoLadoDireito: text('foto_lado_direito'),

    observacoes: text('observacoes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('assessments_student_data_idx').on(t.studentId, t.data)],
);

export const studentsRelations = relations(students, ({ many }) => ({
  assessments: many(assessments),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  student: one(students, { fields: [assessments.studentId], references: [students.id] }),
}));
