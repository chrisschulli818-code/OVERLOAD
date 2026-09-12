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
ENV NODE_ENV=production

COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 3333

# Aplica migrações pendentes (contra DIRECT_URL) e sobe o servidor. Banco é
# Postgres externo (Supabase) — não precisa de volume persistente aqui.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
