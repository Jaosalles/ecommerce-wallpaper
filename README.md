# 🎨 E-Commerce Wallpaper Platform

Plataforma de e-commerce especializada em papéis de parede digitais com sistema de gestão de catálogo, pagamentos e distribuição online.

**Repositório:** [GitHub - ecommerce-wallpaper](https://github.com/seu-usuario/ecommerce-wallpaper)

---

## 📑 Índice

- [Visão Geral e Objetivos](#visão-geral-e-objetivos)
- [Stack Técnico](#stack-técnico)
- [Plano de Projeto](#plano-de-projeto)
- [Guia de Setup](#guia-de-setup)
- [Próximos Passos](#próximos-passos)
- [Notas Técnicas](#notas-técnicas)

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

| Camada          | Tecnologia            | Versão     |
| --------------- | --------------------- | ---------- |
| **Frontend**    | React + TypeScript    | 18.3 + 5.3 |
|                 | Tailwind CSS          | 3.4        |
|                 | Next.js App Router    | 14.x       |
| **Backend**     | Next.js API Routes    | 14.x       |
|                 | Node.js               | 20 LTS     |
| **Database**    | PostgreSQL (Supabase) | 15+        |
| **ORM**         | Prisma                | 5.x        |
| **Validação**   | Zod                   | 3.x        |
| **HTTP Client** | SWR                   | 2.2+       |
| **Auth**        | JWT + Bcrypt          | -          |
| **Hospedagem**  | Vercel                | -          |

---

## 🛠️ Setup Local

### Pré-requisitos

- Node.js 20 LTS
- npm 10+ ou yarn 4+
- Conta Supabase gratuita

### Passos

#### 1. Instalar Dependências (já feito)

```bash
npm install
```

#### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env.local
# Editar .env.local com suas credenciais Supabase
```

#### 3. Conectar Banco de Dados

```bash
# Criar conta em https://supabase.com
# Copiar DATABASE_URL para .env.local

# Rodar migrations
npx prisma migrate dev --name init

# Gerar cliente Prisma
npx prisma generate
```

#### 4. Iniciar Servidor

```bash
npm run dev
```

Acesse `http://localhost:3000` no navegador.

---

## 🎯 Próximos Passos

### ✅ Completado

- [x] Inicializar Next.js + TypeScript + Tailwind
- [x] Instalar dependências (Prisma, Zod, SWR, JWT, bcrypt)
- [x] Configurar Prisma schema
- [x] Criar estrutura de tipos TypeScript (simplificado sem resolutions)
- [x] Criar estrutura de pastas (lib, types, context, hooks, public/uploads)
- [x] Criar variáveis de ambiente (.env.example e .env.local)
- [x] Conectar Supabase - Conta criada e DATABASE_URL configurada
- [x] Rodar Migrations - Schema criado no banco com sucesso
- [x] Criar Seed Data - 2 usuários, 5 produtos, 1 pedido, 2 favoritos
- [x] Inicializar Git - Primeiro commit com estrutura base

### 📋 A Fazer (Fase 1)

1. [ ] **Implementar Autenticação JWT** - Login/Register/Logout
2. [ ] **Criar API Routes Base** - `/api/auth`, `/api/products`
3. [ ] **Implementar API de Produtos** - GET/POST/PUT/DELETE
4. [ ] **Implementar API de Carrinho** - GET/POST/DELETE
5. [ ] **Implementar API de Pedidos** - GET/POST
6. [ ] **Frontend Base** - Layout principal, header, footer
7. [ ] **Página de Produtos** - Listagem e filtros
8. [ ] **Página de Produto** - Detalhes e adicionar ao carrinho
9. [ ] **Carrinho de Compras** - Interface e lógica
10. [ ] **Checkout com WhatsApp** - Link e integração

---

## 📝 Notas Técnicas

### Por que Next.js Full-Stack?

- Uma única stack (Frontend + Backend)
- Deploy trivial com Vercel
- API Routes em `/app/api/`
- Type safety end-to-end com TypeScript

### Por que WhatsApp (não Business)?

- **Zero custo inicial** - Apenas um link
- **Zero setup** - Nenhuma aprovação
- **Relacionamento direto** - Conversa natural
- **MVP mais rápido**

### Por que Storage Local (não S3)?

- **MVP sem custos** - Usando `/public`
- **Suficiente para primeiros meses**
- **Fácil migrar depois** para S3

### Segurança

- JWT em httpOnly cookies
- Validação Zod em client e server
- Hash de senhas com bcrypt
- Secrets em variáveis de ambiente HTTPS obrigatório em produção

---

## 📊 Estrutura de Pastas

```
src/
├── app/
│   ├── api/              → API Routes (backend)
│   ├── (auth)/           → Páginas autenticação
│   ├── (dashboard)/     → Dashboard do usuário
│   └── page.tsx         → Home
├── components/          → Componentes React
├── context/             → React Context
├── hooks/               → Custom hooks
├── lib/                 → Funções utilitárias
│   ├── prisma.ts       → Cliente Prisma
│   ├── auth.ts         → Funções JWT
│   └── validators.ts   → Schemas Zod
├── types/               → TypeScript types
└── styles/              → CSS global
```

---

## 🚀 Próximas Fases

**Fase 1 (MVP - 4-6 semanas):** Core features

- Listagem de produtos
- Carrinho de compras
- Checkout WhatsApp
- Autenticação JWT

**Fase 2 (3-4 semanas):** Melhorias

- Favoritos/Wishlist
- Instagram Feed
- Sistema de cupons
- Performance otimizada

**Fase 3 (Pós-lançamento):** Escala

- AWS S3
- WhatsApp Business API
- Analytics avançado
- Multi-idioma
