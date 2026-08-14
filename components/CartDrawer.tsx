// components/CartDrawer.tsx
"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Minus,
  Plus,
  ShoppingBag,
  X,
  Trash2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";

const fallbackImage =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80";

export function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    cart,
    updateQuantity,
    removeFromCart,
    getCartSubtotal,
  } = useStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = getCartSubtotal();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  /**
   * Get available stock for a cart line.
   *
   * Your product API returns:
   *
   * variant.stock
   *
   * Example:
   * {
   *   variant: {
   *     _id: "...",
   *     stock: 3,
   *     price: 1200
   *   }
   * }
   */
  const getStock = (line: any) => {
    const stock = Number(line?.variant?.stock);

    if (!Number.isFinite(stock) || stock < 0) {
      return 0;
    }

    return Math.floor(stock);
  };

  /**
   * Increase quantity safely.
   *
   * Quantity can NEVER become greater than variant.stock.
   */
  const handleIncrease = (line: any) => {
    const stock = getStock(line);
    const currentQuantity = Number(line.quantity) || 0;

    if (stock <= 0) {
      return;
    }

    if (currentQuantity >= stock) {
      return;
    }

    updateQuantity(line.variantId, currentQuantity + 1);
  };

  /**
   * Decrease quantity.
   *
   * Quantity 1 -> remove item.
   */
  const handleDecrease = (line: any) => {
    const currentQuantity = Number(line.quantity) || 0;

    if (currentQuantity <= 1) {
      removeFromCart(line.variantId);
      return;
    }

    updateQuantity(line.variantId, currentQuantity - 1);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeCart}
        >
          {/* =================================================
              DRAWER
          ================================================== */}

          <motion.aside
            className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* =================================================
                HEADER
            ================================================== */}

            <motion.div
              className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-4"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.25 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-50">
                  <ShoppingBag className="h-[18px] w-[18px] text-[#f85606]" />
                </div>

                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Your Cart
                  </h2>

                  <p className="text-xs text-gray-400">
                    {totalItems} {totalItems === 1 ? "item" : "items"} in your
                    cart
                  </p>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </motion.div>

            {/* =================================================
                EMPTY CART
            ================================================== */}

            {cart.length === 0 ? (
              <motion.div
                className="flex flex-1 flex-col items-center justify-center px-8 text-center"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
              >
                <motion.div
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50"
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ShoppingBag
                    size={36}
                    strokeWidth={1.5}
                    className="text-[#f85606]"
                  />
                </motion.div>

                <h3 className="mt-6 text-lg font-bold text-gray-900">
                  Your cart is empty
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                  Looks like you haven't added anything to your cart yet.
                  Explore our products and find something you love.
                </p>

                <motion.button
                  type="button"
                  onClick={closeCart}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#f85606] px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#df4d03]"
                >
                  Continue Shopping
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            ) : (
              <>
                {/* =================================================
                    CART ITEMS
                ================================================== */}

                <motion.ul
                  className="flex-1 overflow-y-auto px-5 py-2"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.06,
                      },
                    },
                  }}
                >
                  <AnimatePresence mode="popLayout">
                    {cart.map((line) => {
                      const price =
                        Number(
                          line.variant?.price ?? line.product?.basePrice ?? 0,
                        ) || 0;

                      const stock = getStock(line);

                      const quantity = Number(line.quantity) || 0;

                      const isAtStockLimit = stock > 0 && quantity >= stock;

                      const isOutOfStock = stock <= 0;

                      const imageUrl =
                        line.product?.thumbnail ||
                        line.product?.images?.[0] ||
                        line.product?.gallery?.[0] ||
                        fallbackImage;

                      return (
                        <motion.li
                          key={line.variantId}
                          layout
                          variants={{
                            hidden: {
                              opacity: 0,
                              x: 20,
                            },
                            visible: {
                              opacity: 1,
                              x: 0,
                            },
                          }}
                          exit={{
                            opacity: 0,
                            x: 40,
                            height: 0,
                            marginTop: 0,
                            marginBottom: 0,
                            paddingTop: 0,
                            paddingBottom: 0,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          }}
                          className="border-b border-gray-100 py-4 last:border-b-0"
                        >
                          <div className="flex gap-3">
                            {/* =================================================
                                IMAGE
                            ================================================== */}

                            <Link
                              href={`/products/${line.product?._id}`}
                              onClick={closeCart}
                              className="group relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-md border border-gray-200 bg-[#f7f7f7]"
                            >
                              <img
                                src={imageUrl}
                                alt={line.product?.name || "Product"}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  const target =
                                    e.currentTarget as HTMLImageElement;

                                  if (target.src !== fallbackImage) {
                                    target.src = fallbackImage;
                                  }
                                }}
                              />
                            </Link>

                            {/* =================================================
                                DETAILS
                            ================================================== */}

                            <div className="flex min-w-0 flex-1 flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <Link
                                    href={`/products/${line.product?._id}`}
                                    onClick={closeCart}
                                    className="line-clamp-2 pr-1 text-sm font-semibold leading-5 text-gray-800 transition-colors hover:text-[#f85606]"
                                  >
                                    {line.product?.name || "Product"}
                                  </Link>

                                  <motion.button
                                    type="button"
                                    onClick={() =>
                                      removeFromCart(line.variantId)
                                    }
                                    whileHover={{
                                      scale: 1.1,
                                    }}
                                    whileTap={{
                                      scale: 0.85,
                                    }}
                                    className="shrink-0 text-gray-400 transition-colors hover:text-red-500"
                                    aria-label="Remove item"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </motion.button>
                                </div>

                                {(line.variant?.size ||
                                  line.variant?.color ||
                                  line.variant?.design) && (
                                  <p className="mt-1 text-[11px] text-gray-400">
                                    {[
                                      line.variant?.size,
                                      line.variant?.color,
                                      line.variant?.design,
                                    ]
                                      .filter(Boolean)
                                      .join(" / ")}
                                  </p>
                                )}

                                {/* =================================================
                                    STOCK STATUS
                                ================================================== */}

                                <div className="mt-1.5">
                                  {isOutOfStock ? (
                                    <div className="flex items-center gap-1 text-[10px] font-semibold text-red-500">
                                      <AlertCircle className="h-3 w-3" />
                                      Out of stock
                                    </div>
                                  ) : isAtStockLimit ? (
                                    <p className="text-[10px] font-semibold text-orange-600">
                                      Maximum available quantity reached
                                    </p>
                                  ) : (
                                    <p className="text-[10px] text-gray-400">
                                      {stock} available
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* =================================================
                                  PRICE + QUANTITY
                              ================================================== */}

                              <div className="mt-2 flex items-center justify-between">
                                {/* Quantity */}

                                <div className="flex items-center overflow-hidden rounded-md border border-gray-200 bg-white">
                                  {/* DECREASE */}

                                  <motion.button
                                    type="button"
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => handleDecrease(line)}
                                    className="flex h-7 w-7 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#f85606]"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </motion.button>

                                  {/* QUANTITY */}

                                  <motion.span
                                    key={quantity}
                                    initial={{
                                      opacity: 0,
                                      y: -4,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      y: 0,
                                    }}
                                    className="flex h-7 min-w-7 items-center justify-center border-x border-gray-200 px-1 text-xs font-bold text-gray-800"
                                  >
                                    {quantity}
                                  </motion.span>

                                  {/* INCREASE */}

                                  <motion.button
                                    type="button"
                                    whileTap={
                                      !isAtStockLimit && !isOutOfStock
                                        ? { scale: 0.85 }
                                        : undefined
                                    }
                                    onClick={() => handleIncrease(line)}
                                    disabled={isAtStockLimit || isOutOfStock}
                                    className={`flex h-7 w-7 items-center justify-center transition-colors ${
                                      isAtStockLimit || isOutOfStock
                                        ? "cursor-not-allowed bg-gray-50 text-gray-300"
                                        : "text-gray-500 hover:bg-orange-50 hover:text-[#f85606]"
                                    }`}
                                    aria-label={
                                      isAtStockLimit
                                        ? "Maximum stock reached"
                                        : "Increase quantity"
                                    }
                                  >
                                    <Plus className="h-3 w-3" />
                                  </motion.button>
                                </div>

                                {/* LINE TOTAL */}

                                <motion.span
                                  key={`${line.variantId}-${quantity}`}
                                  initial={{
                                    opacity: 0.5,
                                    scale: 0.95,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    scale: 1,
                                  }}
                                  className="text-sm font-bold text-gray-900"
                                >
                                  ${(price * quantity).toFixed(2)}
                                </motion.span>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </motion.ul>

                {/* =================================================
                    CHECKOUT FOOTER
                ================================================== */}

                <motion.div
                  className="shrink-0 border-t border-gray-200 bg-[#fafafa] px-5 pb-5 pt-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.15,
                    duration: 0.3,
                  }}
                >
                  {/* SUBTOTAL */}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Subtotal
                    </span>

                    <motion.span
                      key={subtotal}
                      initial={{
                        opacity: 0.5,
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      className="text-xl font-extrabold text-gray-900"
                    >
                      ${subtotal.toFixed(2)}
                    </motion.span>
                  </div>

                  <p className="mt-1 text-[11px] text-gray-400">
                    Shipping and taxes calculated at checkout.
                  </p>

                  {/* CHECKOUT */}

                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="group mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#f85606] py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#df4d03] hover:shadow-md"
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>

                  {/* SECURITY */}

                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                    Secure checkout
                  </div>
                </motion.div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
