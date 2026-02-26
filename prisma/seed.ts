import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Iniciando seed do banco...");

  // Limpar dados existentes
  await prisma.favorite.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Dados existentes removidos");

  // Criar usuários de teste
  const passwordHash = await bcrypt.hash("senha123", 10);

  const user1 = await prisma.user.create({
    data: {
      email: "joao@example.com",
      password: passwordHash,
      name: "João Pedro",
      phone: "5517981635657",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: passwordHash,
      name: "Admin",
      role: "ADMIN",
      phone: "5517987654321",
    },
  });

  console.log("👥 Usuários criados:", {
    user1: user1.email,
    user2: user2.email,
  });

  // Criar coleções
  const collectionDefinitions = [
    {
      name: "Coleção 1",
      slug: "colecao1",
      description: "Designs limpos e sofisticados para ambientes modernos",
    },
    {
      name: "Coleção 2",
      slug: "colecao2",
      description: "Tons suaves e acolhedores para quartos e salas",
    },
    {
      name: "Coleção 3",
      slug: "colecao3",
      description: "Composições escuras e elegantes com visual premium",
    },
    {
      name: "Coleção 4",
      slug: "colecao4",
      description: "Elementos naturais para trazer frescor ao ambiente",
    },
    {
      name: "Coleção 5",
      slug: "colecao5",
      description: "Formas e cores marcantes para ambientes criativos",
    },
    {
      name: "Coleção 6",
      slug: "colecao6",
      description: "Padronagens clássicas para ambientes atemporais",
    },
    {
      name: "Coleção 7",
      slug: "colecao7",
      description: "Texturas suaves inspiradas em tecidos e papéis",
    },
    {
      name: "Coleção 8",
      slug: "colecao8",
      description: "Cores vibrantes para espaços criativos e jovens",
    },
    {
      name: "Coleção 9",
      slug: "colecao9",
      description: "Estilo orgânico com composições naturais",
    },
    {
      name: "Coleção 10",
      slug: "colecao10",
      description: "Arte geométrica para ambientes contemporâneos",
    },
  ] as const;

  const collections = await Promise.all(
    collectionDefinitions.map((collection) =>
      prisma.collection.create({
        data: collection,
      }),
    ),
  );

  console.log("🗂️  Coleções criadas:", collections.length);

  // Criar produtos
  const productDefinitions = [
    {
      name: "Minimalista Preto",
      slug: "minimalista-preto",
      description:
        "Design minimalista em tons de preto e cinza, perfeito para ambientes modernos",
      price: 19.9,
      imageUrl: "/uploads/minimalista-preto.jpg",
    },
    {
      name: "Pastel Rosa",
      slug: "pastel-rosa",
      description: "Tons suaves de rosa e bege, ideal para quartos e salas",
      price: 24.9,
      imageUrl: "/uploads/pastel-rosa.jpg",
    },
    {
      name: "Dark Mode",
      slug: "dark-mode",
      description: "Papel de parede escuro com padrões abstratos",
      price: 29.9,
      imageUrl: "/uploads/dark-mode.jpg",
    },
    {
      name: "Floresta",
      slug: "floresta",
      description: "Imagem de floresta com verde vibrante",
      price: 34.9,
      imageUrl: "/uploads/floresta.jpg",
    },
    {
      name: "Abstracto Colorido",
      slug: "abstracto-colorido",
      description: "Design abstrato com cores vibrantes e geométricas",
      price: 39.9,
      imageUrl: "/uploads/abstract-colorido.jpg",
    },
    {
      name: "Aurora Azul",
      slug: "aurora-azul",
      description: "Composição em gradientes azuis para ambientes calmos",
      price: 21.9,
      imageUrl: "/uploads/aurora-azul.jpg",
    },
    {
      name: "Terracota Light",
      slug: "terracota-light",
      description: "Texturas terrosas modernas para decoração aconchegante",
      price: 27.9,
      imageUrl: "/uploads/terracota-light.jpg",
    },
    {
      name: "Geometric Gold",
      slug: "geometric-gold",
      description: "Formas geométricas com destaque dourado",
      price: 31.9,
      imageUrl: "/uploads/geometric-gold.jpg",
    },
    {
      name: "Folhas Tropicais",
      slug: "folhas-tropicais",
      description: "Folhagens tropicais com paleta vibrante",
      price: 36.9,
      imageUrl: "/uploads/folhas-tropicais.jpg",
    },
    {
      name: "Névoa Urbana",
      slug: "nevoa-urbana",
      description: "Visual urbano em tons neutros e sofisticados",
      price: 42.9,
      imageUrl: "/uploads/nevoa-urbana.jpg",
    },
  ] as const;

  const products = await Promise.all(
    productDefinitions.map((product, index) =>
      prisma.product.create({
        data: {
          ...product,
          collectionId: collections[index].id,
        },
      }),
    ),
  );

  console.log("📦 Produtos criados:", products.length);

  // Criar um pedido com items
  const order = await prisma.order.create({
    data: {
      userId: user1.id,
      total: products[0].price + products[1].price,
      status: "pending",
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            price: products[0].price,
          },
          {
            productId: products[1].id,
            quantity: 1,
            price: products[1].price,
          },
        ],
      },
    },
    include: { items: true },
  });

  console.log("📋 Pedido criado:", { id: order.id, status: order.status });

  // Criar favoritos
  await Promise.all([
    prisma.favorite.create({
      data: {
        userId: user1.id,
        productId: products[2].id,
      },
    }),
    prisma.favorite.create({
      data: {
        userId: user1.id,
        productId: products[3].id,
      },
    }),
  ]);

  console.log("❤️  Favoritos criados:", 2);

  console.log("✨ Seed concluído com sucesso!");

  // Resumo
  console.log("\n📊 Resumo da seed:");
  console.log(`   - Usuários: 2`);
  console.log(`   - Coleções: ${collections.length}`);
  console.log(`   - Produtos: ${products.length}`);
  console.log(`   - Pedidos: 1`);
  console.log(`   - Favoritos: 2`);
  console.log("\n👤 Credenciais de teste:");
  console.log(`   Email: ${user1.email}`);
  console.log(`   Senha: senha123`);
}

main()
  .catch((e) => {
    console.error("❌ Erro ao fazer seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
