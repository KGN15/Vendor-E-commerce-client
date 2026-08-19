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
  MessageSquare,
  Clock3,
  CheckCircle2,
  CircleDot,
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

interface IBugReport {
  _id: string;
  title: string;
  category: string;
  description: string;
  status: "pending" | "in_progress" | "resolved" | "closed" | string;
  adminReply?: string | null;
  repliedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
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

const formatDate = (date?: string | null) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusConfig = (status: string) => {
  switch (status?.toLowerCase()) {
    case "resolved":
      return {
        label: "Resolved",
        className: "bg-green-50 text-green-700 border-green-100",
        icon: CheckCircle2,
      };

    case "in_progress":
    case "in-progress":
    case "processing":
      return {
        label: "In Progress",
        className: "bg-blue-50 text-blue-700 border-blue-100",
        icon: CircleDot,
      };

    case "closed":
      return {
        label: "Closed",
        className: "bg-gray-100 text-gray-700 border-gray-200",
        icon: CheckCircle2,
      };

    default:
      return {
        label: "Pending",
        className: "bg-orange-50 text-orange-700 border-orange-100",
        icon: Clock3,
      };
  }
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

  const [bugReports, setBugReports] = useState<IBugReport[]>([]);
  const [bugReportsLoading, setBugReportsLoading] = useState(true);
  const [bugReportsError, setBugReportsError] = useState<string | null>(null);

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

  /* =======================================================
     FETCH MY BUG REPORTS
  ======================================================= */

  const fetchMyBugReports = async () => {
    try {
      setBugReportsLoading(true);
      setBugReportsError(null);

      const response = await api.get("/bug-reports/my");

      const reports =
        response.data?.data?.reports ||
        response.data?.reports ||
        response.data?.data ||
        [];

      setBugReports(Array.isArray(reports) ? reports : []);
    } catch (err: any) {
      console.error("Failed to fetch bug reports:", err);

      const status = err?.response?.status;

      if (status === 401) {
        setBugReportsError("Your session has expired. Please sign in again.");
      } else if (status === 403) {
        setBugReportsError(
          "You do not have permission to view your bug reports.",
        );
      } else {
        setBugReportsError(
          err?.response?.data?.message ||
            "Unable to load your bug reports right now.",
        );
      }
    } finally {
      setBugReportsLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchProfile();
    fetchMyBugReports();
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
              onClick={() => {
                fetchProfile(true);
                fetchMyBugReports();
              }}
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

          <div className="space-y-5">
            {/* =================================================
                PROFILE
            ================================================= */}

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
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

                    <Link
                      href="/profile/edit"
                      className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-[#f85606] text-white shadow-sm transition hover:bg-[#df4d03]"
                      aria-label="Change profile photo"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </Link>
                  </div>

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
                MY BUG REPORTS
            ================================================= */}

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-red-500" />

                    <h2 className="text-base font-black text-gray-900">
                      My Bug Reports
                    </h2>
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Track your submitted reports and admin responses.
                  </p>
                </div>

                <Link
                  href="/bug-report"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#f85606] px-3.5 text-xs font-bold text-white transition hover:bg-[#df4d03]"
                >
                  <Bug className="h-3.5 w-3.5" />
                  Report a bug
                </Link>
              </div>

              {/* Loading */}

              {bugReportsLoading ? (
                <div className="mt-5 space-y-3">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-xl border border-gray-100 p-4"
                    >
                      <div className="h-4 w-48 rounded bg-gray-200" />
                      <div className="mt-3 h-3 w-full rounded bg-gray-100" />
                      <div className="mt-2 h-3 w-3/4 rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : bugReportsError ? (
                /* Error */

                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-red-700">
                        Unable to load reports
                      </p>

                      <p className="mt-1 text-xs leading-5 text-red-600">
                        {bugReportsError}
                      </p>

                      <button
                        type="button"
                        onClick={fetchMyBugReports}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-red-700 hover:text-red-800"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              ) : bugReports.length === 0 ? (
                /* Empty */

                <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm">
                    <Bug className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 text-sm font-black text-gray-800">
                    No bug reports yet
                  </h3>

                  <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-gray-500">
                    If you find something that isn't working correctly, let us
                    know and we'll investigate it.
                  </p>

                  <Link
                    href="/bug-report"
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 transition hover:border-[#f85606] hover:text-[#f85606]"
                  >
                    <Bug className="h-3.5 w-3.5" />
                    Report your first bug
                  </Link>
                </div>
              ) : (
                /* Reports */

                <div className="mt-5 space-y-3">
                  {bugReports.map((report) => {
                    const status = getStatusConfig(report.status);
                    const StatusIcon = status.icon;

                    return (
                      <motion.div
                        key={report._id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-gray-100 bg-white p-4 transition hover:border-gray-200"
                      >
                        {/* Report Header */}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-black text-gray-900">
                                {report.title}
                              </h3>

                              <span className="rounded-md bg-gray-50 px-2 py-1 text-[10px] font-bold text-gray-500">
                                {report.category}
                              </span>
                            </div>

                            {report.createdAt && (
                              <p className="mt-1.5 text-[11px] text-gray-400">
                                Submitted {formatDate(report.createdAt)}
                              </p>
                            )}
                          </div>

                          {/* Status */}

                          <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </div>

                        {/* Description */}

                        <div className="mt-4 rounded-lg bg-gray-50 p-3.5">
                          <p className="text-xs font-bold text-gray-600">
                            Your report
                          </p>

                          <p className="mt-1.5 whitespace-pre-wrap text-xs leading-5 text-gray-600">
                            {report.description}
                          </p>
                        </div>

                        {/* Admin Reply */}

                        {report.adminReply ? (
                          <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3.5">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-600" />

                              <p className="text-xs font-black text-blue-800">
                                Admin response
                              </p>
                            </div>

                            <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-blue-800">
                              {report.adminReply}
                            </p>

                            {report.repliedAt && (
                              <p className="mt-2 text-[10px] text-blue-500">
                                Replied {formatDate(report.repliedAt)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="mt-3 flex items-center gap-2 rounded-lg bg-orange-50 px-3.5 py-3">
                            <Clock3 className="h-4 w-4 text-orange-500" />

                            <p className="text-xs font-medium text-orange-700">
                              No admin response yet. We'll review your report
                              soon.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
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
