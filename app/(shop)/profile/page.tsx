// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/axios";
import { useStore } from "@/lib/store";
import {
  Mail,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  LogOut,
  ShoppingBag,
  Heart,
  Package,
  ChevronRight,
  X,
  Pencil,
  Bug,
  HelpCircle,
  KeyRound,
  Camera,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface IUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  avatar?: string | null;
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

/* =========================================================
   PAGE
========================================================= */

export default function ProfilePage() {
  const setStoreUser = useStore((state) => state.setUser);

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

      const response = await api.get("/auth/me");

      const userData =
        response.data?.data?.user ||
        response.data?.user ||
        response.data?.data ||
        response.data;

      if (!userData) {
        throw new Error("User profile was not returned.");
      }

      const currentUser: IUser = {
        _id: userData._id,
        id: userData.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar ?? null,
      };

      setUser(currentUser);

      /*
       * Keep Zustand auth state synchronized.
       */
      setStoreUser(userData);
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
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 h-5 w-28 animate-pulse rounded bg-gray-200" />

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200" />

              <div className="w-full space-y-3">
                <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
              </div>
            </div>

            <div className="mt-8 h-24 animate-pulse rounded-xl bg-gray-100" />

            <div className="mt-4 h-24 animate-pulse rounded-xl bg-gray-100" />

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
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
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-50">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>

          <h1 className="mt-5 text-xl font-black text-gray-900">
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

  const quickActions = [
    {
      title: "My Orders",
      description: "Track and manage purchases",
      href: "/orders",
      icon: Package,
      iconClass: "bg-orange-50 text-[#f85606]",
    },
    {
      title: "Wishlist",
      description: "View your saved products",
      href: "/wishlist",
      icon: Heart,
      iconClass: "bg-rose-50 text-rose-500",
    },
    {
      title: "Shop Products",
      description: "Explore available products",
      href: "/products",
      icon: ShoppingBag,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      title: "Update Password",
      description: "Change your account password",
      href: "/profile/password",
      icon: KeyRound,
      iconClass: "bg-purple-50 text-purple-600",
    },
  ];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <main className="min-h-[calc(100vh-72px)] bg-[#f7f7f7] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* =================================================
              TOP
          ================================================= */}

          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#f85606]"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to store
            </Link>

            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              My Profile
            </span>
          </div>

          {/* =================================================
              PROFILE
          ================================================= */}

          <div className="space-y-5">
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                {/* Avatar + User */}

                <div className="flex items-center gap-4">
                  <div className="relative">
                    {/* Avatar */}

                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-2xl font-black text-[#f85606] ring-1 ring-orange-100">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={`${user.name}'s profile`}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    {/* Camera */}

                    <Link
                      href="/profile/edit"
                      className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-[#f85606] text-white shadow-sm transition hover:bg-[#df4d03]"
                      aria-label="Change profile photo"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* User info */}

                  <div className="min-w-0">
                    <h1 className="truncate text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                      {user.name}
                    </h1>

                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4 shrink-0" />

                      <span className="truncate">{user.email}</span>
                    </p>
                  </div>
                </div>

                {/* Edit */}

                <Link
                  href="/profile/edit"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-xs font-black text-gray-700 transition hover:border-[#f85606] hover:text-[#f85606]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit profile
                </Link>
              </div>
            </motion.section>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div>
                <h2 className="text-base font-black text-gray-900">
                  Quick actions
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Manage your account and shopping activity.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="group flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-orange-100 hover:bg-orange-50/30"
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.iconClass}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-800 transition group-hover:text-[#f85606]">
                          {action.title}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-gray-400">
                          {action.description}
                        </p>
                      </div>

                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#f85606]" />
                    </Link>
                  );
                })}
              </div>
            </motion.section>

            {/* =================================================
                SUPPORT
            ================================================= */}

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div>
                <h2 className="text-base font-black text-gray-900">Support</h2>

                <p className="mt-1 text-xs text-gray-500">
                  Need help? We're here to help.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/help"
                  className="group flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-blue-100 hover:bg-blue-50/30"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <HelpCircle className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600">
                      Help & Support
                    </p>

                    <p className="mt-0.5 text-xs text-gray-400">
                      Get help with your account or orders
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </Link>

                <Link
                  href="/bug-report"
                  className="group flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-red-100 hover:bg-red-50/30"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <Bug className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 group-hover:text-red-500">
                      Report a Bug
                    </p>

                    <p className="mt-0.5 text-xs text-gray-400">
                      Tell us about a problem you found
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </Link>
              </div>
            </motion.section>

            {/* =================================================
                LOGOUT
            ================================================= */}

            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-5 py-4 text-sm font-bold text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
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

              <h2 className="mt-5 text-lg font-black text-gray-900">
                Sign out of your account?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                You'll need to sign in again to access your account.
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
