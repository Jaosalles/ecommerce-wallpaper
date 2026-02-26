import { PaginationControls } from "@/components/pagination-controls";
import { ProductItem } from "@/components/admin/products-manager.shared";

type AdminProductsListProps = {
  loading: boolean;
  products: ProductItem[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (item: ProductItem) => void;
  onDelete: (item: ProductItem) => void;
};

export function AdminProductsList({
  loading,
  products,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: AdminProductsListProps) {
  return (
    <article className="site-surface rounded-lg border site-border p-4">
      <h2 className="text-lg font-semibold">Produtos cadastrados</h2>

      {loading ? (
        <p className="site-muted mt-3 text-sm">Carregando...</p>
      ) : null}

      {!loading && !products.length ? (
        <p className="site-muted mt-3 text-sm">Nenhum produto cadastrado.</p>
      ) : null}

      <ul className="mt-3 space-y-2">
        {products.map((item) => (
          <li
            key={item.id}
            className="site-surface-soft rounded-md border site-border p-3"
          >
            <p className="font-medium">{item.name}</p>
            <p className="site-muted text-xs">slug: {item.slug}</p>
            <p className="site-muted text-xs">
              coleção: {item.collection.name}
            </p>
            <p className="site-muted mt-1 text-xs">
              {item.price.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="site-btn-secondary rounded-md px-2 py-1 text-xs"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(item)}
                className="site-btn-secondary rounded-md px-2 py-1 text-xs"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        disabled={loading}
      />
    </article>
  );
}
