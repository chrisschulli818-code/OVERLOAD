export const ROLES = ['ADMIN', 'USER'] as const;
export type Role = (typeof ROLES)[number];

export const SEXOS = ['MASCULINO', 'FEMININO'] as const;
export type Sexo = (typeof SEXOS)[number];

export const GRUPOS_MUSCULARES = [
  'PEITO',
  'COSTAS',
  'OMBROS',
  'BICEPS',
  'TRICEPS',
  'ABDOMEN',
  'GLUTEOS',
  'QUADRICEPS',
  'POSTERIOR_COXA',
  'PANTURRILHA',
  'ANTEBRACO',
] as const;
export type GrupoMuscular = (typeof GRUPOS_MUSCULARES)[number];
