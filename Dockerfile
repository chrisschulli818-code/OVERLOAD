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

# Aplica migrações pendentes e sobe o servidor. DATABASE_URL deve apontar
# para um caminho dentro de um volume persistente (ex: file:/data/prod.db)
# para o banco SQLite não ser perdido a cada deploy.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
