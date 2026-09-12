import { Router } from 'express';
import { z } from 'zod';
import {
  autenticarUsuario,
  CredenciaisInvalidasError,
  EmailJaCadastradoError,
  gerarToken,
  registrarUsuario,
} from '../services/auth.service';
import { CodigoInvalidoError } from '../services/codigo.service';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { SEXOS } from '../types/constants';

export const authRouter = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const registerSchema = z.object({
  nome: z.string().trim().min(2, 'Nome muito curto.'),
  email: z.string().trim().email('E-mail inválido.'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres.'),
  sexo: z.enum(SEXOS).optional(),
  codigo: z.string().trim().optional(),
});

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
  }

  try {
    const usuario = await registrarUsuario(parsed.data);
    const token = gerarToken(usuario);
    res.cookie('token', token, COOKIE_OPTIONS);
    return res.status(201).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      sexo: usuario.sexo,
      role: usuario.role,
    });
  } catch (err) {
    if (err instanceof EmailJaCadastradoError || err instanceof CodigoInvalidoError) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
});

const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido.'),
  senha: z.string().min(1, 'Senha obrigatória.'),
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
  }

  try {
    const usuario = await autenticarUsuario(parsed.data.email, parsed.data.senha);
    const token = gerarToken(usuario);
    res.cookie('token', token, COOKIE_OPTIONS);
    return res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      sexo: usuario.sexo,
      role: usuario.role,
    });
  } catch (err) {
    if (err instanceof CredenciaisInvalidasError) {
      return res.status(401).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: 'Erro ao autenticar.' });
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.status(204).send();
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.user!.id },
    select: { id: true, nome: true, email: true, sexo: true, role: true, criadoEm: true },
  });
  if (!usuario) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }
  return res.json(usuario);
});
