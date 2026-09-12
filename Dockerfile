# ---------- build do frontend ----------
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---------- backend + imagem final ----------
FROM node:20-slim AS runtime
WORKDIR /app

# node:20-slim (Debian) não vem com libssl — os binários nativos da Prisma
# (schema engine/query engine) precisam disso, senão falham em runtime com
# um erro genérico ("Schema engine error:") sem detalhe nenhum.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# NODE_ENV=production só depois do build: se vier antes, o "npm ci" pula as
# devDependencies (typescript, prisma CLI) e o build quebra com "tsc: not found".
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production

COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 3333

# Aplica migrações pendentes (contra DIRECT_URL) e sobe o servidor. Banco é
# Postgres externo (Supabase) — não precisa de volume persistente aqui.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
