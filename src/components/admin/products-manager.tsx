"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type CollectionItem = {
  id: string;
  name: string;
  slug: string;
};

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  collectionId: string;
  collection: CollectionItem;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

const INITIAL_FORM = {
  name: "",
  slug: "",
  description: "",
  price: "",
  imageUrl: "",
  collectionId: "",
};

export function AdminProductsManager() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const loadCollections = useCallback(async () => {
    const response = await fetch("/api/collections", {
      method: "GET",
      credentials: "include",
    });

    const payload = (await response.json()) as ApiResponse<CollectionItem[]>;

    if (!response.ok || !payload.success || !payload.data) {
      throw new Error(payload.error ?? "Não foi possível carregar coleções");
    }

    const collectionList = payload.data;
    setCollections(collectionList);

    if (collectionList.length > 0) {
      setForm((prev) => ({
        ...prev,
        collectionId: prev.collectionId || collectionList[0].id,
      }));
    }
  }, []);

  const loadProducts = useCallback(async () => {
    const response = await fetch("/api/products", {
      method: "GET",
      credentials: "include",
    });

    const payload = (await response.json()) as ApiResponse<ProductItem[]>;

    if (!response.ok || !payload.success || !payload.data) {
      throw new Error(payload.error ?? "Não foi possível carregar produtos");
    }

    setProducts(payload.data);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([loadCollections(), loadProducts()]);
    } catch (errorValue) {
      if (errorValue instanceof Error) {
        setError(errorValue.message);
      } else {
        setError("Erro ao carregar dados");
      }
    } finally {
      setLoading(false);
    }
  }, [loadCollections, loadProducts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function resetForm() {
    setEditingId(null);
    setForm((prev) => ({
      ...INITIAL_FORM,
      collectionId: collections[0]?.id ?? prev.collectionId,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = editingId
        ? `/api/products/${editingId}`
        : "/api/products";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          price: Number(form.price),
          imageUrl: form.imageUrl,
          collectionId: form.collectionId,
        }),
      });

      const payload = (await response.json()) as ApiResponse<ProductItem>;

      if (!response.ok || !payload.success) {
        setError(payload.error ?? "Não foi possível salvar o produto");
        return;
      }

      setSuccess(
        editingId
          ? "Produto atualizado com sucesso"
          : "Produto criado com sucesso",
      );
      resetForm();
      await loadProducts();
    } catch {
      setError("Erro de conexão ao salvar produto");
    } finally {
      setSaving(false);
    }
  }

  function handleStartEdit(item: ProductItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: item.price.toString(),
      imageUrl: item.imageUrl,
      collectionId: item.collectionId,
    });
    setError("");
    setSuccess("");
  }

  async function handleDelete(id: string) {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const payload = (await response.json()) as ApiResponse<{
        message: string;
      }>;

      if (!response.ok || !payload.success) {
        setError(payload.error ?? "Não foi possível remover o produto");
        return;
      }

      if (editingId === id) {
        resetForm();
      }

      setSuccess("Produto removido com sucesso");
      await loadProducts();
    } catch {
      setError("Erro de conexão ao remover produto");
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <article className="site-surface rounded-lg border site-border p-4">
        <h2 className="text-lg font-semibold">
          {isEditing ? "Editar produto" : "Novo produto"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium" htmlFor="product-name">
              Nome
            </label>
            <input
              id="product-name"
              required
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className="site-input mt-1 w-full rounded-md px-3 py-2 text-sm outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium" htmlFor="product-slug">
              Slug
            </label>
            <input
              id="product-slug"
              required
              value={form.slug}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, slug: event.target.value }))
              }
              className="site-input mt-1 w-full rounded-md px-3 py-2 text-sm outline-none"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium"
              htmlFor="product-description"
            >
              Descrição
            </label>
            <textarea
              id="product-description"
              required
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              className="site-input mt-1 min-h-24 w-full rounded-md px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium" htmlFor="product-price">
                Preço
              </label>
              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, price: event.target.value }))
                }
                className="site-input mt-1 w-full rounded-md px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label
                className="text-sm font-medium"
                htmlFor="product-collection"
              >
                Coleção
              </label>
              <select
                id="product-collection"
                required
                value={form.collectionId}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    collectionId: event.target.value,
                  }))
                }
                className="site-input mt-1 w-full rounded-md px-3 py-2 text-sm outline-none"
              >
                {collections.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium" htmlFor="product-image">
              URL da imagem
            </label>
            <input
              id="product-image"
              required
              value={form.imageUrl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, imageUrl: event.target.value }))
              }
              className="site-input mt-1 w-full rounded-md px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="site-btn rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {saving
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Criar produto"}
            </button>

            {isEditing ? (
              <button
                type="button"
                onClick={resetForm}
                className="site-btn-secondary rounded-md px-4 py-2 text-sm font-medium"
              >
                Cancelar edição
              </button>
            ) : null}
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? (
            <p className="text-sm text-emerald-600">{success}</p>
          ) : null}
        </form>
      </article>

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
                  onClick={() => handleStartEdit(item)}
                  className="site-btn-secondary rounded-md px-2 py-1 text-xs"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="site-btn-secondary rounded-md px-2 py-1 text-xs"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
