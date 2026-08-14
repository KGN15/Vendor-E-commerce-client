// hooks/useWishlist.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/axios";

interface WishlistResponse {
  success: boolean;
  data: {
    user: string;
    products: any[];
  };
}

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  /* =========================================================
     LOAD WISHLIST
  ========================================================= */

  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem("vendorstore_token");

    if (!token) {
      setWishlistIds([]);
      setInitialLoading(false);
      return;
    }

    try {
      const res = await api.get<WishlistResponse>("/wishlist");

      const products = res.data?.data?.products || [];

      setWishlistIds(products.map((product) => product._id));
    } catch (error: any) {
      console.error("Failed to load wishlist:", error);

      if (error?.response?.status === 401) {
        localStorage.removeItem("vendorstore_token");
        setWishlistIds([]);
      }
    } finally {
      setInitialLoading(false);
    }
  }, []);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  /* =========================================================
     TOGGLE WISHLIST
  ========================================================= */

  const toggleWishlist = async (productId: string) => {
    const token = localStorage.getItem("vendorstore_token");

    if (!token) {
      window.location.href = `/login?redirect=${encodeURIComponent(
        window.location.pathname,
      )}`;

      return null;
    }

    try {
      setLoading(true);

      const res = await api.post("/wishlist/toggle", {
        productId,
      });

      const action = res.data?.data?.action;

      if (action === "added") {
        setWishlistIds((current) =>
          current.includes(productId)
            ? current
            : [...current, productId],
        );
      } else if (action === "removed") {
        setWishlistIds((current) =>
          current.filter((id) => id !== productId),
        );
      }

      return action;
    } catch (error: any) {
      console.error("Wishlist toggle failed:", error);

      if (error?.response?.status === 401) {
        localStorage.removeItem("vendorstore_token");

        window.location.href = `/login?redirect=${encodeURIComponent(
          window.location.pathname,
        )}`;
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     CHECK PRODUCT
  ========================================================= */

  const isWishlisted = (productId: string) => {
    return wishlistIds.includes(productId);
  };

  return {
    wishlistIds,
    loading,
    initialLoading,
    fetchWishlist,
    toggleWishlist,
    isWishlisted,
  };
}