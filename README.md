# 🎨 E-Commerce Wallpaper

E-commerce full-stack para venda de wallpapers digitais em alta resolução.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL (Supabase)
- JWT + bcrypt
- Zod

## Setup rápido

1. Instale as dependências:

```bash
npm install
```

2. Configure ambiente:

```bash
cp .env.example .env.local
```

3. Rode banco e prisma:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. Suba o projeto:

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Scripts úteis

- `npm run dev` — ambiente local
- `npm run lint` — lint
- `npm run build` — build de produção
- `npm run prisma:seed` — popular banco com dados de teste

## Status atual (Fase 1)

- ✅ Autenticação JWT (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`)
- ✅ API de produtos (`/api/products` e `/api/products/[id]`)
- ✅ Frontend base (layout, home, catálogo e detalhe de produto)
- ⏳ Próximo: carrinho, pedidos e checkout por WhatsApp

## Documentação de implementação

Para roadmap detalhado e progresso por fase, veja [docs/implementation-plan.md](docs/implementation-plan.md).
