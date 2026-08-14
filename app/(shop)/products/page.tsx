"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { IProduct } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import {
  ArrowDownAZ,
  ArrowUpDown,
  Check,
  ChevronDown,
  Filter,
  Loader2,
  PackageSearch,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from "lucide-react";

type SortOption = "default" | "price-low" | "price-high" | "rating" | "name";

type Category = {
  _id: string;
  name: string;
  slug: string;
  prefix?: string;
};

function getProductPrice(product: IProduct): number {
  const variants = (product.variants || []).filter(
    (variant: any) => variant.isActive !== false,
  );
  if (!variants.length) return 0;
  return Math.min(
    ...variants.map((variant: any) => Number(variant.price) || 0),
  );
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const searchQuery = searchParams.get("search")?.trim().toLowerCase() || "";
  const categoryQuery = searchParams.get("category") || "";

  useEffect(() => {
    if (categoryQuery) setSelectedCategory(categoryQuery);
  }, [categoryQuery]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/products");
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.data || res.data?.products || [];

        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Could not load products from the server.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const categories = useMemo<Category[]>(() => {
    const map = new Map<string, Category>();

    products.forEach((product: any) => {
      const category = product.category;
      if (category && typeof category === "object" && category._id) {
        map.set(category._id, {
          _id: category._id,
          name: category.name || "Uncategorized",
          slug: category.slug || "",
          prefix: category.prefix,
        });
      }
    });

    return Array.from(map.values());
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      result = result.filter((product: any) => {
        const name = product.name?.toLowerCase() || "";
        const description = product.description?.toLowerCase() || "";
        const categoryName = product.category?.name?.toLowerCase() || "";
        const categorySlug = product.category?.slug?.toLowerCase() || "";
        const highlights = Array.isArray(product.highlights)
          ? product.highlights.join(" ").toLowerCase()
          : "";

        return (
          name.includes(searchQuery) ||
          description.includes(searchQuery) ||
          categoryName.includes(searchQuery) ||
          categorySlug.includes(searchQuery) ||
          highlights.includes(searchQuery)
        );
      });
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        (product: any) => product.category?._id === selectedCategory,
      );
    }

    if (minPrice.trim()) {
      const min = Number(minPrice);
      if (!Number.isNaN(min)) {
        result = result.filter((product) => getProductPrice(product) >= min);
      }
    }

    if (maxPrice.trim()) {
      const max = Number(maxPrice);
      if (!Number.isNaN(max)) {
        result = result.filter((product) => getProductPrice(product) <= max);
      }
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        break;
      case "price-high":
        result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        break;
      case "rating":
        result.sort(
          (a, b) =>
            (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0),
        );
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy, minPrice, maxPrice]);

  const clearFilters = () => {
    setSelectedCategory("all");
    setSortBy("default");
    setMinPrice("");
    setMaxPrice("");
    router.push(
      searchQuery
        ? `/products?search=${encodeURIComponent(searchQuery)}`
        : "/products",
    );
  };

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (sortBy !== "default" ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0);

  if (loading) {
    return (
      <>
        
        <main className="min-h-screen bg-[#fafafa]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-10 w-64 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-4 w-80 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                >
                  <div className="aspect-square animate-pulse bg-gray-200" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                    <div className="h-5 w-1/3 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        
      </>
    );
  }

  if (error) {
    return (
      <>

        <main className="min-h-screen bg-[#fafafa] px-4 py-20">
          <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white px-6 py-20 text-center shadow-sm">
            <PackageSearch className="mx-auto h-10 w-10 text-gray-400" />
            <h2 className="mt-5 text-xl font-black text-gray-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        </main>

      </>
    );
  }

  return (
    <>


      <main className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          {/* SEARCH STATE */}
          {searchQuery && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-orange-500" />
                <p className="text-sm text-gray-700">
                  Results for{" "}
                  <strong className="text-orange-500">“{searchQuery}”</strong>
                </p>
                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-gray-500">
                  {filteredProducts.length}
                </span>
              </div>
              <button
                onClick={() => router.push("/products")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900"
              >
                Clear search <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* MOBILE FILTER */}
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <p className="text-xs font-semibold text-gray-500">
              {filteredProducts.length} products
            </p>
          </div>

          <div className="grid gap-7 lg:grid-cols-[250px_1fr]">
            {/* SIDEBAR */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-orange-500" />
                    <h2 className="text-sm font-black text-gray-900">
                      Refine results
                    </h2>
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs font-bold text-orange-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="border-b border-gray-100 p-5">
                  <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Categories
                  </h3>

                  <div className="space-y-1">
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-gray-50">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === "all"}
                        onChange={() => setSelectedCategory("all")}
                        className="h-4 w-4 accent-orange-500"
                      />
                      <span className="font-medium text-gray-700">
                        All products
                      </span>
                      <span className="ml-auto text-[11px] text-gray-400">
                        {products.length}
                      </span>
                    </label>

                    {categories.map((category) => {
                      const count = products.filter(
                        (product: any) =>
                          product.category?._id === category._id,
                      ).length;

                      return (
                        <label
                          key={category._id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === category._id}
                            onChange={() => setSelectedCategory(category._id)}
                            className="h-4 w-4 accent-orange-500"
                          />
                          <span className="truncate font-medium text-gray-700">
                            {category.name}
                          </span>
                          <span className="ml-auto text-[11px] text-gray-400">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="border-b border-gray-100 p-5">
                  <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Price range
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        ৳
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Min"
                        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-6 pr-2 text-xs text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        ৳
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Max"
                        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-6 pr-2 text-xs text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Quick sort
                  </h3>

                  {[
                    ["rating", "Top rated", Star],
                    ["price-low", "Price: low to high", ArrowUpDown],
                    ["price-high", "Price: high to low", ArrowUpDown],
                  ].map(([value, label, Icon]: any) => (
                    <button
                      key={value}
                      onClick={() => setSortBy(value)}
                      className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold ${
                        sortBy === value
                          ? "bg-orange-50 text-orange-500"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* PRODUCTS */}
            <section>
              <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="px-1 text-sm text-gray-500">
                  Showing{" "}
                  <strong className="font-black text-gray-900">
                    {filteredProducts.length}
                  </strong>{" "}
                  of{" "}
                  <strong className="font-black text-gray-900">
                    {products.length}
                  </strong>{" "}
                  products
                </p>

                <div className="relative">
                  <ArrowDownAZ className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-9 text-sm font-bold text-gray-700 outline-none focus:border-orange-500 sm:w-56"
                  >
                    <option value="default">Sort: Featured</option>
                    <option value="name">Name: A to Z</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating: Highest</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-3xl border border-gray-200 bg-white px-6 py-24 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                    <PackageSearch className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-gray-900">
                    No products found
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                    Try changing your search or removing one of the filters.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-6 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <button
              aria-label="Close filters"
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-orange-500" />
                  <h2 className="font-black text-gray-900">Filters</h2>
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-7 p-5">
                <div>
                  <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Categories
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 text-sm font-medium">
                      <input
                        type="radio"
                        name="mobile-category"
                        checked={selectedCategory === "all"}
                        onChange={() => setSelectedCategory("all")}
                        className="h-4 w-4 accent-orange-500"
                      />
                      All products
                    </label>
                    {categories.map((category) => (
                      <label
                        key={category._id}
                        className="flex items-center gap-3 text-sm font-medium"
                      >
                        <input
                          type="radio"
                          name="mobile-category"
                          checked={selectedCategory === category._id}
                          onChange={() => setSelectedCategory(category._id)}
                          className="h-4 w-4 accent-orange-500"
                        />
                        {category.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Price range
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Minimum"
                      className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none focus:border-orange-500"
                    />
                    <input
                      type="number"
                      min="0"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Maximum"
                      className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Sort by
                  </h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-bold text-gray-700 outline-none focus:border-orange-500"
                  >
                    <option value="default">Featured</option>
                    <option value="name">Name: A to Z</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating: Highest</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-5">
                  <button
                    onClick={clearFilters}
                    className="h-11 rounded-xl border border-gray-200 text-sm font-bold text-gray-700"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="h-11 rounded-xl bg-orange-500 text-sm font-bold text-white"
                  >
                    Show {filteredProducts.length} products
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      
    </>
  );
}
