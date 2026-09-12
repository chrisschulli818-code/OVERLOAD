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
- [x] Passo 4: importação de PDF
  - Tela `/treinos/importar-pdf`: upload de PDF, extração de texto via
    `pdf-parse`, interpretação estruturada via API da Anthropic (Claude,
    saída estruturada com Zod) e tela de revisão/edição antes de salvar.
  - **Requer `ANTHROPIC_API_KEY` configurada em `backend/.env`** — sem ela,
    a extração retorna um erro amigável explicando o que falta configurar.
- [x] Passo 5: registro de execução diária
  - Tela `/treino-do-dia`: seleciona dia da semana e data, mostra os
    exercícios planejados com uma linha por série (pré-preenchida com o
    planejado), registra/atualiza (upsert) ou exclui o que foi feito.
- [x] Passo 6: gráfico de progressão
  - Tela `/progresso`: filtro por exercício e período (30/90/180 dias ou
    tudo), dois gráficos de linha (Recharts) de eixo único — peso máximo
    e volume total por dia — com tooltip ao passar o mouse.
- [x] Passo 7: boneco SVG de grupos musculares
  - Tela `/resumo-semana`: boneco SVG (frente + costas) que se adapta ao
    sexo do usuário, com cada grupo muscular colorido proporcionalmente
    ao volume (nº de séries) realizado na semana atual; tooltip ao
    passar o mouse e legenda com a contagem por grupo.
- [ ] Passo 8: teste ponta a ponta
