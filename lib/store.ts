// lib/store.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ICartItem,
  IProduct,
  IProductVariant,
  IUser,
} from "@/types";
import { api } from "@/lib/axios";

interface StoreState {
  /* =========================================================
     AUTH STATE
  ========================================================= */

  user: IUser | null;

  setUser: (user: IUser | null) => void;
  clearUser: () => void;

  /* =========================================================
     CART STATE
  ========================================================= */

  cart: ICartItem[];

  isCartOpen: boolean;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addToCart: (
    product: IProduct,
    variant?: IProductVariant,
  ) => void;

  removeFromCart: (variantId: string) => void;

  updateQuantity: (
    variantId: string,
    quantity: number,
  ) => void;

  clearCart: () => void;

  getCartSubtotal: () => number;

  /* =========================================================
     WISHLIST STATE
  ========================================================= */

  wishlist: IProduct[];

  wishlistLoading: boolean;
  wishlistLoaded: boolean;

  fetchWishlist: () => Promise<void>;

  toggleWishlist: (
    productId: string,
    product?: IProduct,
  ) => Promise<"added" | "removed">;

  isWishlisted: (productId: string) => boolean;

  clearWishlist: () => void;
}

/* =========================================================
   STORE
========================================================= */

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      /* =====================================================
         AUTH
      ===================================================== */

      user: null,

      setUser: (user) => {
        set({
          user,
        });
      },

      clearUser: () => {
        set({
          user: null,
          wishlist: [],
          wishlistLoaded: false,
        });
      },

      /* =====================================================
         CART
      ===================================================== */

      cart: [],

      isCartOpen: false,

      openCart: () => {
        set({
          isCartOpen: true,
        });
      },

      closeCart: () => {
        set({
          isCartOpen: false,
        });
      },

      toggleCart: () => {
        set((state) => ({
          isCartOpen: !state.isCartOpen,
        }));
      },

      /* =====================================================
         ADD TO CART
      ===================================================== */

      addToCart: (product, variant) => {
        const selectedVariant: IProductVariant =
          variant ||
          product.variants?.[0] || {
            _id: product._id,
            sku: product.slug || "default-sku",
            price: product.basePrice,
            stock: 10,
            design: "",
    isActive: true,
          };

        const variantId =
          selectedVariant._id || product._id;

        const currentCart = get().cart;

        const existingIndex = currentCart.findIndex(
          (item) => item.variantId === variantId,
        );

        /* ---------------------------------------------------
           EXISTING ITEM
        --------------------------------------------------- */

        if (existingIndex > -1) {
          const updatedCart = [...currentCart];

          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            quantity:
              updatedCart[existingIndex].quantity + 1,
          };

          set({
            cart: updatedCart,
            isCartOpen: true,
          });

          return;
        }

        /* ---------------------------------------------------
           NEW ITEM
        --------------------------------------------------- */

        const newItem: ICartItem = {
          productId: product._id,
          variantId,
          product,
          variant: selectedVariant,
          quantity: 1,
        };

        set({
          cart: [...currentCart, newItem],
          isCartOpen: true,
        });
      },

      /* =====================================================
         REMOVE FROM CART
      ===================================================== */

      removeFromCart: (variantId) => {
        set((state) => ({
          cart: state.cart.filter(
            (item) => item.variantId !== variantId,
          ),
        }));
      },

      /* =====================================================
         UPDATE CART QUANTITY
      ===================================================== */

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(variantId);
          return;
        }

        set((state) => ({
          cart: state.cart.map((item) =>
            item.variantId === variantId
              ? {
                  ...item,
                  quantity,
                }
              : item,
          ),
        }));
      },

      /* =====================================================
         CLEAR CART
      ===================================================== */

      clearCart: () => {
        set({
          cart: [],
        });
      },

      /* =====================================================
         CART SUBTOTAL
      ===================================================== */

      getCartSubtotal: () => {
        return get().cart.reduce(
          (total, item) => {
            const price =
              item.variant?.price ??
              item.product?.basePrice ??
              0;

            return total + price * item.quantity;
          },
          0,
        );
      },

      /* =====================================================
         WISHLIST
      ===================================================== */

      wishlist: [],

      wishlistLoading: false,

      wishlistLoaded: false,

      /* =====================================================
         FETCH WISHLIST
      ===================================================== */

      fetchWishlist: async () => {
        if (typeof window === "undefined") {
          return;
        }

        const token = localStorage.getItem(
          "vendorstore_token",
        );

        /* ---------------------------------------------------
           NOT LOGGED IN
        --------------------------------------------------- */

        if (!token) {
          set({
            wishlist: [],
            wishlistLoaded: true,
            wishlistLoading: false,
          });

          return;
        }

        try {
          set({
            wishlistLoading: true,
          });

          const response = await api.get("/wishlist");

          const products =
            response.data?.data?.products;

          set({
            wishlist: Array.isArray(products)
              ? products
              : [],
            wishlistLoaded: true,
          });
        } catch (error) {
          console.error(
            "Failed to fetch wishlist:",
            error,
          );

          set({
            wishlist: [],
            wishlistLoaded: true,
          });
        } finally {
          set({
            wishlistLoading: false,
          });
        }
      },

      /* =====================================================
         TOGGLE WISHLIST
      ===================================================== */

      toggleWishlist: async (productId, product) => {
        if (typeof window === "undefined") {
          throw new Error("AUTH_REQUIRED");
        }

        const token = localStorage.getItem(
          "vendorstore_token",
        );

        /* ---------------------------------------------------
           AUTH CHECK
        --------------------------------------------------- */

        if (!token) {
          throw new Error("AUTH_REQUIRED");
        }

        try {
          set({
            wishlistLoading: true,
          });

          const response = await api.post(
            "/wishlist/toggle",
            {
              productId,
            },
          );

          const action =
            response.data?.data?.action;

          if (
            action !== "added" &&
            action !== "removed"
          ) {
            throw new Error(
              "Invalid wishlist response.",
            );
          }

          /* =================================================
             ADDED
          ================================================= */

          if (action === "added") {
            /*
             * ProductCard থেকে product পাঠানো হলে
             * সাথে সাথে UI update হবে।
             *
             * Wishlist page থেকে শুধু productId পাঠালেও
             * fetchWishlist() দিয়ে server state sync করা যাবে।
             */

            if (product) {
              set((state) => {
                const alreadyExists =
                  state.wishlist.some(
                    (item) =>
                      item._id === productId,
                  );

                if (alreadyExists) {
                  return {
                    wishlistLoaded: true,
                  };
                }

                return {
                  wishlist: [
                    ...state.wishlist,
                    product,
                  ],
                  wishlistLoaded: true,
                };
              });
            } else {
              /*
               * Product object না থাকলে server থেকে
               * wishlist আবার load করি।
               */
              await get().fetchWishlist();
            }
          }

          /* =================================================
             REMOVED
          ================================================= */

          if (action === "removed") {
            set((state) => ({
              wishlist: state.wishlist.filter(
                (item) =>
                  item._id !== productId,
              ),
              wishlistLoaded: true,
            }));
          }

          return action;
        } catch (error) {
          console.error(
            "Wishlist toggle failed:",
            error,
          );

          throw error;
        } finally {
          set({
            wishlistLoading: false,
          });
        }
      },

      /* =====================================================
         CHECK WISHLIST
      ===================================================== */

      isWishlisted: (productId) => {
        return get().wishlist.some(
          (product) =>
            product?._id?.toString() ===
            productId?.toString(),
        );
      },

      /* =====================================================
         CLEAR WISHLIST
      ===================================================== */

      clearWishlist: () => {
        set({
          wishlist: [],
          wishlistLoaded: false,
        });
      },
    }),

    /* =======================================================
       PERSIST

       ONLY CART IS STORED IN LOCAL STORAGE.

       user      ❌
       wishlist  ❌
       token     ❌ through Zustand

       cart      ✅
    ======================================================= */

    {
      name: "vendor-ecom-storage",

      partialize: (state) => ({
        cart: state.cart,
      }),
    },
  ),
);