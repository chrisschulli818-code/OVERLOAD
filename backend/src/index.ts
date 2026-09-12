import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { adminRouter } from './routes/admin.routes';
import { authRouter } from './routes/auth.routes';
import { treinosRouter } from './routes/treinos.routes';

const app = express();

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/treinos', treinosRouter);

// As rotas de execuções, progresso e pdf
// serão registradas aqui nos próximos passos de implementação.

app.listen(env.port, () => {
  console.log(`Backend rodando em http://localhost:${env.port}`);
});
