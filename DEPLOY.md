# Deploy no Railway

O app é publicado como **um único serviço**: o backend Express serve tanto a
API (`/api/*`) quanto os arquivos estáticos do frontend já buildado. O banco
continua sendo SQLite, persistido em um **Volume** do Railway (senão o banco
seria apagado a cada novo deploy).

## Passo a passo

1. **Criar o projeto no Railway**
   - Acesse [railway.app](https://railway.app) e faça login (dá pra usar sua conta do GitHub).
   - Clique em **New Project → Deploy from GitHub repo**.
   - Selecione o repositório `chrisschulli818-code/OVERLOAD`.
   - O Railway vai detectar o `Dockerfile` na raiz do projeto automaticamente e buildar a partir dele.

2. **Adicionar um Volume (obrigatório — sem isso o banco some a cada deploy)**
   - No serviço criado, vá em **Settings → Volumes → New Volume**.
   - Defina o **Mount Path** como `/data`.

3. **Configurar as variáveis de ambiente**
   - No serviço, vá em **Variables** e adicione:

     | Variável | Valor |
     |---|---|
     | `DATABASE_URL` | `file:/data/prod.db` |
     | `JWT_SECRET` | uma string aleatória longa e secreta (ex: gere com `openssl rand -hex 32`) |
     | `ANTHROPIC_API_KEY` | sua chave da Anthropic (para a importação de PDF funcionar) |
     | `FRONTEND_URL` | a URL pública do próprio serviço (veja o passo 4 — pode voltar aqui depois de gerá-la) |

   - **Não** defina `PORT` — o Railway injeta essa variável automaticamente e o app já lê `process.env.PORT`.

4. **Gerar o domínio público**
   - Vá em **Settings → Networking → Generate Domain**.
   - Copie a URL gerada (algo como `overload-production.up.railway.app`).
   - Volte em **Variables** e defina `FRONTEND_URL` com essa mesma URL (com `https://` na frente). Isso faz o Railway rebuildar/reiniciar automaticamente.

5. **Primeiro deploy**
   - O Railway já deve ter iniciado o build assim que o repositório foi conectado. Acompanhe em **Deployments**.
   - No start do container, o `Dockerfile` roda `npx prisma migrate deploy` automaticamente antes de subir o servidor — o banco SQLite é criado do zero em `/data/prod.db` na primeira vez.

6. **Acessar o app**
   - Abra a URL pública gerada no passo 4.
   - Cadastre o primeiro usuário — ele vira **administrador automaticamente** (bootstrap).
   - No painel de admin (`/admin`), gere códigos de convite para os demais usuários.

## Atualizações futuras

Todo `git push` para o branch conectado (`claude/workout-tracking-app-ojwgw1`, ou o branch que você configurar como padrão) dispara um novo deploy automático no Railway.

## Alternativa: Render

Os mesmos arquivos (`Dockerfile`, `.dockerignore`) funcionam no Render:
- **New → Web Service → Build and deploy from a Git repository**.
- Runtime: **Docker** (detecta o `Dockerfile` automaticamente).
- Adicione um **Disk** (equivalente ao Volume do Railway) montado em `/data`.
- As mesmas variáveis de ambiente do passo 3 acima.
- O Render fornece a URL pública antes mesmo do primeiro deploy terminar (em **Settings**), então dá pra configurar `FRONTEND_URL` de uma vez.

## Rodando localmente com Docker (opcional, para testar antes de publicar)

```bash
docker build -t overload .
docker run -p 3333:3333 \
  -e DATABASE_URL="file:/data/prod.db" \
  -e JWT_SECRET="segredo-de-teste" \
  -e FRONTEND_URL="http://localhost:3333" \
  -v overload_data:/data \
  overload
```

Depois acesse `http://localhost:3333`.
