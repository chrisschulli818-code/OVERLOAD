import { Sexo, type Assessment, type Student } from '@/types';

const empty = { esquerdo: null, direito: null };
const noPhotos = { anterior: null, posterior: null, ladoEsquerdo: null, ladoDireito: null };

export const mockStudents: Student[] = [
  {
    id: 'a1', nome: 'Mariana Costa', idade: 29, sexo: Sexo.Feminino, contato: '(11) 98888-1234', email: 'mariana@email.com',
    jaTreinouAntes: true, tempoDeTreino: '2 anos', tempoSemAtividadeFisica: '6 meses', objetivo: 'Hipertrofia de glúteos e pernas',
    frequenciaSemanal: 4, tempoTreinoPorDia: '1h', temDoencaOuProblemaSaude: false, doencaOuProblemaSaudeDetalhe: null,
    temLimitacaoMovimento: false, limitacaoMovimentoDetalhe: null, temDorEmMovimento: true, dorEmMovimentoDetalhe: 'Joelho direito no agachamento profundo',
    fezCirurgias: false, cirurgiasDetalhe: null, usaMedicamentoControlado: false, medicamentoControladoDetalhe: null,
    estaFazendoDieta: true, consomeAlcool: true, fuma: false, createdAt: new Date('2026-03-02'), updatedAt: new Date('2026-03-02'),
  },
  {
    id: 'a2', nome: 'Rafael Almeida', idade: 35, sexo: Sexo.Masculino, contato: '(11) 97777-5678', email: 'rafael@email.com',
    jaTreinouAntes: false, tempoDeTreino: null, tempoSemAtividadeFisica: 'Mais de 5 anos', objetivo: 'Emagrecimento',
    frequenciaSemanal: 3, tempoTreinoPorDia: '45min', temDoencaOuProblemaSaude: true, doencaOuProblemaSaudeDetalhe: 'Hipertensão controlada',
    temLimitacaoMovimento: false, limitacaoMovimentoDetalhe: null, temDorEmMovimento: false, dorEmMovimentoDetalhe: null,
    fezCirurgias: true, cirurgiasDetalhe: 'Apendicectomia (2015)', usaMedicamentoControlado: true, medicamentoControladoDetalhe: 'Losartana',
    estaFazendoDieta: false, consomeAlcool: true, fuma: true, createdAt: new Date('2026-05-10'), updatedAt: new Date('2026-05-10'),
  },
];

const base = {
  circunferencias: {
    ombro: 108, torax: 98, cintura: 82, abdominal: 88, quadril: 102,
    bracoNormal: empty, bracoContraido: empty, antebraco: empty, coxa: empty, panturrilha: empty,
  },
  dobras: { triceps: 18, peito: 12, axilarMedia: 14, subescapular: 20, abdominal: 28, supraIliaca: 22, coxa: 26 },
  fotos: noPhotos, observacoes: null as string | null, createdAt: new Date(),
};

export const mockAssessments: Assessment[] = [
  { ...base, id: 'v1', studentId: 'a2', data: new Date('2026-05-12'), altura: 1.78, peso: 96.4, imc: 30.43, classificacaoImc: 'Obesidade Grau I', composicao: { massaMagra: 68.1, massaGorda: 28.3, percentualGordura: 29.4 } },
  { ...base, id: 'v2', studentId: 'a2', data: new Date('2026-07-14'), altura: 1.78, peso: 92.1, imc: 29.07, classificacaoImc: 'Sobrepeso', composicao: { massaMagra: 68.9, massaGorda: 23.2, percentualGordura: 25.2 } },
  { ...base, id: 'v3', studentId: 'a2', data: new Date('2026-09-15'), altura: 1.78, peso: 88.6, imc: 27.96, classificacaoImc: 'Sobrepeso', composicao: { massaMagra: 69.7, massaGorda: 18.9, percentualGordura: 21.3 } },
  { ...base, id: 'v4', studentId: 'a1', data: new Date('2026-03-05'), altura: 1.66, peso: 61.2, imc: 22.21, classificacaoImc: 'Peso normal', composicao: { massaMagra: 46.8, massaGorda: 14.4, percentualGordura: 23.5 } },
];
