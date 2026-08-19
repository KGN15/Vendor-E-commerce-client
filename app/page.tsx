"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/axios";
import { IProduct } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { HomePageLoader } from "@/components/HomePageLoader";

import {
  ArrowDown,
  ArrowRight,
  BadgePercent,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PackageSearch,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  Zap,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

type Category = {
  _id: string;
  name: string;
  slug?: string;
  prefix?: string;
};

const PRODUCTS_PER_PAGE = 8;

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* =========================================================
     URL PAGE
  ========================================================== */

  const pageParam = Number(searchParams.get("page"));

  const currentPage =
    Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  /* =========================================================
     STATE
  ========================================================== */

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /* =========================================================
     LOAD HOME DATA
     
     IMPORTANT:
     This runs only once.
     Pagination does NOT refetch the API.
  ========================================================== */

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        setError(null);

        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);

        /* =====================================================
           PRODUCTS
        ====================================================== */

        const productData = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : productsResponse.data?.products ||
            productsResponse.data?.data ||
            [];

        /* =====================================================
           CATEGORIES
        ====================================================== */

        const categoryData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : categoriesResponse.data?.data || [];

        setProducts(Array.isArray(productData) ? productData : []);

        setCategories(
          Array.isArray(categoryData) ? categoryData.slice(0, 6) : [],
        );
      } catch (err: any) {
        console.error("Failed to load homepage:", err);

        setError(
          err?.response?.data?.message ||
            "Could not load products from the server.",
        );
      } finally {
        setLoading(false);
        setCategoryLoading(false);
      }
    }

    loadHomeData();
  }, []);

  /* =========================================================
     PAGINATION CALCULATION
  ========================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(products.length / PRODUCTS_PER_PAGE),
  );

  /*
   * If someone manually enters an invalid page:
   *
   * /?page=999
   *
   * We don't crash.
   */

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PRODUCTS_PER_PAGE;

    const endIndex = startIndex + PRODUCTS_PER_PAGE;

    return products.slice(startIndex, endIndex);
  }, [products, safeCurrentPage]);

  /* =========================================================
     PAGINATION HANDLER
     
     scroll: false
     is the important part here.
  ========================================================== */

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === safeCurrentPage) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(page));

    /*
     * URL changes:
     *
     * ?page=2
     *
     * But Next.js does NOT scroll to top.
     */

    router.push(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  /* =========================================================
     PAGE NUMBERS
  ========================================================== */

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];

    /*
     * Small number of pages
     */

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    /*
     * Beginning
     */

    if (safeCurrentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);

      return pages;
    }

    /*
     * End
     */

    if (safeCurrentPage >= totalPages - 3) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );

      return pages;
    }

    /*
     * Middle
     */

    pages.push(
      1,
      "...",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "...",
      totalPages,
    );

    return pages;
  }, [safeCurrentPage, totalPages]);

  /* =========================================================
     FEATURED PRODUCT RANGE
     
     This is now the current page's products.
  ========================================================== */

  const featuredProducts = paginatedProducts;

  /* =========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <HomePageLoader />

      <Navbar />
      <CartDrawer />

      <main className="min-h-screen overflow-hidden bg-[#fafafa] text-gray-900">
        {/* =========================================================
            PROMO BAR
        ========================================================== */}

        <div className="bg-[#f85606] text-white">
          <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-center gap-2 px-4 text-[11px] font-bold tracking-wide sm:text-xs">
            <Sparkles className="h-3.5 w-3.5" />

            <span>Discover quality products at better prices.</span>

            <button
              onClick={() => router.push("/products")}
              className="hidden items-center gap-1 underline underline-offset-4 sm:inline-flex"
            >
              Shop now
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* =========================================================
            HERO
        ========================================================== */}

        <section className="relative isolate overflow-hidden border-b border-gray-200 bg-[#f7f7f5]">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-orange-200/30 blur-3xl" />

            <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-orange-100/50 blur-3xl" />

            <div className="absolute bottom-[-250px] left-[-150px] h-[450px] w-[450px] rounded-full bg-gray-200/50 blur-3xl" />

            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid min-h-[650px] items-center gap-12 py-16 lg:grid-cols-[1fr_0.9fr] lg:py-20">
              {/* HERO CONTENT */}

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                transition={{ duration: 0.7 }}
                className="relative z-10 max-w-3xl"
              >
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#f85606] shadow-sm backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f85606]" />
                  Quality products. Better prices.
                </div>

                <h1 className="max-w-4xl text-[48px] font-black leading-[0.94] tracking-[-0.055em] text-gray-950 sm:text-6xl lg:text-[82px]">
                  Shop better.
                  <br />
                  <span className="relative inline-block text-[#f85606]">
                    Live better.
                    <svg
                      className="absolute -bottom-3 left-0 w-full"
                      viewBox="0 0 400 18"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M3 12C100 3 280 4 397 10"
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>

                <p className="mt-8 max-w-xl text-base leading-7 text-gray-500 sm:text-lg sm:leading-8">
                  Discover carefully selected products for everyday life,
                  competitive prices, and a shopping experience designed to make
                  finding what you need easier.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => router.push("/products")}
                    className="group inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-gray-950 px-7 text-sm font-black text-white shadow-xl shadow-gray-900/10 transition hover:-translate-y-0.5 hover:bg-[#f85606]"
                  >
                    Explore Collection
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() =>
                      document.getElementById("featured")?.scrollIntoView({
                        behavior: "smooth",
                      })
                    }
                    className="inline-flex h-14 items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-7 text-sm font-bold text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    Discover products
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>

                {/* QUICK TRUST */}

                <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-gray-200 pt-7">
                  <div>
                    <p className="text-2xl font-black tracking-tight text-gray-950">
                      10K+
                    </p>

                    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Happy customers
                    </p>
                  </div>

                  <div className="h-8 w-px bg-gray-200" />

                  <div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[#f85606] text-[#f85606]" />

                      <span className="text-lg font-black">4.9</span>
                    </div>

                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Customer rating
                    </p>
                  </div>

                  <div className="h-8 w-px bg-gray-200" />

                  <div>
                    <p className="text-2xl font-black tracking-tight text-gray-950">
                      24/7
                    </p>

                    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Support
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* HERO VISUAL */}

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.92,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.15,
                }}
                className="relative mx-auto w-full max-w-[560px]"
              >
                <div className="relative aspect-square">
                  <div className="absolute inset-[8%] rounded-full bg-[#f85606]" />

                  <div className="absolute inset-[13%] rounded-full bg-[#ff7b39]" />

                  <div className="absolute inset-0 rounded-full border border-gray-300/70" />

                  <div className="absolute inset-[4%] rounded-full border border-gray-200" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative flex h-[58%] w-[58%] rotate-[-7deg] items-center justify-center rounded-[32px] bg-white shadow-[0_35px_90px_rgba(0,0,0,0.18)]">
                      <ShoppingBag className="h-[48%] w-[48%] text-[#f85606] stroke-[1.15]" />

                      <div className="absolute bottom-7 left-7 right-7">
                        <div className="h-2 rounded-full bg-gray-100" />

                        <div className="mt-2 h-2 w-2/3 rounded-full bg-gray-100" />
                      </div>
                    </div>
                  </div>

                  {/* DEAL */}

                  <div className="absolute left-0 top-[16%] rounded-2xl border border-white/70 bg-white p-4 shadow-2xl shadow-black/10 backdrop-blur sm:left-[-5%]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
                        <BadgePercent className="h-5 w-5 text-[#f85606]" />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Exclusive
                        </p>

                        <p className="mt-0.5 text-sm font-black text-gray-900">
                          Better deals
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DELIVERY */}

                  <div className="absolute bottom-[14%] right-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl shadow-black/10 sm:right-[-3%]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                        <Truck className="h-5 w-5 text-green-600" />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Delivery
                        </p>

                        <p className="mt-0.5 text-sm font-black text-gray-900">
                          Fast & reliable
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SHOP BADGE */}

                  <div className="absolute right-[10%] top-[5%] flex h-16 w-16 rotate-12 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-xl">
                    <div className="text-center">
                      <Zap className="mx-auto h-4 w-4 text-orange-400" />

                      <p className="mt-1 text-[8px] font-black uppercase tracking-wider">
                        Shop
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =========================================================
            TRUST STRIP
        ========================================================== */}

        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-gray-200 md:grid-cols-4">
            {[
              {
                icon: Truck,
                title: "Fast delivery",
                text: "Quick & reliable",
              },
              {
                icon: ShieldCheck,
                title: "Secure shopping",
                text: "Safe & protected",
              },
              {
                icon: BadgePercent,
                title: "Better prices",
                text: "Deals worth getting",
              },
              {
                icon: Check,
                title: "Quality first",
                text: "Selected with care",
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 px-5 py-6 sm:px-8"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                    <Icon className="h-5 w-5 text-[#f85606]" />
                  </div>

                  <div>
                    <p className="text-xs font-black text-gray-900 sm:text-sm">
                      {item.title}
                    </p>

                    <p className="mt-0.5 text-[10px] font-medium text-gray-400 sm:text-xs">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================
            CATEGORIES
        ========================================================== */}

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-5">
            <div>
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#f85606]">
                Shop by category
              </p>

              <h2 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                Find what you need.
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-gray-500">
                Explore our categories and discover products for your everyday
                needs.
              </p>
            </div>

            <button
              onClick={() => router.push("/products")}
              className="hidden items-center gap-2 text-sm font-black text-gray-900 transition hover:text-[#f85606] sm:inline-flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {categoryLoading ? (
            <div className="flex h-36 items-center justify-center rounded-2xl border border-gray-200 bg-white">
              <Loader2 className="h-5 w-5 animate-spin text-[#f85606]" />
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((category, index) => (
                <motion.button
                  key={category._id}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  onClick={() => router.push("/products")}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/40"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-sm font-black text-[#f85606] transition group-hover:bg-[#f85606] group-hover:text-white">
                    {category.prefix || String(index + 1).padStart(2, "0")}
                  </div>

                  <h3 className="mt-6 text-sm font-black capitalize text-gray-900">
                    {category.name}
                  </h3>

                  <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-gray-400 transition group-hover:text-[#f85606]">
                    Explore
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
              Categories are coming soon.
            </div>
          )}
        </section>

        {/* =========================================================
            FEATURED PRODUCTS
        ========================================================== */}

        <section
          id="featured"
          className="scroll-mt-20 border-y border-gray-200 bg-white"
        >
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between gap-5">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#f85606]" />

                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f85606]">
                    Featured products
                  </p>
                </div>

                <h2 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                  Popular right now.
                </h2>

                <p className="mt-3 text-sm text-gray-500">
                  Explore some of the products customers are discovering.
                </p>
              </div>

              {!loading && products.length > 0 && (
                <button
                  onClick={() => router.push("/products")}
                  className="hidden items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-xs font-black text-white transition hover:bg-[#f85606] sm:inline-flex"
                >
                  View all products
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* =====================================================
                PRODUCT LOADING
            ====================================================== */}

            {loading && (
              <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-[#f85606]" />
                  </div>

                  <p className="mt-4 text-sm font-bold text-gray-700">
                    Loading products...
                  </p>

                  <p className="mt-1 text-xs text-gray-400">Just a moment</p>
                </div>
              </div>
            )}

            {/* =====================================================
                ERROR / EMPTY
            ====================================================== */}

            {!loading && (error || products.length === 0) && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                  <PackageSearch className="h-7 w-7 text-gray-300" />
                </div>

                <h3 className="mt-5 text-lg font-black text-gray-900">
                  No products available yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  {error ||
                    "Products will appear here once they are added to the store."}
                </p>

                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 rounded-xl bg-[#f85606] px-6 py-3 text-xs font-black text-white transition hover:bg-[#df4d03]"
                >
                  Try again
                </button>
              </div>
            )}

            {/* =====================================================
                PRODUCTS
            ====================================================== */}

            {!loading && products.length > 0 && (
              <>
                <div
                  className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4"
                  key={safeCurrentPage}
                >
                  {featuredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* =================================================
                    PAGINATION INFO
                ================================================== */}

                <div className="mt-10 flex flex-col items-center justify-between gap-5 border-t border-gray-100 pt-7 sm:flex-row">
                  <p className="text-xs font-medium text-gray-400">
                    Showing{" "}
                    <span className="font-black text-gray-700">
                      {(safeCurrentPage - 1) * PRODUCTS_PER_PAGE + 1}
                    </span>{" "}
                    –{" "}
                    <span className="font-black text-gray-700">
                      {Math.min(
                        safeCurrentPage * PRODUCTS_PER_PAGE,
                        products.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-black text-gray-700">
                      {products.length}
                    </span>{" "}
                    products
                  </p>

                  {/* =================================================
                      PAGINATION
                  ================================================== */}

                  {totalPages > 1 && (
                    <nav
                      aria-label="Product pagination"
                      className="flex items-center gap-1.5"
                    >
                      {/* PREVIOUS */}

                      <button
                        onClick={() => handlePageChange(safeCurrentPage - 1)}
                        disabled={safeCurrentPage === 1}
                        aria-label="Previous page"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {/* PAGE NUMBERS */}

                      {pageNumbers.map((page, index) => {
                        if (page === "...") {
                          return (
                            <span
                              key={`ellipsis-${index}`}
                              className="flex h-10 w-8 items-center justify-center text-xs font-bold text-gray-400"
                            >
                              ...
                            </span>
                          );
                        }

                        const isActive = page === safeCurrentPage;

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-xs font-black transition ${
                              isActive
                                ? "bg-[#f85606] text-white shadow-lg shadow-orange-500/20"
                                : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      {/* NEXT */}

                      <button
                        onClick={() => handlePageChange(safeCurrentPage + 1)}
                        disabled={safeCurrentPage === totalPages}
                        aria-label="Next page"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </nav>
                  )}
                </div>

                {/* MOBILE EXPLORE BUTTON */}

                <div className="mt-8 flex justify-center sm:hidden">
                  <button
                    onClick={() => router.push("/products")}
                    className="inline-flex h-12 items-center gap-2 rounded-xl border border-gray-200 bg-white px-7 text-xs font-black text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    Explore all products
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* =========================================================
            SHOPPING BENEFITS
        ========================================================== */}

        <section className="bg-[#f7f7f5]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#f85606]">
                Why shop with us
              </p>

              <h2 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                Simple shopping. Less hassle.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                Everything you need for a smooth shopping experience, from
                discovering products to getting them delivered.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure shopping",
                  text: "Shop with confidence through a secure experience.",
                },
                {
                  icon: Zap,
                  title: "Fast experience",
                  text: "Browse products and find what you need quickly.",
                },
                {
                  icon: BadgePercent,
                  title: "Better value",
                  text: "Discover competitive prices and useful offers.",
                },
                {
                  icon: Truck,
                  title: "Reliable delivery",
                  text: "Get your orders delivered safely and reliably.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-gray-200 bg-white p-6"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#f85606]">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-6 text-sm font-black text-gray-950">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-gray-500">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            FINAL CTA
        ========================================================== */}

        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[28px] bg-gray-950 px-6 py-14 text-white sm:px-12 lg:px-16 lg:py-20">
              <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#f85606]/30 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[360px] w-[360px] rounded-full bg-orange-500/10 blur-3xl" />

              <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Start exploring
                  </div>

                  <h2 className="max-w-2xl text-4xl font-black tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                    Your next great find
                    <span className="text-[#f85606]"> is waiting.</span>
                  </h2>

                  <p className="mt-5 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
                    Browse our collection, discover products you love, and find
                    better value for your everyday shopping.
                  </p>

                  <button
                    onClick={() => router.push("/products")}
                    className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-[#f85606] px-7 py-3.5 text-xs font-black text-white transition hover:bg-[#ff6a22]"
                  >
                    Start shopping
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                <div className="hidden lg:block">
                  <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                    <div className="absolute inset-5 rounded-full border border-white/10" />

                    <ShoppingBag className="h-20 w-20 text-[#f85606] stroke-[1]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
