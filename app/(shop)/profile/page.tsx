// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/axios";
import {
  User,
  Mail,
  ShieldCheck,
  CalendarDays,
  Clock3,
  ArrowLeft,
  Store,
  Loader2,
  AlertCircle,
  RefreshCw,
  LogOut,
  ShoppingBag,
  Heart,
  Package,
  Settings,
  ChevronRight,
  CheckCircle2,
  Shield,
  KeyRound,
  Sparkles,
  Activity,
  CircleUserRound,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface IUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  authProvider: string;
  googleId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/* =========================================================
   HELPERS
========================================================= */

const getInitials = (name: string) => {
  if (!name?.trim()) return "U";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const formatDate = (date: string | Date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
};

const formatDateTime = (date: string | Date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
};

const formatRole = (role: string) => {
  if (!role) return "Customer";

  return role
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatProvider = (provider: string) => {
  if (!provider) return "Email";

  if (provider.toLowerCase() === "google") {
    return "Google";
  }

  return provider
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

/* =========================================================
   ANIMATION
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

/* =========================================================
   PAGE
========================================================= */

export default function ProfilePage() {
  const [user, setUser] = useState<IUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  /* =======================================================
      FETCH PROFILE
  ======================================================= */

  const fetchProfile = async (isRetry = false) => {
    try {
      if (isRetry) {
        setRetrying(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const res = await api.get("/auth/me");

      const userData =
        res.data?.user || res.data?.data?.user || res.data?.data || res.data;

      if (!userData) {
        throw new Error("User profile was not returned.");
      }

      setUser(userData);
    } catch (err: any) {
      console.error("Failed to fetch profile:", err);

      const status = err?.response?.status;

      if (status === 401) {
        setError("Your session has expired. Please sign in again.");
      } else if (status === 403) {
        setError("You do not have permission to access this profile.");
      } else if (status >= 500) {
        setError("Server error. Please try again later.");
      } else if (!err?.response) {
        setError(
          "Unable to connect to the server. Please check your internet connection.",
        );
      } else {
        setError(
          err?.response?.data?.message ||
            "Unable to load your profile. Please try again.",
        );
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* =======================================================
      LOGOUT
  ======================================================= */

  const handleLogout = () => {
    try {
      setLoggingOut(true);

      localStorage.removeItem("vendorstore_token");
      localStorage.removeItem("vendor-ecom-storage");

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  /* =======================================================
      LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#f7f7f7] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="h-52 animate-pulse bg-gray-100" />

            <div className="px-5 pb-8 sm:px-8 lg:px-10">
              <div className="-mt-14 flex items-end justify-between">
                <div className="h-28 w-28 animate-pulse rounded-2xl bg-gray-200 ring-4 ring-white" />
                <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-100" />
              </div>

              <div className="mt-5 space-y-3">
                <div className="h-8 w-52 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-4 w-72 animate-pulse rounded bg-gray-100" />
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-xl bg-gray-100"
                  />
                ))}
              </div>

              <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
                <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
                <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
      ERROR
  ======================================================= */

  if (error || !user) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f7f7f7] px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>

          <h1 className="mt-5 text-xl font-extrabold text-gray-900">
            Unable to load profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error || "We couldn't find your account information."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => fetchProfile(true)}
              disabled={retrying}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#f85606] px-4 text-sm font-bold text-white transition hover:bg-[#df4d03] disabled:opacity-60"
            >
              {retrying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Try again
            </button>

            <Link
              href="/login"
              className="flex h-11 flex-1 items-center justify-center rounded-lg border border-gray-200 text-sm font-bold text-gray-700 transition hover:border-[#f85606] hover:text-[#f85606]"
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  /* =======================================================
      DATA
  ======================================================= */

  const initials = getInitials(user.name);

  const profileItems = [
    {
      label: "Full name",
      value: user.name,
      icon: User,
    },
    {
      label: "Email address",
      value: user.email,
      icon: Mail,
    },
    {
      label: "Account role",
      value: formatRole(user.role),
      icon: Shield,
    },
    {
      label: "Sign-in method",
      value: formatProvider(user.authProvider),
      icon: ShieldCheck,
    },
  ];

  const quickActions = [
    {
      title: "My Orders",
      description: "Track and manage your purchases",
      href: "/orders",
      icon: Package,
      iconClass: "bg-orange-50 text-[#f85606]",
    },
    {
      title: "Wishlist",
      description: "Products you've saved for later",
      href: "/wishlist",
      icon: Heart,
      iconClass: "bg-rose-50 text-rose-500",
    },
    {
      title: "Shop Products",
      description: "Explore the latest products",
      href: "/products",
      icon: ShoppingBag,
      iconClass: "bg-blue-50 text-blue-600",
    },
  ];

  /* =======================================================
      UI
  ======================================================= */

  return (
    <>
      <main className="min-h-[calc(100vh-72px)] bg-[#f7f7f7] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* =================================================
              TOP BAR
          ================================================= */}

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-center justify-between"
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#f85606]"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to store
            </Link>

            <Link
              href="/"
              className="flex items-center gap-2 font-extrabold text-gray-900"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                <Store className="h-4 w-4 text-[#f85606]" />
              </div>

              <span className="hidden sm:block">VendorStore</span>
            </Link>
          </motion.div>

          {/* =================================================
              MAIN PROFILE
          ================================================= */}

          <motion.section
            initial="hidden"
            animate="show"
            variants={stagger}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            {/* =================================================
                COVER
            ================================================= */}

            <div className="relative h-48 overflow-hidden bg-[#f85606] sm:h-56">
              {/* Background pattern */}

              <div className="absolute inset-0 opacity-20">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "24px 24px",
                  }}
                />
              </div>

              <motion.div
                animate={{
                  x: [0, 20, 0],
                  y: [0, -10, 0],
                  rotate: [0, 4, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[55px] border-white/10"
              />

              <motion.div
                animate={{
                  x: [0, -15, 0],
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-52 -left-24 h-96 w-96 rounded-full border-[60px] border-white/10"
              />

              <div className="absolute right-6 top-6">
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                  <CircleUserRound className="h-3.5 w-3.5" />
                  Account
                </div>
              </div>

              <div className="absolute bottom-7 left-6 text-white sm:left-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
                    Welcome back
                  </span>
                </div>

                <p className="mt-1 text-sm text-white/80">
                  Manage your VendorStore account
                </p>
              </div>
            </div>

            {/* =================================================
                PROFILE INTRO
            ================================================= */}

            <div className="px-5 pb-8 sm:px-8 lg:px-10">
              <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
                {/* Avatar */}

                <motion.div
                  variants={fadeUp}
                  className="relative flex h-28 w-28 items-center justify-center rounded-2xl bg-white p-1.5 shadow-lg ring-4 ring-white"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-orange-50 text-3xl font-black text-[#f85606]">
                    {initials}
                  </div>

                  <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-green-500">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </span>
                </motion.div>

                {/* Logout */}

                <motion.button
                  variants={fadeUp}
                  type="button"
                  onClick={() => setLogoutOpen(true)}
                  className="group flex h-10 w-fit items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 text-sm font-bold text-red-600 transition hover:border-red-200 hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                  Logout
                </motion.button>
              </div>

              {/* Name */}

              <motion.div variants={fadeUp} className="mt-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                    {user.name}
                  </h1>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Active
                  </span>
                </div>

                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </p>
              </motion.div>

              {/* =================================================
                  MINI STATS
              ================================================= */}

              <motion.div
                variants={stagger}
                className="mt-7 grid gap-3 sm:grid-cols-3"
              >
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition hover:border-orange-100 hover:bg-orange-50/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                      <CalendarDays className="h-4 w-4 text-[#f85606]" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Member since
                      </p>

                      <p className="mt-1 truncate text-sm font-bold text-gray-800">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition hover:border-blue-100 hover:bg-blue-50/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Account type
                      </p>

                      <p className="mt-1 text-sm font-bold text-gray-800">
                        {formatRole(user.role)}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition hover:border-green-100 hover:bg-green-50/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                      <KeyRound className="h-4 w-4 text-green-600" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Sign-in method
                      </p>

                      <p className="mt-1 text-sm font-bold text-gray-800">
                        {formatProvider(user.authProvider)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* =================================================
                  CONTENT GRID
              ================================================= */}

              <div className="mt-7 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
                {/* =================================================
                    LEFT
                ================================================= */}

                <div className="space-y-5">
                  {/* Account Information */}

                  <motion.section
                    variants={fadeUp}
                    className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
                            <User className="h-4 w-4 text-[#f85606]" />
                          </div>

                          <h2 className="text-sm font-extrabold text-gray-900">
                            Account information
                          </h2>
                        </div>

                        <p className="mt-1 ml-10 text-xs text-gray-500">
                          Your basic account and authentication details.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {profileItems.map((item) => {
                        const Icon = item.icon;

                        return (
                          <motion.div
                            key={item.label}
                            whileHover={{ y: -2 }}
                            className="group rounded-xl border border-gray-100 bg-gray-50/60 p-4 transition hover:border-orange-100 hover:bg-orange-50/20"
                          >
                            <div className="flex gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-400 shadow-sm ring-1 ring-gray-100 transition group-hover:text-[#f85606]">
                                <Icon className="h-4 w-4" />
                              </div>

                              <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                  {item.label}
                                </p>

                                <p className="mt-1 truncate text-sm font-bold text-gray-800">
                                  {item.value}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.section>

                  {/* Account Activity */}

                  <motion.section
                    variants={fadeUp}
                    className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                        <Activity className="h-4 w-4 text-gray-600" />
                      </div>

                      <div>
                        <h2 className="text-sm font-extrabold text-gray-900">
                          Account activity
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">
                          Important dates related to your account.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                          <CalendarDays className="h-4 w-4 text-[#f85606]" />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Joined VendorStore
                          </p>

                          <p className="mt-1 text-sm font-bold text-gray-800">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <Clock3 className="h-4 w-4 text-gray-500" />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Last updated
                          </p>

                          <p className="mt-1 text-sm font-bold text-gray-800">
                            {formatDateTime(user.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.section>
                </div>

                {/* =================================================
                    RIGHT
                ================================================= */}

                <div className="space-y-5">
                  {/* Quick Actions */}

                  <motion.section
                    variants={fadeUp}
                    className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
                        <Sparkles className="h-4 w-4 text-[#f85606]" />
                      </div>

                      <div>
                        <h2 className="text-sm font-extrabold text-gray-900">
                          Quick actions
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">
                          Jump to your account sections.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {quickActions.map((action) => {
                        const Icon = action.icon;

                        return (
                          <Link
                            key={action.title}
                            href={action.href}
                            className="group flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-orange-100 hover:bg-orange-50/30"
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.iconClass}`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-gray-800 transition group-hover:text-[#f85606]">
                                {action.title}
                              </p>

                              <p className="mt-0.5 truncate text-[11px] text-gray-400">
                                {action.description}
                              </p>
                            </div>

                            <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#f85606]" />
                          </Link>
                        );
                      })}
                    </div>
                  </motion.section>

                  {/* Security */}

                  <motion.section
                    variants={fadeUp}
                    className="overflow-hidden rounded-2xl border border-green-100 bg-green-50/60"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                          <ShieldCheck className="h-5 w-5 text-green-600" />
                        </div>

                        <div>
                          <h2 className="text-sm font-extrabold text-green-900">
                            Account protected
                          </h2>

                          <p className="mt-1 text-xs leading-5 text-green-700">
                            Your sensitive authentication information is never
                            displayed here.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-green-100 bg-white/70 p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />

                          <span className="text-xs font-bold text-green-800">
                            {formatProvider(user.authProvider)} authentication
                            active
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.section>
                </div>
              </div>

              {/* =================================================
                  SETTINGS PLACEHOLDER
              ================================================= */}

              <motion.div
                variants={fadeUp}
                className="mt-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Settings className="h-4 w-4 text-gray-500" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      More account settings
                    </p>

                    <p className="text-xs text-gray-500">
                      Additional profile settings can be added here later.
                    </p>
                  </div>
                </div>

                <span className="w-fit rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 ring-1 ring-gray-200">
                  Coming soon
                </span>
              </motion.div>
            </div>
          </motion.section>

          {/* Footer */}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-5 text-center text-[10px] text-gray-400"
          >
            VendorStore · Your account, all in one place.
          </motion.p>
        </div>
      </main>

      {/* =======================================================
          LOGOUT MODAL
      ======================================================= */}

      <AnimatePresence>
        {logoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
            onClick={() => !loggingOut && setLogoutOpen(false)}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                y: 15,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                  <LogOut className="h-5 w-5 text-red-500" />
                </div>

                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={() => setLogoutOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h2 className="mt-5 text-lg font-extrabold text-gray-900">
                Sign out of your account?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                You'll need to sign in again to access your VendorStore account.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={() => setLogoutOpen(false)}
                  className="flex h-11 flex-1 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={handleLogout}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
