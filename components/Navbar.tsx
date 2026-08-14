// components/Navbar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  User,
  Search,
  Store,
  Menu,
  Heart,
  LogIn,
  UserPlus,
  ChevronDown,
  UserCircle,
  X,
  Home,
  Package,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";

export function Navbar() {
  const { cart, openCart, user, setUser, wishlist, clearUser } = useStore();

  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  const [search, setSearch] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const wishlistCount = wishlist?.length || 0;
  /* =========================================================
     AUTH + HYDRATION
  ========================================================= */

  useEffect(() => {
    setMounted(true);

    const checkAuth = () => {
      const token = localStorage.getItem("vendorstore_token");

      setHasToken(Boolean(token));
    };

    // Initial auth check
    checkAuth();

    // Cross-tab auth changes
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "vendorstore_token") {
        setHasToken(Boolean(event.newValue));
      }
    };

    // Same-tab auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("vendorstore-auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("vendorstore-auth-change", handleAuthChange);
    };
  }, []);

  /* =========================================================
     ESC KEY
  ========================================================= */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setAccountOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* =========================================================
     LOCK BODY SCROLL
  ========================================================= */

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /* =========================================================
     AUTH
  ========================================================= */

  const isLoggedIn = mounted && hasToken;

  /* =========================================================
     CART
  ========================================================= */

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  /* =========================================================
     USER
  ========================================================= */

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "Account";

  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const query = search.trim();

    setMobileMenuOpen(false);
    setAccountOpen(false);

    if (!query) {
      router.push("/products");
      return;
    }

    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  const openMobileSearch = () => {
    setMobileMenuOpen(false);

    setTimeout(() => {
      mobileSearchRef.current?.focus();
    }, 150);
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("vendorstore_token");

    clearUser();

    window.dispatchEvent(new Event("vendorstore-auth-change"));

    setAccountOpen(false);
    setMobileMenuOpen(false);

    router.replace("/login");
  };

  /* =========================================================
     CLOSE MENUS
  ========================================================= */

  const closeMenus = () => {
    setAccountOpen(false);
    setMobileMenuOpen(false);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* =====================================================
          MAIN NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-50 w-full overflow-x-clip border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex min-h-[68px] w-full min-w-0 items-center gap-2 sm:gap-3">
            {/* =================================================
                MOBILE HAMBURGER
            ================================================== */}

            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 md:hidden"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{
                      opacity: 0,
                      rotate: -90,
                      scale: 0.7,
                    }}
                    animate={{
                      opacity: 1,
                      rotate: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      rotate: 90,
                      scale: 0.7,
                    }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{
                      opacity: 0,
                      rotate: 90,
                      scale: 0.7,
                    }}
                    animate={{
                      opacity: 1,
                      rotate: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      rotate: -90,
                      scale: 0.7,
                    }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* =================================================
                LOGO
            ================================================== */}

            <Link
              href="/"
              onClick={closeMenus}
              className="group flex min-w-0 shrink items-center gap-2"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f85606] shadow-sm transition group-hover:shadow-md">
                <Store className="h-[19px] w-[19px] text-white" />
              </div>

              <span className="truncate text-lg font-extrabold tracking-tight text-gray-900 sm:text-xl">
                Vendor
                <span className="text-[#f85606]">Store</span>
              </span>
            </Link>

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================== */}

            <nav className="ml-5 hidden items-center gap-6 lg:flex">
              <Link
                href="/"
                className="text-sm font-semibold text-gray-800 transition-colors hover:text-[#f85606]"
              >
                Home
              </Link>

              <Link
                href="/products"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-[#f85606]"
              >
                Products
              </Link>
            </nav>

            {/* =================================================
                DESKTOP SEARCH
            ================================================== */}

            <form
              onSubmit={handleSearch}
              className="ml-auto hidden max-w-xl min-w-0 flex-1 md:block lg:ml-8"
            >
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </form>

            {/* =================================================
                DESKTOP ACTIONS
            ================================================== */}

            <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-4">
              {/* ---------------------------------------------
                  MOBILE ACCOUNT ICON
              ---------------------------------------------- */}

              {mounted && isLoggedIn && (
                <Link
                  href="/profile"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 md:hidden"
                  aria-label="My account"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}

              {/* ---------------------------------------------
                  MOBILE GET STARTED
              ---------------------------------------------- */}

              {mounted && !isLoggedIn && (
                <Link
                  href="/login"
                  className="hidden h-10 items-center gap-1.5 rounded-lg bg-[#f85606] px-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#df4d03] sm:inline-flex md:hidden"
                >
                  <LogIn className="h-4 w-4" />
                  Get Started
                </Link>
              )}

              {/* ---------------------------------------------
                  DESKTOP WISHLIST
              ---------------------------------------------- */}

              <Link
                href="/wishlist"
                className="relative hidden h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 md:flex"
                aria-label={`Wishlist${
                  wishlistCount > 0 ? ` (${wishlistCount})` : ""
                }`}
              >
                <Heart
                  className={`h-[19px] w-[19px] transition-all duration-200 ${
                    wishlistCount > 0
                      ? "fill-red-500 text-red-500"
                      : "text-gray-700"
                  }`}
                />

                {mounted && wishlistCount > 0 && (
                  <motion.span
                    key={wishlistCount}
                    initial={{
                      scale: 0,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 22,
                    }}
                    className="
        absolute
        -right-0.5
        -top-0.5
        flex
        h-[18px]
        min-w-[18px]
        items-center
        justify-center
        rounded-full
        bg-[#f85606]
        px-1
        text-[9px]
        font-extrabold
        leading-none
        text-white
        ring-2
        ring-white
      "
                  >
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </motion.span>
                )}
              </Link>

              {/* ---------------------------------------------
                  DESKTOP AUTH
              ---------------------------------------------- */}

              {!mounted ? (
                <div className="hidden h-10 w-[120px] md:block" />
              ) : !isLoggedIn ? (
                <div className="hidden items-center gap-1.5 md:flex">
                  <Link
                    href="/login"
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
                  >
                    <LogIn className="h-[17px] w-[17px]" />
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#f85606] px-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#df4d03] hover:shadow-md"
                  >
                    <UserPlus className="h-[17px] w-[17px]" />
                    Register
                  </Link>
                </div>
              ) : (
                /* ---------------------------------------------
                   DESKTOP ACCOUNT
                ---------------------------------------------- */

                <div className="relative hidden md:block">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((prev) => !prev)}
                    className="flex h-10 items-center gap-2 rounded-lg px-3 transition hover:bg-gray-100"
                    aria-expanded={accountOpen}
                    aria-label="Open account menu"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#f85606]">
                      <User className="h-[17px] w-[17px]" />
                    </div>

                    <div className="max-w-[90px] text-left">
                      <p className="text-[10px] leading-none text-gray-400">
                        Hello,
                      </p>

                      <p className="mt-1 truncate text-xs font-bold text-gray-800">
                        {firstName}
                      </p>
                    </div>

                    <ChevronDown
                      className={`h-3.5 w-3.5 text-gray-400 transition-transform ${
                        accountOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {accountOpen && (
                      <>
                        <motion.button
                          type="button"
                          aria-label="Close account menu"
                          className="fixed inset-0 z-40 cursor-default"
                          onClick={() => setAccountOpen(false)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />

                        <motion.div
                          initial={{
                            opacity: 0,
                            y: -8,
                            scale: 0.97,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            y: -8,
                            scale: 0.97,
                          }}
                          transition={{
                            duration: 0.16,
                          }}
                          className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
                        >
                          <div className="border-b border-gray-100 px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#f85606]">
                                <UserCircle className="h-6 w-6" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-gray-900">
                                  {user?.name || "My Account"}
                                </p>

                                {user?.email && (
                                  <p className="mt-0.5 truncate text-xs text-gray-500">
                                    {user.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="p-2">
                            <Link
                              href="/profile"
                              onClick={() => setAccountOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-[#f85606]"
                            >
                              <User className="h-4 w-4" />
                              My Account
                            </Link>

                            <Link
                              href="/orders"
                              onClick={() => setAccountOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-[#f85606]"
                            >
                              <ShoppingBag className="h-4 w-4" />
                              My Orders
                            </Link>

                            <Link
                              href="/wishlist"
                              onClick={closeMenus}
                              className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-[#f85606]"
                            >
                              <span className="flex items-center gap-3">
                                <span className="relative">
                                  <Heart
                                    className={`h-[18px] w-[18px] ${
                                      wishlistCount > 0
                                        ? "fill-red-500 text-red-500"
                                        : ""
                                    }`}
                                  />

                                  {wishlistCount > 0 && (
                                    <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f85606] px-1 text-[8px] font-extrabold leading-none text-white ring-2 ring-white">
                                      {wishlistCount > 99
                                        ? "99+"
                                        : wishlistCount}
                                    </span>
                                  )}
                                </span>
                                Wishlist
                              </span>

                              {wishlistCount > 0 ? (
                                <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#f85606]">
                                  {wishlistCount > 99 ? "99+" : wishlistCount}
                                </span>
                              ) : (
                                <ArrowRight className="h-4 w-4 opacity-40" />
                              )}
                            </Link>

                            <div className="my-1 border-t border-gray-100" />

                            <button
                              type="button"
                              onClick={handleLogout}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                              <LogOut className="h-4 w-4" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* =================================================
                  CART
              ================================================== */}

              <button
                type="button"
                onClick={openCart}
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 sm:h-11 sm:w-11"
                aria-label="Open cart"
              >
                <ShoppingBag className="h-[21px] w-[21px]" />

                {mounted && totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-0.5 top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#f85606] px-1 text-[10px] font-bold text-white ring-2 ring-white"
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </motion.span>
                )}
              </button>
            </div>
          </div>

          {/* =====================================================
              MOBILE SEARCH BAR
          ====================================================== */}

          <form onSubmit={handleSearch} className="pb-3 md:hidden">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-gray-400" />

              <input
                ref={mobileSearchRef}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#f85606] focus:bg-white focus:ring-1 focus:ring-orange-100"
              />
            </div>
          </form>
        </div>
      </header>

      {/* =========================================================
          MOBILE DRAWER
      ========================================================= */}

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}

            <motion.button
              type="button"
              aria-label="Close mobile menu"
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Drawer */}

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 32,
              }}
              className="fixed left-0 top-0 z-[70] flex h-[100dvh] w-[min(86%,360px)] flex-col overflow-hidden bg-white shadow-2xl md:hidden"
            >
              {/* Drawer Header */}

              <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-gray-100 px-4">
                <Link
                  href="/"
                  onClick={closeMenus}
                  className="flex items-center gap-2.5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f85606]">
                    <Store className="h-[19px] w-[19px] text-white" />
                  </div>

                  <span className="text-lg font-extrabold text-gray-900">
                    Vendor
                    <span className="text-[#f85606]">Store</span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}

              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">
                {/* =================================================
                    ACCOUNT / GET STARTED
                ================================================== */}

                {isLoggedIn ? (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="mb-5 rounded-xl border border-orange-100 bg-orange-50/60 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#f85606] shadow-sm">
                        <User className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#f85606]">
                          Welcome back
                        </p>

                        <p className="mt-0.5 truncate text-sm font-extrabold text-gray-900">
                          {user?.name || firstName}
                        </p>

                        {user?.email && (
                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm font-bold text-gray-900">
                      Welcome to VendorStore
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Sign in to manage your account, orders and wishlist.
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Link
                        href="/login"
                        onClick={closeMenus}
                        className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-700 transition hover:border-[#f85606] hover:text-[#f85606]"
                      >
                        <LogIn className="h-4 w-4" />
                        Login
                      </Link>

                      <Link
                        href="/register"
                        onClick={closeMenus}
                        className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#f85606] text-xs font-bold text-white transition hover:bg-[#df4d03]"
                      >
                        <UserPlus className="h-4 w-4" />
                        Register
                      </Link>
                    </div>
                  </div>
                )}

                {/* =================================================
                    NAVIGATION
                ================================================== */}

                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Navigation
                </p>

                <div className="space-y-1">
                  <Link
                    href="/"
                    onClick={closeMenus}
                    className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-[#f85606]"
                  >
                    <span className="flex items-center gap-3">
                      <Home className="h-[18px] w-[18px]" />
                      Home
                    </span>

                    <ArrowRight className="h-4 w-4 opacity-40" />
                  </Link>

                  <Link
                    href="/products"
                    onClick={closeMenus}
                    className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-[#f85606]"
                  >
                    <span className="flex items-center gap-3">
                      <Package className="h-[18px] w-[18px]" />
                      Products
                    </span>

                    <ArrowRight className="h-4 w-4 opacity-40" />
                  </Link>

                  <button
                    type="button"
                    onClick={openMobileSearch}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-[#f85606]"
                  >
                    <span className="flex items-center gap-3">
                      <Search className="h-[18px] w-[18px]" />
                      Search Products
                    </span>

                    <ArrowRight className="h-4 w-4 opacity-40" />
                  </button>

                  <Link
                    href="/wishlist"
                    onClick={closeMenus}
                    className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-[#f85606]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="relative flex h-[20px] w-[20px] items-center justify-center">
                        <Heart
                          className={`h-[18px] w-[18px] ${
                            wishlistCount > 0
                              ? "fill-red-500 text-red-500"
                              : "text-gray-700"
                          }`}
                        />

                        {wishlistCount > 0 && (
                          <span
                            className="
            absolute
            -right-2.5
            -top-2
            flex
            h-4
            min-w-4
            items-center
            justify-center
            rounded-full
            bg-[#f85606]
            px-1
            text-[8px]
            font-extrabold
            leading-none
            text-white
            ring-2
            ring-white
          "
                          >
                            {wishlistCount > 99 ? "99+" : wishlistCount}
                          </span>
                        )}
                      </span>
                      Wishlist
                    </span>

                    {wishlistCount > 0 ? (
                      <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#f85606]">
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </span>
                    ) : (
                      <ArrowRight className="h-4 w-4 opacity-40" />
                    )}
                  </Link>
                </div>

                {/* =================================================
                    ACCOUNT
                ================================================== */}

                {isLoggedIn && (
                  <>
                    <div className="my-5 border-t border-gray-100" />

                    <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      My Account
                    </p>

                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        onClick={closeMenus}
                        className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-[#f85606]"
                      >
                        <span className="flex items-center gap-3">
                          <User className="h-[18px] w-[18px]" />
                          My Profile
                        </span>

                        <ArrowRight className="h-4 w-4 opacity-40" />
                      </Link>

                      <Link
                        href="/orders"
                        onClick={closeMenus}
                        className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-[#f85606]"
                      >
                        <span className="flex items-center gap-3">
                          <ShoppingBag className="h-[18px] w-[18px]" />
                          My Orders
                        </span>

                        <ArrowRight className="h-4 w-4 opacity-40" />
                      </Link>
                    </div>
                  </>
                )}

                {/* =================================================
                    CART
                ================================================== */}

                <div className="my-5 border-t border-gray-100" />

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openCart();
                  }}
                  className="flex w-full items-center justify-between rounded-xl bg-gray-50 px-3 py-3 text-sm font-bold text-gray-700 transition hover:bg-orange-50 hover:text-[#f85606]"
                >
                  <span className="flex items-center gap-3">
                    <ShoppingBag className="h-[18px] w-[18px]" />
                    Shopping Cart
                  </span>

                  {totalItems > 0 ? (
                    <span className="rounded-full bg-[#f85606] px-2 py-0.5 text-[10px] font-bold text-white">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  ) : (
                    <ArrowRight className="h-4 w-4 opacity-40" />
                  )}
                </button>

                {/* =================================================
                    LOGOUT
                ================================================== */}

                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-[18px] w-[18px]" />
                    Logout
                  </button>
                )}
              </div>

              {/* =================================================
                  DRAWER FOOTER
              ================================================== */}

              <div className="shrink-0 border-t border-gray-100 px-4 py-4">
                <p className="text-center text-[10px] font-medium text-gray-400">
                  VendorStore
                </p>

                <p className="mt-0.5 text-center text-[10px] text-gray-300">
                  Shop smarter. Save more.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
