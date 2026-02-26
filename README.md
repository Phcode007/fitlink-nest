# FitLink API (NestJS)

API backend do FitLink com NestJS + Prisma + PostgreSQL.

## Requisitos

- Node.js 20+
- Banco PostgreSQL
- Variáveis de ambiente configuradas

## Variáveis de ambiente

Use `.env.example` como base. Variáveis principais:

- `PORT`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `DATABASE_URL`
- `DIRECT_URL`

## Rodando local

```bash
npm ci
npm run prisma:generate
npm run prisma:migrate -- --name init_fitlink
npm run start:dev
```

Swagger: `http://localhost:3000/docs`

## Testes

```bash
npm run test:e2e
```

## Deploy

### Render (Blueprint)

1. Suba o repositório com o arquivo `render.yaml`.
2. No Render, crie com **Blueprint** apontando para o repo.
3. Configure variáveis secretas:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `JWT_SECRET`
4. Deploy automático usará:
   - Build: `npm ci && npm run prisma:generate && npm run build`
   - Start: `npm run start:prod:deploy`

### Railway

1. Conecte o repositório no Railway.
2. O `railway.json` + `nixpacks.toml` já definem build/start.
3. Configure variáveis:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` (opcional, default `1d`)
4. Start command:
   - `npm run start:prod:deploy`

## Scripts úteis

- `npm run build`
- `npm run start:prod`
- `npm run start:prod:deploy` (migrate + start)
- `npm run prisma:deploy`

