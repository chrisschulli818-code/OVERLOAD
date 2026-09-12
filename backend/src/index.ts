import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { env } from './config/env';

const app = express();

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// As rotas de auth, admin, treinos, execuções, progresso e pdf
// serão registradas aqui nos próximos passos de implementação.

app.listen(env.port, () => {
  console.log(`Backend rodando em http://localhost:${env.port}`);
});
