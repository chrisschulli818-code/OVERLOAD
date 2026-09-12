# Overload — App de Acompanhamento de Treinos

## Stack
- **Frontend**: React + Vite + TailwindCSS v4 + React Router + Recharts
- **Backend**: Node.js + Express + TypeScript
- **Banco**: SQLite via Prisma ORM
- **Auth**: JWT em cookie httpOnly

## Estrutura
```
backend/   # API Express + Prisma
frontend/  # SPA React (Vite)
```

## Como rodar localmente (Windows, sem WSL/Docker)

### Backend
```
cd backend
npm install
copy .env.example .env   # ajuste JWT_SECRET e ANTHROPIC_API_KEY
npm run prisma:migrate
npm run dev
```
Sobe em `http://localhost:3333`.

### Frontend
```
cd frontend
npm install
npm run dev
```
Sobe em `http://localhost:5173` (proxy `/api` -> backend na 3333).

## Status
Passo 1 (setup do projeto + Prisma) concluído. Próximos passos: autenticação
e sistema de códigos de admin, CRUD de treinos, importação de PDF, registro
de execução, gráficos de progressão e boneco SVG de grupos musculares.
