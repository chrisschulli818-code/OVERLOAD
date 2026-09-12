# Deploy no Railway

O app é publicado como **um único serviço**: o backend Express serve tanto a
API (`/api/*`) quanto os arquivos estáticos do frontend já buildado. O banco
é Postgres, hospedado no Supabase, num **schema isolado** (`overload`) dentro
do seu projeto existente — não usa o schema `public`, que tem tabelas de
outros apps seus.

## 0. Connection string do Supabase

Já preparei o banco: criei o schema `overload` e uma role dedicada
`overload_app` (com senha própria, sem acesso a nenhum outro schema do
projeto). Use a connection string do **pooler** (Supavisor) — é IPv4,
compatível com qualquer plataforma de deploy (a conexão "Direct" do
Supabase é IPv6-only, e nem todo provedor tem saída IPv6):

1. Acesse o [painel do Supabase](https://supabase.com/dashboard/project/lhghfuvkjueorksmnxyt) do projeto, clique em **Connect** e escolha o card **ORM**.
2. Selecione **Prisma** — ele mostra as duas strings já no formato certo (`DATABASE_URL` via pooler porta `6543`, `DIRECT_URL` via pooler porta `5432`).
3. Em ambas, troque `postgres.lhghfuvkjueorksmnxyt` pela role `overload_app.lhghfuvkjueorksmnxyt` (mantém o sufixo do projeto — o pooler exige isso pra rotear certo) e `[YOUR-PASSWORD]` pela senha da role (fornecida separadamente, fora deste repositório). Acrescente `&schema=overload` no final de cada uma.

```
DATABASE_URL="postgresql://overload_app.lhghfuvkjueorksmnxyt:SENHA@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=overload"
DIRECT_URL="postgresql://overload_app.lhghfuvkjueorksmnxyt:SENHA@aws-0-us-west-2.pooler.supabase.com:5432/postgres?schema=overload"
```

Se por algum motivo o pooler não funcionar, a alternativa é a conexão
direta (card **Direct** → host `db.lhghfuvkjueorksmnxyt.supabase.co`,
porta `5432`) — só funciona se a plataforma de deploy tiver saída IPv6.

## Passo a passo

1. **Criar o projeto no Railway**
   - Acesse [railway.app](https://railway.app) e faça login (dá pra usar sua conta do GitHub).
   - Clique em **New Project → Deploy from GitHub repo**.
   - Selecione o repositório `chrisschulli818-code/OVERLOAD`.
   - O Railway vai detectar o `Dockerfile` na raiz do projeto automaticamente e buildar a partir dele.

2. **Configurar as variáveis de ambiente**
   - No serviço, vá em **Variables** e adicione:

     | Variável | Valor |
     |---|---|
     | `DATABASE_URL` | a connection string montada no passo 0 |
     | `DIRECT_URL` | a mesma connection string do passo 0 |
     | `JWT_SECRET` | uma string aleatória longa e secreta (ex: gere com `openssl rand -hex 32`) |
     | `ANTHROPIC_API_KEY` | sua chave da Anthropic (para a importação de PDF funcionar) |
     | `FRONTEND_URL` | a URL pública do próprio serviço (veja o passo 3 — pode voltar aqui depois de gerá-la) |

   - **Não** defina `PORT` — o Railway injeta essa variável automaticamente e o app já lê `process.env.PORT`.
   - **Não precisa de Volume** desta vez — o banco já não é mais um arquivo local, é o Postgres do Supabase.

3. **Gerar o domínio público**
   - Vá em **Settings → Networking → Generate Domain**.
   - Copie a URL gerada (algo como `overload-production.up.railway.app`).
   - Volte em **Variables** e defina `FRONTEND_URL` com essa mesma URL (com `https://` na frente). Isso faz o Railway rebuildar/reiniciar automaticamente.

4. **Primeiro deploy**
   - O Railway já deve ter iniciado o build assim que o repositório foi conectado. Acompanhe em **Deployments**.
   - No start do container, o `Dockerfile` roda `npx prisma migrate deploy` automaticamente antes de subir o servidor. As tabelas já existem no Supabase (eu já apliquei a migração inicial direto no banco), então esse passo só confirma que está tudo sincronizado — não deve criar nada de novo.

5. **Acessar o app**
   - Abra a URL pública gerada no passo 3.
   - Cadastre o primeiro usuário — ele vira **administrador automaticamente** (bootstrap).
   - No painel de admin (`/admin`), gere códigos de convite para os demais usuários.

## Atualizações futuras

Todo `git push` para o branch conectado (`claude/workout-tracking-app-ojwgw1`, ou o branch que você configurar como padrão) dispara um novo deploy automático no Railway. Novas migrações de banco (se o schema mudar no futuro) rodam automaticamente no start do container via `prisma migrate deploy`.

## Alternativa: Render

Os mesmos arquivos (`Dockerfile`, `.dockerignore`) funcionam no Render:
- **New → Web Service → Build and deploy from a Git repository**.
- Runtime: **Docker** (detecta o `Dockerfile` automaticamente).
- As mesmas variáveis de ambiente do passo 2 acima (nenhum Disk/Volume necessário).
- O Render fornece a URL pública antes mesmo do primeiro deploy terminar (em **Settings**), então dá pra configurar `FRONTEND_URL` de uma vez.

## Rodando localmente com Docker (opcional, para testar antes de publicar)

```bash
docker build -t overload .
docker run -p 3333:3333 \
  -e DATABASE_URL="postgresql://overload_app.lhghfuvkjueorksmnxyt:SENHA@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=overload" \
  -e DIRECT_URL="postgresql://overload_app.lhghfuvkjueorksmnxyt:SENHA@aws-0-us-west-2.pooler.supabase.com:5432/postgres?schema=overload" \
  -e JWT_SECRET="segredo-de-teste" \
  -e FRONTEND_URL="http://localhost:3333" \
  overload
```

Depois acesse `http://localhost:3333`.
