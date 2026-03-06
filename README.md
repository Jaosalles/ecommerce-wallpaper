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

Variáveis mínimas para upload de imagens com Supabase Storage (backend):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

`SUPABASE_SERVICE_ROLE_KEY` deve ser usada apenas no backend (rotas API/server).

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
- ✅ Upload de imagens admin (`POST /api/uploads`)
- ✅ Frontend base (layout, home, catálogo e detalhe de produto)
- ⏳ Próximo: carrinho, pedidos e checkout por WhatsApp

## Upload de imagens (Supabase Storage)

Endpoint: `POST /api/uploads`

Regras:

- Rota protegida para `ADMIN`.
- Upload sempre via backend com `SUPABASE_SERVICE_ROLE_KEY`.
- Buckets suportados: `product-images` (público, 5MB) e `product-originals` (privado, 30MB).
- MIME types permitidos: `image/jpeg`, `image/png`, `image/webp`, `image/avif`.

Payload esperado (`multipart/form-data`):

- `file`: arquivo de imagem.
- `bucket` (opcional): `product-images` (default) ou `product-originals`.
- `productId`: id do produto existente (modo edição), ou
- `draftId`: id temporário de rascunho (modo criação).

Resposta de sucesso (`201`):

```json
{
  "success": true,
  "data": {
    "bucket": "product-images",
    "path": "products/<productId>/<uuid>.webp ou drafts/<draftId>/<uuid>.webp",
    "url": "https://...",
    "mimeType": "image/webp",
    "size": 123456
  }
}
```

Endpoint para remocao manual de arquivo: `DELETE /api/uploads`

Payload esperado (`application/json`):

```json
{
  "bucket": "product-images",
  "path": "products/<productId>/<uuid>.webp"
}
```

Obs:

- Ao atualizar `imageUrl` de um produto, a API de produtos tenta remover automaticamente a imagem antiga do Supabase Storage.
- Ao excluir produto, a API tambem tenta remover a imagem associada.
- Falhas de limpeza nao bloqueiam update/delete do produto.

## Documentação de implementação

Para roadmap detalhado e progresso por fase, veja [docs/implementation-plan.md](docs/implementation-plan.md).
