"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Star, Heart, Loader2, X } from "lucide-react";

import { IProduct } from "@/types";
import { useStore } from "@/lib/store";

interface ProductCardProps {
  product: IProduct;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80";

export function ProductCard({ product }: ProductCardProps) {
  const {
    addToCart,
    toggleWishlist,
    isWishlisted,
    wishlistLoading,
    fetchWishlist,
  } = useStore();

  const [wishlistAnimating, setWishlistAnimating] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const [imageSrc, setImageSrc] = useState(
    product.thumbnail ||
      product.images?.[0] ||
      product.gallery?.[0] ||
      FALLBACK_IMAGE,
  );

  const wishlisted = isWishlisted(product._id);

  /* =========================================================
     AUTH CHECK
  ========================================================= */

  const isUserLoggedIn = () => {
    if (typeof window === "undefined") {
      return false;
    }

    // Main authentication token
    const token = localStorage.getItem("vendorstore_token");

    if (token) {
      return true;
    }

    // Zustand persisted storage fallback
    const persistedStorage = localStorage.getItem("vendor-ecom-storage");

    if (!persistedStorage) {
      return false;
    }

    try {
      const parsed = JSON.parse(persistedStorage);
      const state = parsed?.state;

      return Boolean(
        state?.token ||
        state?.accessToken ||
        state?.user?.token ||
        state?.user?.accessToken,
      );
    } catch {
      return false;
    }
  };

  /* =========================================================
     PRICE
  ========================================================= */

  const activeVariants = (product.variants || []).filter(
    (variant) => variant.isActive !== false,
  );

  const prices = activeVariants
    .map((variant) => Number(variant.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  const price =
    prices.length > 0 ? Math.min(...prices) : Number(product.basePrice || 0);

  /* =========================================================
     STOCK
  ========================================================= */

  const totalStock = activeVariants.reduce(
    (total, variant) => total + Number(variant.stock || 0),
    0,
  );

  const isOutOfStock = totalStock <= 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;

  /* =========================================================
     WISHLIST
  ========================================================= */

  const handleWishlist = async () => {
    // Not logged in → show register/login popup
    if (!isUserLoggedIn()) {
      setShowLoginPopup(true);
      return;
    }

    if (wishlistLoading || wishlistAnimating) {
      return;
    }

    try {
      setWishlistAnimating(true);

      await toggleWishlist(product._id, product);
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      window.setTimeout(() => {
        setWishlistAnimating(false);
      }, 450);
    }
  };

  /* =========================================================
     CART
  ========================================================= */

  const handleAddToCart = () => {
    if (isOutOfStock || !product.isActive) {
      return;
    }

    addToCart(product);
  };

  /* =========================================================
     IMAGE ERROR
  ========================================================= */

  const handleImageError = () => {
    if (imageSrc !== FALLBACK_IMAGE) {
      setImageSrc(FALLBACK_IMAGE);
    }
  };
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);
  return (
    <>
      <motion.article
        layout
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        whileHover={{
          y: -4,
        }}
        transition={{
          duration: 0.2,
        }}
        className="
          group
          flex
          h-full
          min-w-0
          w-full
          flex-col
          overflow-hidden
          rounded-xl
          border
          border-gray-200
          bg-white
          shadow-sm
          transition-all
          duration-300
          hover:border-gray-300
          hover:shadow-lg
        "
      >
        {/* =====================================================
            PRODUCT IMAGE
        ====================================================== */}

        <div className="relative w-full overflow-hidden bg-gray-100">
          <Link
            href={`/products/${product._id}`}
            className="
              relative
              block
              aspect-[4/4.5]
              w-full
            "
          >
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              className="
                object-cover
                transition-transform
                duration-500
                group-hover:scale-105
              "
              priority
              onError={handleImageError}
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-black/10
                via-transparent
                to-transparent
                opacity-0
                transition-opacity
                duration-300
                group-hover:opacity-100
              "
            />
          </Link>

          {/* ===================================================
              WISHLIST BUTTON
          ==================================================== */}

          <motion.button
            type="button"
            onClick={handleWishlist}
            disabled={wishlistLoading || wishlistAnimating}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            whileHover={{
              scale: 1.08,
            }}
            whileTap={{
              scale: 0.9,
            }}
            className={`
              absolute
              right-3
              top-3
              z-10
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-gray-200
              bg-white
              shadow-md
              transition-all
              duration-200
              hover:shadow-lg

              ${
                wishlisted ? "text-red-500" : "text-gray-500 hover:text-red-500"
              }
            `}
          >
            <AnimatePresence mode="wait" initial={false}>
              {wishlistAnimating || wishlistLoading ? (
                <motion.div
                  key="loading"
                  initial={{
                    opacity: 0,
                    scale: 0.5,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.5,
                  }}
                >
                  <Loader2 className="h-[17px] w-[17px] animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key={wishlisted ? "liked" : "unliked"}
                  initial={{
                    scale: 0.5,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 18,
                  }}
                >
                  <Heart
                    className={`
                      h-[18px]
                      w-[18px]

                      ${
                        wishlisted
                          ? "fill-red-500 text-red-500"
                          : "text-gray-500"
                      }
                    `}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Low stock */}

          {isLowStock && (
            <div
              className="
                absolute
                bottom-3
                left-3
                rounded-md
                bg-orange-500
                px-2
                py-1
                text-[10px]
                font-bold
                text-white
                shadow-sm
              "
            >
              Only {totalStock} left
            </div>
          )}
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div
          className="
            flex
            flex-1
            flex-col
            p-3
            sm:p-3.5
            md:p-4
          "
        >
          {/* Product name */}

          <Link href={`/products/${product._id}`} className="block">
            <h3
              className="
                line-clamp-2
                min-h-[40px]
                text-sm
                font-semibold
                leading-5
                text-gray-900
                transition-colors
                duration-200
                group-hover:text-[#f85606]

                md:min-h-[44px]
                md:text-[15px]
              "
            >
              {product.name}
            </h3>
          </Link>

          {/* Rating */}

          <div
            className="
              mt-2.5
              flex
              items-center
              gap-1.5
            "
          >
            <Star
              className="
                h-3.5
                w-3.5
                fill-yellow-400
                text-yellow-400
              "
            />

            <span
              className="
                text-xs
                font-semibold
                text-gray-700
              "
            >
              {Number(product.averageRating || 0).toFixed(1)}
            </span>

            <span
              className="
                text-[11px]
                text-gray-400
              "
            >
              ({product.reviewCount || 0})
            </span>
          </div>

          {/* Price */}

          <div className="mt-2.5">
            <span
              className="
                text-xl
                font-extrabold
                tracking-tight
                text-[#f85606]
                md:text-[22px]
              "
            >
              ${price.toFixed(2)}
            </span>
          </div>

          {/* Stock */}

          <div
            className="
              mt-2
              flex
              items-center
              gap-1.5
            "
          >
            <span
              className={`
                h-2
                w-2
                shrink-0
                rounded-full

                ${
                  isOutOfStock
                    ? "bg-red-500"
                    : isLowStock
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }
              `}
            />

            <span
              className={`
                truncate
                text-[11px]
                font-semibold

                ${
                  isOutOfStock
                    ? "text-red-500"
                    : isLowStock
                      ? "text-yellow-600"
                      : "text-green-600"
                }
              `}
            >
              {isOutOfStock
                ? "Out of stock"
                : isLowStock
                  ? `Only ${totalStock} left`
                  : `${totalStock} in stock`}
            </span>
          </div>

          {/* Add to cart */}

          <div className="mt-auto pt-4">
            <motion.button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock || !product.isActive}
              whileHover={
                !isOutOfStock && product.isActive
                  ? {
                      y: -1,
                    }
                  : undefined
              }
              whileTap={
                !isOutOfStock && product.isActive
                  ? {
                      scale: 0.98,
                    }
                  : undefined
              }
              className={`
                flex
                h-10
                w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                text-xs
                font-bold
                transition-all
                duration-200

                md:h-11

                ${
                  !isOutOfStock && product.isActive
                    ? "border-[#f85606] bg-white text-[#f85606] hover:bg-[#f85606] hover:text-white hover:shadow-md"
                    : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                }
              `}
            >
              <ShoppingCart className="h-4 w-4" />

              <span>
                {!isOutOfStock && product.isActive
                  ? "Add to Cart"
                  : "Out of Stock"}
              </span>
            </motion.button>
          </div>
        </div>
      </motion.article>

      {/* =====================================================
          LOGIN / REGISTER POPUP
      ====================================================== */}

      <AnimatePresence>
        {showLoginPopup && (
          <motion.div
            className="
              fixed
              inset-0
              z-[9999]
              flex
              items-center
              justify-center
              bg-black/40
              p-4
              backdrop-blur-sm
            "
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() => setShowLoginPopup(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="wishlist-login-title"
              className="
                relative
                w-full
                max-w-[400px]
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-6
                shadow-2xl
              "
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.95,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={(event) => event.stopPropagation()}
            >
              {/* Close */}

              <button
                type="button"
                onClick={() => setShowLoginPopup(false)}
                aria-label="Close"
                className="
                  absolute
                  right-4
                  top-4
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  text-gray-400
                  transition
                  hover:bg-gray-100
                  hover:text-gray-700
                "
              >
                <X className="h-4 w-4" />
              </button>

              {/* Wishlist icon */}

              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-orange-50
                  text-[#f85606]
                "
              >
                <Heart className="h-6 w-6 fill-[#f85606]" />
              </div>

              {/* Text */}

              <div className="mt-4 text-center">
                <h2
                  id="wishlist-login-title"
                  className="
                    text-xl
                    font-extrabold
                    text-gray-900
                  "
                >
                  Register to add to Wishlist
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-gray-500
                  "
                >
                  You need to be logged in to add products to your wishlist.
                </p>
              </div>

              {/* Buttons */}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setShowLoginPopup(false)}
                  className="
                    flex
                    h-11
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    text-sm
                    font-bold
                    text-gray-700
                    transition
                    hover:bg-gray-50
                  "
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setShowLoginPopup(false)}
                  className="
                    flex
                    h-11
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#f85606]
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#df4d03]
                    hover:shadow-md
                  "
                >
                  Register Now
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
