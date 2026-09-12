export interface UsuarioResumo {
  id: string;
  nome: string;
  email: string;
}

export interface CodigoAcesso {
  id: string;
  codigo: string;
  criadoEm: string;
  expiraEm: string | null;
  limiteUsos: number;
  usosCount: number;
  criadoPor: UsuarioResumo;
  usadoPor: (UsuarioResumo & { criadoEm: string })[];
}

export interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  sexo: 'MASCULINO' | 'FEMININO' | null;
  role: 'ADMIN' | 'USER';
  criadoEm: string;
  codigoUsado: { codigo: string } | null;
}
