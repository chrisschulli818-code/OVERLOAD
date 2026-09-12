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
- [x] Passo 1: setup do projeto + Prisma
- [x] Passo 2: autenticação + sistema de códigos de admin
  - Primeiro usuário cadastrado no sistema vira ADMIN automaticamente (bootstrap).
  - Demais cadastros exigem um código de convite válido gerado pelo admin.
  - Painel `/admin`: gerar códigos (com limite de usos e validade opcional),
    ver quais foram usados e por quem, e listar todos os usuários.
- [x] Passo 3: CRUD manual de treinos/exercícios
  - Tela `/treinos`: criar treino por dia da semana, adicionar/editar/excluir
    exercícios (nome, grupo muscular, séries, repetições, peso planejado).
  - Operações restritas ao dono do treino (ownership check no backend).
- [ ] Passo 4: importação de PDF
- [ ] Passo 5: registro de execução diária
- [ ] Passo 6: gráfico de progressão
- [ ] Passo 7: boneco SVG de grupos musculares
- [ ] Passo 8: teste ponta a ponta
