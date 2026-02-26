# 🎨 Implementation Plan — E-Commerce Wallpaper Platform

Plataforma de e-commerce especializada em papéis de parede digitais com sistema de gestão de catálogo, pagamentos e distribuição online.

---

## 🎯 Visão Geral e Objetivos

### Visão Geral

Desenvolvimento de uma plataforma de e-commerce moderna para comercialização de papéis de parede digitais em alta resolução, com suporte a diferentes resoluções de tela e sistemas operacionais.

### Objetivos Principais

- ✅ Criar plataforma de vendas escalável e responsiva
- ✅ Facilitar gerenciamento de catálogo de produtos
- ✅ Proporcionar experiência de usuário intuitiva
- ✅ Garantir segurança de dados e transações
- ✅ Permitir entrega digital instantânea dos produtos

---

## 💻 Stack Técnico

| Camada          | Tecnologia            | Versão |
| --------------- | --------------------- | ------ |
| **Frontend**    | React + TypeScript    | 19 + 5 |
|                 | Tailwind CSS          | 4.x    |
|                 | Next.js App Router    | 16.x   |
| **Backend**     | Next.js API Routes    | 16.x   |
|                 | Node.js               | 20 LTS |
| **Database**    | PostgreSQL (Supabase) | 15+    |
| **ORM**         | Prisma                | 5.x    |
| **Validação**   | Zod                   | 4.x    |
| **HTTP Client** | SWR                   | 2.x    |
| **Auth**        | JWT + Bcrypt          | -      |
| **Hospedagem**  | Vercel                | -      |

---

## 🛠️ Setup Local

### Pré-requisitos

- Node.js 20 LTS
- npm 10+
- Conta Supabase

### Passos

```bash
npm install
cp .env.example .env.local
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

Acesse `http://localhost:3000`.

---

## ✅ Progresso Atual

### Base já concluída

- [x] Inicializar Next.js + TypeScript + Tailwind
- [x] Instalar dependências principais
- [x] Configurar Prisma schema e migrações
- [x] Conectar Supabase
- [x] Criar seed data inicial
- [x] Estruturar pastas base do projeto

### Fase 1 (MVP)

1. [x] **Implementar Autenticação JWT** — login/register/logout/me
2. [x] **Criar API Routes Base** — `/api/auth`, `/api/products`
3. [x] **Implementar API de Produtos** — GET/POST/PUT/DELETE
4. [x] **Implementar API de Carrinho** — GET/POST/DELETE (`/api/cart`)
5. [x] **Implementar API de Pedidos** — GET/POST (`/api/orders`)
6. [x] **Frontend Base** — layout principal, header, footer
7. [~] **Página de Produtos** — listagem concluída, filtros pendentes
8. [x] **Página de Produto** — detalhes e adicionar ao carrinho
9. [x] **Carrinho de Compras** — interface e lógica local (localStorage)
10. [x] **Checkout com WhatsApp** — link e integração no carrinho

**Status da Fase 1:** concluída (10/10 itens completos).

---

## 📌 Entregas recentes (sprint atual)

- Rotas de autenticação com cookie `httpOnly`:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Rotas de produtos:
  - `GET /api/products`
  - `POST /api/products`
  - `GET /api/products/:id`
  - `PUT /api/products/:id`
  - `DELETE /api/products/:id`
- Rotas de carrinho:
  - `GET /api/cart`
  - `POST /api/cart`
  - `DELETE /api/cart`
- Rotas de pedidos:
  - `GET /api/orders`
  - `POST /api/orders`
- Integração frontend com backend:
  - Botão "Adicionar ao carrinho" usando `POST /api/cart`
  - Carrinho carregando de `GET /api/cart` e remoção via `DELETE /api/cart`
  - Checkout criando pedido em `POST /api/orders` com redirecionamento para WhatsApp
- Páginas frontend:
  - Home com layout de vitrine
  - Catálogo em `/products` (acesso público)
  - Detalhe em `/products/[slug]` com botão "Adicionar ao carrinho"
  - Carrinho em `/cart` com checkout via WhatsApp
  - Login e cadastro (`/login` e `/register`)

---

## 🚀 Próximos passos (curto prazo)

1. Adicionar filtros na listagem de produtos (categoria/busca)
2. Unificar estado de carrinho (cliente + backend) para usuários autenticados com merge no login
3. Evoluir status de pedido (`pending`, `paid`, `completed`) com ações administrativas
4. Criar página "Meus pedidos" consumindo `GET /api/orders`
5. Implementar confirmação visual de pedido após checkout
