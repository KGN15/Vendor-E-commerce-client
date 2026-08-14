"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/axios";
import { useStore } from "@/lib/store";
import {
  ShoppingBag,
  Star,
  Check,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  Minus,
  Plus,
  Send,
  MessageSquare,
  AlertCircle,
  LogIn,
} from "lucide-react";

const fallbackImage =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80";

interface Review {
  _id: string;
  user?: {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
  };
  product: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { addToCart, toggleWishlist, isWishlisted, wishlistLoading } =
    useStore();

  // =========================================================
  // PRODUCT STATE
  // =========================================================
  const [product, setProduct] = useState<any | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);

  const [selectedImage, setSelectedImage] = useState<string>("");

  const [reviews, setReviews] = useState<Review[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // =========================================================
  // AUTH STATE
  // =========================================================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // =========================================================
  // REVIEW FORM STATE
  // =========================================================
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const [reviewLoading, setReviewLoading] = useState(false);

  const [reviewError, setReviewError] = useState<string | null>(null);

  const [reviewSuccess, setReviewSuccess] = useState(false);

  // =========================================================
  // REMOVE DUPLICATE REVIEWS
  // =========================================================
  const uniqueReviews = (reviewList: Review[]): Review[] => {
    return Array.from(
      new Map(reviewList.map((review) => [review._id, review])).values(),
    );
  };

  // =========================================================
  // FETCH PRODUCT
  // =========================================================
  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/products/${id}`);

        const responseData = res.data?.data;

        const productData = responseData?.product;
        const variantData = responseData?.variants || [];

        const reviewData = responseData?.reviews || [];

        if (!productData) {
          setError("Product not found.");
          return;
        }

        setProduct(productData);
        setVariants(variantData);

        // Always remove duplicate reviews
        setReviews(uniqueReviews(reviewData));

        const mainImage =
          productData.thumbnail || productData.images?.[0] || fallbackImage;

        setSelectedImage(mainImage);

        if (variantData.length > 0) {
          setSelectedVariant(variantData[0]);
        }
      } catch (err: any) {
        console.error("Failed to fetch product:", err);

        setError(
          err?.response?.data?.message ||
            "Product not found or failed to load.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  // =========================================================
  // AUTH CHECK
  //
  // vendorstore_token
  //
  // vendor-ecom-storage -> state -> user
  // =========================================================
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("vendorstore_token");

        const storage = localStorage.getItem("vendor-ecom-storage");

        let user = null;

        if (storage) {
          const parsed = JSON.parse(storage);

          user = parsed?.state?.user || null;
        }

        setIsLoggedIn(Boolean(token));
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to read authentication state:", error);

        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <main className="min-h-[70vh] bg-[#f7f7f7]">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50"
          >
            <Loader2 className="h-7 w-7 animate-spin text-[#f85606]" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-4 text-sm font-semibold text-gray-700"
          >
            Loading product...
          </motion.p>

          <p className="mt-1 text-xs text-gray-400">Please wait a moment</p>
        </div>
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================
  if (error || !product) {
    return (
      <main className="min-h-[70vh] bg-[#f7f7f7]">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <ShoppingBag className="h-7 w-7 text-gray-400" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-gray-900">
            {error || "Product not found."}
          </h2>

          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#f85606] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#df4d03]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  // =========================================================
  // PRODUCT DATA
  // =========================================================
  const currentPrice = selectedVariant?.price ?? 0;
  const wishlisted = isWishlisted(product._id);
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [selectedImage];

  const averageRating = Number(product.averageRating || 0);

  const reviewCount = Number(product.reviewCount ?? reviews.length ?? 0);

  const comparePrice = product.compareAtPrice;

  const discount =
    comparePrice && comparePrice > currentPrice
      ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
      : 0;

  // =========================================================
  // ADD TO CART
  // =========================================================
  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedVariant || undefined);
    }

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  // =========================================================
  // WISHLIST
  // =========================================================
  const handleWishlist = async () => {
    if (wishlistLoading) return;

    try {
      await toggleWishlist(product._id, product);
    } catch (error: any) {
      if (error?.message === "AUTH_REQUIRED") {
        router.push("/login");
        return;
      }

      console.error("Wishlist error:", error);
    }
  };

  // =========================================================
  // WRITE REVIEW
  // =========================================================
  const handleWriteReview = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setReviewError(null);
    setReviewSuccess(false);

    setShowReviewForm((prev) => !prev);
  };

  // =========================================================
  // SUBMIT REVIEW
  // =========================================================
  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (!reviewRating) {
      setReviewError("Please select a rating.");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError("Please write a review.");
      return;
    }

    if (reviewComment.trim().length < 5) {
      setReviewError("Review must be at least 5 characters long.");
      return;
    }

    try {
      setReviewLoading(true);
      setReviewError(null);
      setReviewSuccess(false);

      // POST a review using the authenticated axios instance.
      await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      // Re-fetch the canonical product response after POST.
      // This keeps product.rating/reviewCount and populated review.user
      // exactly in sync with the backend response.
      const refreshed = await api.get(`/products/${id}`);
      const refreshedData = refreshed.data?.data;

      if (!refreshedData?.product) {
        throw new Error("Product refresh failed after submitting review.");
      }

      setProduct(refreshedData.product);
      setVariants(refreshedData.variants || []);
      setReviews(uniqueReviews(refreshedData.reviews || []));

      // Keep the selected variant valid after refreshing product data.
      const refreshedVariants = refreshedData.variants || [];
      if (selectedVariant?._id) {
        const matchingVariant = refreshedVariants.find(
          (variant: any) => variant._id === selectedVariant._id,
        );
        setSelectedVariant(matchingVariant || refreshedVariants[0] || null);
      } else {
        setSelectedVariant(refreshedVariants[0] || null);
      }

      setReviewRating(0);
      setReviewComment("");
      setReviewSuccess(true);

      setTimeout(() => {
        setReviewSuccess(false);
        setShowReviewForm(false);
      }, 2200);
    } catch (err: any) {
      console.error("Failed to submit review:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to submit review. Please try again.";

      setReviewError(message);
    } finally {
      setReviewLoading(false);
    }
  };

  // =========================================================
  // RENDER STARS
  // =========================================================
  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={
              interactive
                ? () => {
                    setReviewRating(star);
                    setReviewError(null);
                  }
                : undefined
            }
            className={
              interactive
                ? "rounded p-0.5 transition-transform hover:scale-110"
                : "cursor-default"
            }
          >
            <Star
              className={`h-4 w-4 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // =========================================================
  // RATING DISTRIBUTION
  // =========================================================
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter(
      (review) => Number(review.rating) === star,
    ).length;

    return {
      star,
      count,
      percentage:
        reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0,
    };
  });

  // =========================================================
  // MAIN UI
  // =========================================================
  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =====================================================
            BREADCRUMB
        ====================================================== */}
        <motion.div
          initial={{
            opacity: 0,
            x: -10,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
        >
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-[#f85606]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Products
          </Link>
        </motion.div>

        {/* =====================================================
            PRODUCT CONTAINER
        ====================================================== */}
        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            ease: "easeOut",
          }}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr]">
            {/* =================================================
                LEFT — IMAGES
            ================================================== */}
            <div className="border-b border-gray-200 p-4 sm:p-6 lg:border-b-0 lg:border-r">
              <div className="relative overflow-hidden rounded-lg bg-[#f7f7f7]">
                {discount > 0 && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.8,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      delay: 0.25,
                    }}
                    className="absolute left-4 top-4 z-10 rounded-sm bg-[#f85606] px-3 py-1.5 text-xs font-bold text-white"
                  >
                    -{discount}% OFF
                  </motion.div>
                )}

                <motion.button
                  whileHover={{
                    scale: 1.08,
                  }}
                  whileTap={{
                    scale: 0.9,
                  }}
                  type="button"
                  onClick={handleWishlist}
                  disabled={wishlistLoading}
                  className={`
    absolute
    right-4
    top-4
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
    disabled:cursor-not-allowed
    disabled:opacity-70

    ${wishlisted ? "text-red-500" : "text-gray-500 hover:text-red-500"}
  `}
                  aria-label={
                    wishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {wishlistLoading ? (
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

            ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}
          `}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{
                      opacity: 0,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 1.02,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className="aspect-square"
                  >
                    <Image
                      src={selectedImage}
                      alt={product.name}
                      width={800}
                      height={800}
                      priority
                      loading="eager"
                      className="h-full w-full object-cover object-center"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImage;
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {galleryImages.map((img: string, index: number) => {
                    const isSelected = selectedImage === img;

                    return (
                      <motion.button
                        key={`${img}-${index}`}
                        type="button"
                        whileHover={{
                          y: -2,
                        }}
                        whileTap={{
                          scale: 0.96,
                        }}
                        onClick={() => setSelectedImage(img)}
                        className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-md bg-white transition-all ${
                          isSelected
                            ? "ring-2 ring-[#f85606] ring-offset-2"
                            : "border border-gray-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Product image ${index + 1}`}
                          width={100}
                          height={100}
                          loading="eager"
                          className="h-full w-full object-cover"
                        />
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* =================================================
                RIGHT — PRODUCT INFO
            ================================================== */}
            <div className="flex flex-col p-5 sm:p-7 lg:p-9">
              {/* Rating */}
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.15,
                }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-1 rounded-sm bg-yellow-50 px-2 py-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />

                  <span className="text-xs font-bold text-gray-800">
                    {averageRating ? averageRating.toFixed(1) : "0.0"}
                  </span>
                </div>

                <span className="text-xs text-gray-400">
                  {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </span>
              </motion.div>

              {/* Product Name */}
              <motion.h1
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.18,
                }}
                className="mt-4 text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl"
              >
                {product.name}
              </motion.h1>

              {/* Price */}
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.22,
                }}
                className="mt-5 border-b border-gray-100 pb-5"
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-[#f85606]">
                    ৳{Number(currentPrice).toLocaleString()}
                  </span>

                  {comparePrice && comparePrice > currentPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ৳{Number(comparePrice).toLocaleString()}
                    </span>
                  )}
                </div>

                {discount > 0 && (
                  <p className="mt-1 text-xs font-medium text-green-600">
                    You save ৳{(comparePrice! - currentPrice).toLocaleString()}
                  </p>
                )}
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.26,
                }}
                className="mt-5"
              >
                <p className="text-sm leading-6 text-gray-600">
                  {product.description ||
                    "No description provided for this product."}
                </p>
              </motion.div>

              {/* Full Description */}
              {product.fullDescription && (
                <div
                  className="prose prose-sm mt-4 max-w-none border-t border-gray-100 pt-4 text-xs text-gray-500"
                  dangerouslySetInnerHTML={{
                    __html: product.fullDescription,
                  }}
                />
              )}

              {/* Variants */}
              {variants.length > 0 && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.3,
                  }}
                  className="mt-6 border-t border-gray-100 pt-6"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">
                      Select Variant
                    </h3>

                    <span className="text-xs text-gray-400">Size / Color</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => {
                      const isSelected = selectedVariant?._id === variant._id;

                      const label = [
                        variant.size,
                        variant.color,
                        variant.design,
                      ]
                        .filter(Boolean)
                        .join(" / ");

                      return (
                        <motion.button
                          key={variant._id}
                          type="button"
                          whileTap={{
                            scale: 0.96,
                          }}
                          onClick={() => setSelectedVariant(variant)}
                          className={`flex items-center gap-2 rounded-md border px-3.5 py-2.5 text-xs font-semibold transition-all ${
                            isSelected
                              ? "border-[#f85606] bg-orange-50 text-[#f85606]"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}

                          <span>
                            {label || `Variant #${variant._id.slice(-4)}`}
                          </span>

                          <span className="text-gray-400">
                            ৳{variant.price}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Highlights */}
              {product.highlights && product.highlights.length > 0 && (
                <motion.div
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  transition={{
                    delay: 0.34,
                  }}
                  className="mt-6 border-t border-gray-100 pt-6"
                >
                  <h3 className="mb-3 text-sm font-bold text-gray-900">
                    Product Highlights
                  </h3>

                  <ul className="space-y-2">
                    {product.highlights.map((item: string, index: number) => (
                      <motion.li
                        key={`${item}-${index}`}
                        initial={{
                          opacity: 0,
                          x: -6,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: 0.36 + index * 0.04,
                        }}
                        className="flex items-start gap-2 text-xs leading-5 text-gray-600"
                      >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />

                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Quantity / Cart */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.4,
                }}
                className="mt-7 border-t border-gray-100 pt-6"
              >
                <div className="flex gap-3">
                  <div className="flex h-12 items-center overflow-hidden rounded-md border border-gray-200 bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-full w-10 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-[#f85606]"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="flex w-9 justify-center text-sm font-bold text-gray-900">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="flex h-full w-10 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-[#f85606]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <motion.button
                    type="button"
                    onClick={handleAddToCart}
                    whileHover={{
                      y: -1,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-md text-sm font-bold text-white shadow-sm transition-colors ${
                      added ? "bg-green-600" : "bg-[#f85606] hover:bg-[#df4d03]"
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="h-5 w-5" />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-5 w-5" />
                        Add to Cart
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {/* Service Info */}
              <div className="mt-6 grid grid-cols-1 gap-3 border-t border-gray-100 pt-6 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#f85606]" />

                  <div>
                    <p className="text-[11px] font-bold text-gray-800">
                      Fast Delivery
                    </p>

                    <p className="text-[10px] text-gray-400">Quick shipping</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />

                  <div>
                    <p className="text-[11px] font-bold text-gray-800">
                      Secure Payment
                    </p>

                    <p className="text-[10px] text-gray-400">Safe checkout</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-blue-600" />

                  <div>
                    <p className="text-[11px] font-bold text-gray-800">
                      Easy Returns
                    </p>

                    <p className="text-[10px] text-gray-400">Hassle-free</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =====================================================
            REVIEWS
        ====================================================== */}
        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.1,
          }}
          transition={{
            duration: 0.45,
          }}
          className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          {/* Review Header */}
          <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <MessageSquare className="h-5 w-5 text-[#f85606]" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Customer Reviews
                  </h2>

                  <p className="text-xs text-gray-400">
                    See what customers think about this product
                  </p>
                </div>
              </div>

              {/* Review Button */}
              {isLoggedIn ? (
                <motion.button
                  type="button"
                  whileHover={{
                    y: -1,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={handleWriteReview}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f85606] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#df4d03]"
                >
                  <Star className="h-4 w-4" />

                  {showReviewForm ? "Close Review Form" : "Write a Review"}
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  whileHover={{
                    y: -1,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={() => router.push("/login")}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 transition hover:border-[#f85606] hover:text-[#f85606]"
                >
                  <LogIn className="h-4 w-4" />
                  Login to Review
                </motion.button>
              )}
            </div>
          </div>

          {/* =================================================
              REVIEW FORM
          ================================================== */}
          <AnimatePresence>
            {showReviewForm && isLoggedIn && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                transition={{
                  duration: 0.3,
                }}
                className="overflow-hidden border-b border-gray-100"
              >
                <form
                  onSubmit={handleSubmitReview}
                  className="bg-[#fffaf7] px-5 py-6 sm:px-7"
                >
                  <div className="mx-auto max-w-3xl">
                    {/* Current User */}
                    {currentUser && (
                      <div className="mb-5 flex items-center gap-3 rounded-lg border border-orange-100 bg-white p-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff3ed] text-xs font-bold text-[#f85606]">
                          {(currentUser.name || "U").charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {currentUser.name || "Customer"}
                          </p>

                          <p className="text-[10px] text-gray-400">
                            {currentUser.email || ""}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mb-5">
                      <h3 className="text-sm font-bold text-gray-900">
                        Share your experience
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Your feedback helps other customers make better
                        decisions.
                      </p>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="mb-2 block text-xs font-bold text-gray-700">
                        Your Rating
                      </label>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            whileHover={{
                              scale: 1.15,
                            }}
                            whileTap={{
                              scale: 0.9,
                            }}
                            onClick={() => {
                              setReviewRating(star);

                              setReviewError(null);
                            }}
                            className="rounded p-1"
                            aria-label={`Give ${star} stars`}
                          >
                            <Star
                              className={`h-6 w-6 transition-colors ${
                                star <= reviewRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 hover:text-yellow-300"
                              }`}
                            />
                          </motion.button>
                        ))}

                        {reviewRating > 0 && (
                          <span className="ml-2 text-xs font-semibold text-gray-500">
                            {reviewRating}
                            /5
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="mt-5">
                      <label
                        htmlFor="review-comment"
                        className="mb-2 block text-xs font-bold text-gray-700"
                      >
                        Your Review
                      </label>

                      <textarea
                        id="review-comment"
                        value={reviewComment}
                        onChange={(e) => {
                          setReviewComment(e.target.value);

                          setReviewError(null);
                        }}
                        placeholder="Tell others what you think about this product..."
                        rows={5}
                        maxLength={1000}
                        className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#f85606] focus:ring-2 focus:ring-[#f85606]/10"
                      />

                      <div className="mt-1 flex justify-end">
                        <span className="text-[10px] text-gray-400">
                          {reviewComment.length}
                          /1000
                        </span>
                      </div>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {reviewError && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: -5,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: -5,
                          }}
                          className="mt-4 flex items-center gap-2 rounded-md border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600"
                        >
                          <AlertCircle className="h-4 w-4 shrink-0" />

                          {reviewError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Success */}
                    <AnimatePresence>
                      {reviewSuccess && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            scale: 0.97,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.97,
                          }}
                          className="mt-4 flex items-center gap-2 rounded-md border border-green-100 bg-green-50 px-3 py-2.5 text-xs font-medium text-green-600"
                        >
                          <Check className="h-4 w-4 shrink-0" />
                          Review submitted successfully!
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <div className="mt-5 flex justify-end">
                      <motion.button
                        type="submit"
                        disabled={reviewLoading}
                        whileHover={
                          !reviewLoading
                            ? {
                                y: -1,
                              }
                            : undefined
                        }
                        whileTap={
                          !reviewLoading
                            ? {
                                scale: 0.98,
                              }
                            : undefined
                        }
                        className="inline-flex items-center gap-2 rounded-md bg-[#f85606] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#df4d03] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {reviewLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Submit Review
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* =================================================
              RATING SUMMARY
          ================================================== */}
          <div className="grid grid-cols-1 gap-6 border-b border-gray-100 px-5 py-7 sm:px-7 md:grid-cols-[220px_1fr]">
            {/* Overall */}
            <div className="flex flex-col items-center justify-center border-b border-gray-100 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-7">
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                }}
                className="text-4xl font-black text-gray-900"
              >
                {averageRating ? averageRating.toFixed(1) : "0.0"}
              </motion.div>

              <div className="mt-2">{renderStars(averageRating)}</div>

              <p className="mt-2 text-xs text-gray-400">
                Based on {reviewCount}{" "}
                {reviewCount === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Breakdown */}
            <div className="flex flex-col justify-center gap-2">
              {ratingDistribution.map(({ star, count, percentage }, index) => (
                <motion.div
                  key={star}
                  initial={{
                    opacity: 0,
                    x: 10,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="flex items-center gap-3"
                >
                  <span className="w-8 text-xs font-semibold text-gray-500">
                    {star} ★
                  </span>

                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      whileInView={{
                        width: `${percentage}%`,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.05,
                      }}
                      className="h-full rounded-full bg-[#f85606]"
                    />
                  </div>

                  <span className="w-8 text-right text-[11px] text-gray-400">
                    {count}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* =================================================
              REVIEW LIST
          ================================================== */}
          <div className="px-5 py-6 sm:px-7">
            {reviews.length === 0 ? (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <MessageSquare className="h-6 w-6 text-gray-400" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-gray-900">
                  No reviews yet
                </h3>

                <p className="mt-1 max-w-sm text-xs text-gray-400">
                  Be the first customer to share your experience.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-0">
                {uniqueReviews(reviews).map((review, index, reviewList) => {
                  const reviewerName = review.user?.name || "Customer";

                  const reviewDate = review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "";

                  return (
                    <motion.article
                      key={review._id}
                      initial={{
                        opacity: 0,
                        y: 12,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                        amount: 0.1,
                      }}
                      transition={{
                        delay: Math.min(index * 0.05, 0.3),
                      }}
                      className={`py-5 ${
                        index !== reviewList.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff3ed] text-sm font-bold text-[#f85606]">
                          {reviewerName.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-gray-900">
                                {reviewerName}
                              </h4>

                              <div className="mt-1 flex items-center gap-2">
                                {renderStars(Number(review.rating))}

                                <span className="text-[10px] text-gray-400">
                                  {reviewDate}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-gray-600">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
