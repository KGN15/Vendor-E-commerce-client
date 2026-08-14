"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  ArrowLeft,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Package,
  ArrowRight,
  LogIn,
  ShoppingCart,
} from "lucide-react";

import { api } from "@/lib/axios";
import { useStore } from "@/lib/store";
import type { IProduct } from "@/types";

/* =========================================================
   TYPES
========================================================= */

interface WishlistResponse {
  success: boolean;
  data: {
    user: string;
    products: IProduct[];
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function WishlistPage() {
  const { addToCart } = useStore();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  /* =======================================================
     FETCH WISHLIST
  ======================================================= */

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("vendorstore_token");

      if (!token) {
        window.location.href = "/login?redirect=/wishlist";
        return;
      }

      const res = await api.get<WishlistResponse>("/wishlist");

      const wishlistProducts = res.data?.data?.products || [];

      setProducts(wishlistProducts);
    } catch (err: any) {
      console.error("Failed to fetch wishlist:", err);

      const status = err?.response?.status;

      if (status === 401) {
        localStorage.removeItem("vendorstore_token");
        window.location.href = "/login?redirect=/wishlist";
        return;
      }

      setError(
        err?.response?.data?.message ||
          "Unable to load your wishlist. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  /* =======================================================
     REMOVE FROM WISHLIST
  ======================================================= */

  const handleRemove = async (productId: string) => {
    if (removingId) return;

    try {
      setRemovingId(productId);

      const token = localStorage.getItem("vendorstore_token");

      if (!token) {
        window.location.href = "/login?redirect=/wishlist";
        return;
      }

      await api.post("/wishlist/toggle", {
        productId,
      });

      // Instant UI update
      setProducts((current) =>
        current.filter((product) => product._id !== productId),
      );
    } catch (err: any) {
      console.error("Failed to remove wishlist item:", err);

      const status = err?.response?.status;

      if (status === 401) {
        localStorage.removeItem("vendorstore_token");
        window.location.href = "/login?redirect=/wishlist";
        return;
      }

      setError(
        err?.response?.data?.message ||
          "Unable to remove this product from wishlist.",
      );
    } finally {
      setRemovingId(null);
    }
  };

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart = (product: IProduct) => {
    try {
      setAddingId(product._id);

      addToCart(product);

      setTimeout(() => {
        setAddingId(null);
      }, 500);
    } catch (err) {
      console.error("Failed to add product to cart:", err);
      setAddingId(null);
    }
  };

  /* =======================================================
     PRODUCT IMAGE
  ======================================================= */

  const getProductImage = (product: IProduct) => {
    const productWithImages = product as IProduct & {
      images?: string[];
      image?: string;
    };

    return (
      productWithImages.images?.[0] ||
      productWithImages.image ||
      "/placeholder-product.png"
    );
  };

  /* =======================================================
     PRODUCT PRICE
  ======================================================= */

  const getPrice = (product: IProduct) => {
    return product.basePrice ?? 0;
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f7f7f7] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* ===================================================
            HEADER
        ================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <Link
              href="/products"
              className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-[#f85606]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Continue shopping
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#f85606]">
                <Heart className="h-5 w-5 fill-current" />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                  My Wishlist
                </h1>

                {!loading && !error && (
                  <p className="mt-1 text-sm text-gray-500">
                    {products.length === 0
                      ? "No saved products"
                      : `${products.length} ${
                          products.length === 1 ? "product" : "products"
                        } saved`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {!loading && !error && products.length > 0 && (
            <Link
              href="/products"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#f85606] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#df4d03] hover:shadow-md"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop More
            </Link>
          )}
        </motion.div>

        {/* ===================================================
            ERROR
        ================================================== */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-red-700">
                    Something went wrong
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-600">{error}</p>
                </div>

                <button
                  type="button"
                  onClick={fetchWishlist}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================================================
            LOADING
        ================================================== */}

        {loading && !error && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.04 }}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <div className="aspect-square animate-pulse bg-gray-100" />

                <div className="space-y-3 p-3 sm:p-4">
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />

                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />

                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />

                  <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ===================================================
            EMPTY STATE
        ================================================== */}

        {!loading && !error && products.length === 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm sm:px-10 sm:py-20"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 18,
                delay: 0.1,
              }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-[#f85606]"
            >
              <Heart className="h-9 w-9" />
            </motion.div>

            <h2 className="mt-6 text-xl font-extrabold text-gray-900 sm:text-2xl">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Save products you love and find them here whenever you want to
              come back and shop.
            </p>

            <Link
              href="/products"
              className="mx-auto mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#f85606] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#df4d03] hover:shadow-md"
            >
              <ShoppingBag className="h-4 w-4" />
              Explore Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.section>
        )}

        {/* ===================================================
            PRODUCT GRID
        ================================================== */}

        {!loading && !error && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {products.map((product, index) => {
                const productImage = getProductImage(product);
                const price = getPrice(product);
                const isRemoving = removingId === product._id;
                const isAdding = addingId === product._id;

                return (
                  <motion.article
                    key={product._id}
                    layout
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.92,
                      y: -10,
                    }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(index * 0.05, 0.3),
                    }}
                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* =================================================
                        IMAGE
                    ================================================== */}

                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <Link href={`/products/${product.slug || product._id}`}>
                        <img
                          src={productImage}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading={index < 4 ? "eager" : "lazy"}
                        />
                      </Link>

                      {/* Wishlist Remove */}

                      <button
                        type="button"
                        onClick={() => handleRemove(product._id)}
                        disabled={isRemoving}
                        aria-label={`Remove ${product.name} from wishlist`}
                        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-gray-100 bg-white/95 text-red-500 shadow-sm backdrop-blur transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isRemoving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Heart className="h-4 w-4 fill-current" />
                        )}
                      </button>
                    </div>

                    {/* =================================================
                        CONTENT
                    ================================================== */}

                    <div className="p-3 sm:p-4">
                      {/* Category */}

                      {product.category &&
                        typeof product.category === "object" &&
                        "name" in product.category && (
                          <p className="mb-1.5 truncate text-[10px] font-bold uppercase tracking-wider text-[#f85606]">
                            {product.category.name}
                          </p>
                        )}

                      {/* Product Name */}

                      <Link
                        href={`/products/${product.slug || product._id}`}
                        className="block"
                      >
                        <h2 className="line-clamp-2 min-h-[40px] text-sm font-bold leading-5 text-gray-900 transition-colors hover:text-[#f85606] sm:text-[15px]">
                          {product.name}
                        </h2>
                      </Link>

                      {/* Price */}

                      <div className="mt-3 flex items-center justify-between gap-2">
                       

                        {product.stock !== undefined && (
                          <span
                            className={`text-[10px] font-semibold ${
                              product.stock > 0
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            {product.stock > 0 ? "In stock" : "Out of stock"}
                          </span>
                        )}
                      </div>

                      {/* Add To Cart */}

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={
                          isAdding ||
                          product.stock === 0 ||
                          product.stock === undefined
                            ? product.stock === 0
                            : false
                        }
                        className="mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-[#f85606] px-2 text-xs font-bold text-white transition hover:bg-[#df4d03] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                      >
                        {isAdding ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Added
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ===================================================
            BOTTOM INFO
        ================================================== */}

        {!loading && !error && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-2 text-center text-[11px] text-gray-400"
          >
            <Package className="h-3.5 w-3.5" />
            Your wishlist is synced with your account.
          </motion.div>
        )}
      </div>
    </main>
  );
}
