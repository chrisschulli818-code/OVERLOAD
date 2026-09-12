import path from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import multer from 'multer';
import { env } from './config/env';
import { adminRouter } from './routes/admin.routes';
import { authRouter } from './routes/auth.routes';
import { execucoesRouter } from './routes/execucoes.routes';
import { pdfRouter } from './routes/pdf.routes';
import { progressoRouter } from './routes/progresso.routes';
import { resumoSemanaRouter } from './routes/resumoSemana.routes';
import { treinosRouter } from './routes/treinos.routes';

const app = express();

// Necessário para cookies `secure` funcionarem atrás do proxy reverso
// do Railway/Render (que termina o TLS antes de repassar para o app).
app.set('trust proxy', 1);

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/treinos', treinosRouter);
app.use('/api/pdf', pdfRouter);
app.use('/api/execucoes', execucoesRouter);
app.use('/api/progresso', progressoRouter);
app.use('/api/resumo-semana', resumoSemanaRouter);

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof multer.MulterError || err instanceof Error) {
    if (res.headersSent) {
      return next(err);
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
};
app.use(errorHandler);

// Em produção, o build do frontend é copiado para ./public e servido
// pelo próprio backend — um único serviço para o deploy.
const pastaFrontend = path.join(__dirname, '../public');
app.use(express.static(pastaFrontend));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(pastaFrontend, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(env.port, () => {
  console.log(`Backend rodando em http://localhost:${env.port}`);
});
