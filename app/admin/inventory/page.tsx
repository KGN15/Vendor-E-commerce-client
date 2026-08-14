// app/admin/inventory/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Package,
  RefreshCw,
  Search,
} from "lucide-react";
import { api } from "@/lib/axios";

type Variant = {
  _id: string;
  product?: string | { _id: string; name?: string };
  category?: string | { _id: string; name?: string };
  size?: string;
  color?: string;
  design?: string;
  stock: number;
  price: number;
  barcode?: string;
  isActive?: boolean;
};

type Product = {
  _id: string;
  name: string;
  thumbnail?: string;
  images?: string[];
  category?: {
    _id: string;
    name: string;
  };
  variants?: Variant[];
};

type InventoryRow = Variant & {
  productName: string;
  productImage?: string;
  categoryName: string;
};

const LOW_STOCK = 5;

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<
    "all" | "in-stock" | "low" | "out"
  >("all");
  const [sort, setSort] = useState<"name" | "stock-low" | "stock-high">("name");
  const [page, setPage] = useState(1);

  const PER_PAGE = 10;

  const fetchInventory = async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      setError("");

      const response = await api.get("/products");

      const data = response?.data?.data;

      if (!Array.isArray(data)) {
        throw new Error("Invalid products response");
      }

      setProducts(data);
    } catch (err: any) {
      console.error("Failed to fetch inventory:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to load inventory.";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const inventory = useMemo<InventoryRow[]>(() => {
    return products.flatMap((product) =>
      (product.variants || []).map((variant) => ({
        ...variant,
        productName: product.name,
        productImage: product.thumbnail || product.images?.[0],
        categoryName: product.category?.name || "Uncategorized",
      })),
    );
  }, [products]);

  const stats = useMemo(() => {
    const totalUnits = inventory.reduce((sum, item) => sum + item.stock, 0);

    const lowStock = inventory.filter(
      (item) => item.stock > 0 && item.stock <= LOW_STOCK,
    ).length;

    const outOfStock = inventory.filter((item) => item.stock <= 0).length;

    return {
      variants: inventory.length,
      totalUnits,
      lowStock,
      outOfStock,
    };
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = inventory.filter((item) => {
      const matchesSearch =
        !query ||
        item.productName.toLowerCase().includes(query) ||
        item.categoryName.toLowerCase().includes(query) ||
        item.barcode?.toLowerCase().includes(query) ||
        item.color?.toLowerCase().includes(query) ||
        item.size?.toLowerCase().includes(query);

      let matchesStock = true;

      if (stockFilter === "in-stock") {
        matchesStock = item.stock > LOW_STOCK;
      }

      if (stockFilter === "low") {
        matchesStock = item.stock > 0 && item.stock <= LOW_STOCK;
      }

      if (stockFilter === "out") {
        matchesStock = item.stock <= 0;
      }

      return matchesSearch && matchesStock;
    });

    result.sort((a, b) => {
      if (sort === "stock-low") {
        return a.stock - b.stock;
      }

      if (sort === "stock-high") {
        return b.stock - a.stock;
      }

      return a.productName.localeCompare(b.productName);
    });

    return result;
  }, [inventory, search, stockFilter, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInventory.length / PER_PAGE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, stockFilter, sort]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin text-[#f85606]" />
          Loading inventory...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#f85606]">
            Stock Management
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
            Inventory
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor product stock and identify low-stock items.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchInventory(true)}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-[#f85606] hover:text-[#f85606] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">{error}</p>

          <button
            type="button"
            onClick={() => fetchInventory()}
            className="text-xs font-bold text-red-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Boxes className="h-5 w-5" />}
          label="Total Variants"
          value={stats.variants}
        />

        <StatCard
          icon={<Package className="h-5 w-5" />}
          label="Units in Stock"
          value={stats.totalUnits}
        />

        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Low Stock"
          value={stats.lowStock}
          warning
        />

        <StatCard
          icon={<Package className="h-5 w-5" />}
          label="Out of Stock"
          value={stats.outOfStock}
          danger
        />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, barcode, size or color..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <select
            value={stockFilter}
            onChange={(e) =>
              setStockFilter(e.target.value as typeof stockFilter)
            }
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none focus:border-[#f85606]"
          >
            <option value="all">All Stock</option>
            <option value="in-stock">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none focus:border-[#f85606]"
          >
            <option value="name">Product Name</option>
            <option value="stock-low">Stock: Low → High</option>
            <option value="stock-high">Stock: High → Low</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900">
              Inventory Items
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredInventory.length} variant
              {filteredInventory.length === 1 ? "" : "s"} found
            </p>
          </div>
        </div>

        {paginatedInventory.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <Boxes className="h-6 w-6 text-gray-400" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-gray-900">
              No inventory found
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Try changing your search or stock filter.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3">Product</th>
                    <th className="px-4 py-3">Variant</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Barcode</th>
                    <th className="px-4 py-3 text-center">Stock</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {paginatedInventory.map((item) => {
                    const isOut = item.stock <= 0;
                    const isLow = item.stock > 0 && item.stock <= LOW_STOCK;

                    return (
                      <tr
                        key={item._id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[220px] truncate text-sm font-bold text-gray-900">
                                {item.productName}
                              </p>

                              <p className="mt-0.5 text-[11px] text-gray-400">
                                ID: {item.product?.toString().slice(-8)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="space-y-1 text-xs text-gray-600">
                            {item.size && (
                              <span className="mr-1 rounded bg-gray-100 px-2 py-1">
                                Size: {item.size}
                              </span>
                            )}

                            {item.color && (
                              <span className="rounded bg-gray-100 px-2 py-1">
                                {item.color}
                              </span>
                            )}

                            {item.design && (
                              <p className="text-[11px] text-gray-400">
                                {item.design}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-xs text-gray-600">
                          {item.categoryName}
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-mono text-[11px] text-gray-500">
                            {item.barcode || "—"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              Out
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">
                              <AlertTriangle className="h-3 w-3" />
                              {item.stock}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              {item.stock}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-right text-sm font-bold text-gray-900">
                          ${Number(item.price || 0).toFixed(2)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/products/${typeof item.product === "string" ? item.product : item.product?._id}`}
                            className="text-xs font-bold text-[#f85606] hover:underline"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-bold text-gray-800">
                  {(currentPage - 1) * PER_PAGE + 1}
                </span>{" "}
                –{" "}
                <span className="font-bold text-gray-800">
                  {Math.min(currentPage * PER_PAGE, filteredInventory.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-800">
                  {filteredInventory.length}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-[#f85606] hover:text-[#f85606] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="min-w-16 text-center text-xs font-bold text-gray-700">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-[#f85606] hover:text-[#f85606] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  warning,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  warning?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          danger
            ? "bg-red-50 text-red-600"
            : warning
              ? "bg-orange-50 text-orange-600"
              : "bg-gray-100 text-gray-600"
        }`}
      >
        {icon}
      </div>

      <p className="mt-4 text-xs font-medium text-gray-500">{label}</p>

      <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>
    </div>
  );
}
