import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Iniciando seed do banco...");

  // Limpar dados existentes
  await prisma.favorite.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
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
      phone: "5517987654321",
    },
  });

  console.log("👥 Usuários criados:", {
    user1: user1.email,
    user2: user2.email,
  });

  // Criar produtos
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Minimalista Preto",
        slug: "minimalista-preto",
        description:
          "Design minimalista em tons de preto e cinza, perfeito para ambientes modernos",
        price: 19.9,
        imageUrl: "/uploads/minimalista-preto.jpg",
        category: "Minimalista",
      },
    }),
    prisma.product.create({
      data: {
        name: "Pastel Rosa",
        slug: "pastel-rosa",
        description: "Tons suaves de rosa e bege, ideal para quartos e salas",
        price: 24.9,
        imageUrl: "/uploads/pastel-rosa.jpg",
        category: "Pastel",
      },
    }),
    prisma.product.create({
      data: {
        name: "Dark Mode",
        slug: "dark-mode",
        description: "Papel de parede escuro com padrões abstratos",
        price: 29.9,
        imageUrl: "/uploads/dark-mode.jpg",
        category: "Dark",
      },
    }),
    prisma.product.create({
      data: {
        name: "Floresta",
        slug: "floresta",
        description: "Imagem de floresta com verde vibrante",
        price: 34.9,
        imageUrl: "/uploads/floresta.jpg",
        category: "Natureza",
      },
    }),
    prisma.product.create({
      data: {
        name: "Abstracto Colorido",
        slug: "abstracto-colorido",
        description: "Design abstrato com cores vibrantes e geométricas",
        price: 39.9,
        imageUrl: "/uploads/abstract-colorido.jpg",
        category: "Abstrato",
      },
    }),
  ]);

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
  const favorite1 = await prisma.favorite.create({
    data: {
      userId: user1.id,
      productId: products[2].id,
    },
  });

  const favorite2 = await prisma.favorite.create({
    data: {
      userId: user1.id,
      productId: products[3].id,
    },
  });

  console.log("❤️  Favoritos criados:", 2);

  console.log("✨ Seed concluído com sucesso!");

  // Resumo
  console.log("\n📊 Resumo da seed:");
  console.log(`   - Usuários: 2`);
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
