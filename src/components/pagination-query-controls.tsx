import Link from "next/link";

type PaginationQueryControlsProps = {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
};

export function PaginationQueryControls({
  page,
  totalPages,
  buildHref,
}: PaginationQueryControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const previousPage = page - 1;
  const nextPage = page + 1;

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      {previousPage >= 1 ? (
        <Link
          href={buildHref(previousPage)}
          className="site-btn-secondary rounded-md px-3 py-2 text-sm font-medium"
        >
          Anterior
        </Link>
      ) : (
        <span className="site-btn-secondary rounded-md px-3 py-2 text-sm font-medium opacity-50">
          Anterior
        </span>
      )}

      <p className="site-muted text-xs">
        Página {page} de {totalPages}
      </p>

      {nextPage <= totalPages ? (
        <Link
          href={buildHref(nextPage)}
          className="site-btn-secondary rounded-md px-3 py-2 text-sm font-medium"
        >
          Próxima
        </Link>
      ) : (
        <span className="site-btn-secondary rounded-md px-3 py-2 text-sm font-medium opacity-50">
          Próxima
        </span>
      )}
    </div>
  );
}
