"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  Eye,
  AlertTriangle,
  Loader2,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/axios";

type Variant = {
  _id: string;
  size?: string;
  color?: string;
  design?: string;
  stock: number;
  price: number;
  isActive: boolean;
};

type Product = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  images?: string[];
  isActive: boolean;
  averageRating?: number;
  reviewCount?: number;
  category?: {
    _id: string;
    name: string;
  };
  variants?: Variant[];
};

const fallbackImage =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80";

const LOW_STOCK = 5;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const getToken = () => {
    if (typeof window === "undefined") return null;

    return (
      localStorage.getItem("vendorstore_token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token")
    );
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Authentication required.");
        return;
      }

      const response = await api.get("/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data?.data;

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (Array.isArray(data?.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch products:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load products. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStock = (product: Product) => {
    return (product.variants ?? []).reduce(
      (total, variant) => total + Number(variant.stock || 0),
      0,
    );
  };

  const getVariantCount = (product: Product) => {
    return product.variants?.length ?? 0;
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.slug?.toLowerCase().includes(query) ||
        product.category?.name?.toLowerCase().includes(query);

      const matchesStatus =
        status === "ALL" ||
        (status === "ACTIVE" && product.isActive) ||
        (status === "INACTIVE" && !product.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [products, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const totalStock = products.reduce(
    (sum, product) => sum + getStock(product),
    0,
  );

  const lowStockProducts = products.filter(
    (product) => getStock(product) <= LOW_STOCK,
  ).length;

  const activeProducts = products.filter((product) => product.isActive).length;

  const deleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeleting(product._id);

      const token = getToken();

      if (!token) {
        setError("Authentication required.");
        return;
      }

      await api.delete(`/products/${product._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts((current) =>
        current.filter((item) => item._id !== product._id),
      );
    } catch (err: any) {
      console.error("Failed to delete product:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to delete product. Please try again.",
      );
    } finally {
      setDeleting(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setPage(1);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-[#f85606]" />
          <p className="text-sm text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#f85606]">
            Catalog
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            Products
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage products, variants, pricing and inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchProducts}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 transition hover:border-[#f85606] hover:text-[#f85606]"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/admin/products/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#f85606] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#df4d03]"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

          <p className="flex-1 text-xs font-medium text-red-700">{error}</p>

          <button
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={products.length}
          icon={Package}
        />

        <StatCard label="Active Products" value={activeProducts} icon={Eye} />

        <StatCard label="Total Stock" value={totalStock} icon={Package} />

        <StatCard
          label="Low Stock"
          value={lowStockProducts}
          icon={AlertTriangle}
          warning={lowStockProducts > 0}
        />
      </div>

      {/* TOOLBAR */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search products, slug or category..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#f85606] focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((item) => (
              <button
                key={item}
                onClick={() => {
                  setStatus(item);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  status === item
                    ? "bg-orange-50 text-[#f85606]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item === "ALL"
                  ? "All"
                  : item === "ACTIVE"
                    ? "Active"
                    : "Inactive"}
              </button>
            ))}

            {(search || status !== "ALL") && (
              <button
                onClick={clearFilters}
                className="ml-1 text-xs font-bold text-gray-400 hover:text-red-500"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900">
              Product Catalog
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              {filteredProducts.length} product
              {filteredProducts.length === 1 ? "" : "s"} found
            </p>
          </div>
        </div>

        {paginatedProducts.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
              <Package className="h-6 w-6 text-[#f85606]" />
            </div>

            <h3 className="mt-4 text-sm font-extrabold text-gray-900">
              No products found
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-gray-400">
              {search
                ? "Try changing your search or filters."
                : "Your catalog does not contain any products yet."}
            </p>

            {!search && status === "ALL" && (
              <Link
                href="/admin/products/new"
                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#f85606] px-4 text-xs font-bold text-white hover:bg-[#df4d03]"
              >
                <Plus className="h-4 w-4" />
                Add First Product
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Product
                    </th>

                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Category
                    </th>

                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Variants
                    </th>

                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Stock
                    </th>

                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Price
                    </th>

                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {paginatedProducts.map((product) => {
                    const stock = getStock(product);

                    const image =
                      product.thumbnail || product.images?.[0] || fallbackImage;

                    const firstVariant = product.variants?.[0];

                    const price = firstVariant?.price ?? 0;

                    return (
                      <tr
                        key={product._id}
                        className="group transition hover:bg-gray-50/60"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                              <img
                                src={image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = fallbackImage;
                                }}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[220px] truncate text-xs font-bold text-gray-900">
                                {product.name}
                              </p>

                              <p className="mt-1 max-w-[220px] truncate text-[10px] text-gray-400">
                                /{product.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-xs font-medium text-gray-600">
                            {product.category?.name || "Uncategorized"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600">
                            {getVariantCount(product)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold ${
                                stock <= LOW_STOCK
                                  ? "text-red-600"
                                  : "text-gray-800"
                              }`}
                            >
                              {stock}
                            </span>

                            {stock <= LOW_STOCK && (
                              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-xs font-bold text-gray-800">
                            ${Number(price).toFixed(2)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge active={product.isActive} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/products/${product._id}`}
                              target="_blank"
                              title="View product"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>

                            <Link
                              href={`/admin/products/${product._id}`}
                              title="Edit product"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-orange-50 hover:text-[#f85606]"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>

                            <button
                              type="button"
                              title="Delete product"
                              disabled={deleting === product._id}
                              onClick={() => deleteProduct(product)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deleting === product._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-gray-100 md:hidden">
              {paginatedProducts.map((product) => {
                const stock = getStock(product);

                const image =
                  product.thumbnail || product.images?.[0] || fallbackImage;

                const price = product.variants?.[0]?.price ?? 0;

                return (
                  <div key={product._id} className="p-4">
                    <div className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = fallbackImage;
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-gray-900">
                              {product.name}
                            </h3>

                            <p className="mt-1 text-[10px] text-gray-400">
                              {product.category?.name || "Uncategorized"}
                            </p>
                          </div>

                          <StatusBadge active={product.isActive} />
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-[11px]">
                          <span className="text-gray-500">
                            Variants:{" "}
                            <b className="text-gray-800">
                              {getVariantCount(product)}
                            </b>
                          </span>

                          <span
                            className={
                              stock <= LOW_STOCK
                                ? "font-bold text-red-600"
                                : "text-gray-500"
                            }
                          >
                            Stock: <b>{stock}</b>
                          </span>

                          <span className="font-bold text-gray-800">
                            ${Number(price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                      <Link
                        href={`/products/${product._id}`}
                        target="_blank"
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-[11px] font-bold text-gray-600"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>

                      <Link
                        href={`/admin/products/${product._id}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-orange-50 px-3 text-[11px] font-bold text-[#f85606]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>

                      <button
                        type="button"
                        disabled={deleting === product._id}
                        onClick={() => deleteProduct(product)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 text-[11px] font-bold text-red-600 disabled:opacity-50"
                      >
                        {deleting === product._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* PAGINATION */}
        {filteredProducts.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
            <p className="text-xs text-gray-400">
              Page <span className="font-bold text-gray-700">{page}</span> of{" "}
              <span className="font-bold text-gray-700">{totalPages}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-[#f85606] hover:text-[#f85606] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-[#f85606] hover:text-[#f85606] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  warning = false,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          warning ? "bg-red-50" : "bg-orange-50"
        }`}
      >
        <Icon
          className={`h-4.5 w-4.5 ${
            warning ? "text-red-500" : "text-[#f85606]"
          }`}
        />
      </div>

      <p className="mt-4 text-[11px] font-semibold text-gray-500">{label}</p>

      <p className="mt-1 text-xl font-black text-gray-900">{value}</p>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
        active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
