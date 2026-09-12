import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import type { Role, Sexo } from '../types/constants';
import { CodigoInvalidoError, validarEConsumirCodigo } from './codigo.service';

const SALT_ROUNDS = 10;

export class CredenciaisInvalidasError extends Error {}
export class EmailJaCadastradoError extends Error {}

export function gerarToken(usuario: { id: string; role: string }) {
  return jwt.sign({ id: usuario.id, role: usuario.role as Role }, env.jwtSecret, {
    expiresIn: '7d',
  });
}

export async function registrarUsuario(params: {
  nome: string;
  email: string;
  senha: string;
  sexo?: Sexo;
  codigo?: string;
}) {
  const { nome, email, senha, sexo, codigo } = params;

  const emailExistente = await prisma.usuario.findUnique({ where: { email } });
  if (emailExistente) {
    throw new EmailJaCadastradoError('Este e-mail já está cadastrado.');
  }

  const totalUsuarios = await prisma.usuario.count();
  const isBootstrap = totalUsuarios === 0;

  let codigoValidado: Awaited<ReturnType<typeof validarEConsumirCodigo>> | null = null;
  if (!isBootstrap) {
    if (!codigo) {
      throw new CodigoInvalidoError('É necessário informar um código de acesso válido.');
    }
    codigoValidado = await validarEConsumirCodigo(codigo);
  }

  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senhaHash,
      sexo,
      role: isBootstrap ? 'ADMIN' : 'USER',
      codigoUsadoId: codigoValidado?.id,
    },
  });

  return usuario;
}

export async function autenticarUsuario(email: string, senha: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    throw new CredenciaisInvalidasError('E-mail ou senha inválidos.');
  }

  const senhaConfere = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaConfere) {
    throw new CredenciaisInvalidasError('E-mail ou senha inválidos.');
  }

  return usuario;
}
