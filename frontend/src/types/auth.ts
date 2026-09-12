export type Role = 'ADMIN' | 'USER';
export type Sexo = 'MASCULINO' | 'FEMININO';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  sexo: Sexo | null;
  role: Role;
  criadoEm?: string;
}
