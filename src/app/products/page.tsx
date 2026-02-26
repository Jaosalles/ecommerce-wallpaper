import { prisma } from "@/lib/prisma";
import { PaginationQueryControls } from "@/components/pagination-query-controls";
import { ProductsCatalogGrid } from "@/components/products-catalog-grid";

const PRODUCTS_PAGE_SIZE = 5;

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { page: pageParam } = await searchParams;
  const parsedPage = Number(pageParam ?? "1");
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const total = await prisma.product.count();
  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));
  const normalizedPage = Math.min(page, totalPages);
  const skip = (normalizedPage - 1) * PRODUCTS_PAGE_SIZE;

  const products = await prisma.product.findMany({
    include: {
      collection: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: PRODUCTS_PAGE_SIZE,
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="space-y-2">
        <p className="site-muted text-xs uppercase tracking-[0.2em]">
          Papel de parede
        </p>
        <h1 className="text-3xl font-semibold">Catálogo de Wallpapers</h1>
        <p className="site-muted max-w-2xl text-sm">
          Navegue pela coleção completa sem login. Escolha os itens e finalize
          no carrinho.
        </p>
      </header>

      <ProductsCatalogGrid products={products} />

      <PaginationQueryControls
        page={normalizedPage}
        totalPages={totalPages}
        buildHref={(nextPage) =>
          nextPage <= 1 ? "/products" : `/products?page=${nextPage}`
        }
      />
    </main>
  );
}
