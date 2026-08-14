"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  FolderTree,
  MessageSquare,
  DollarSign,
  Clock3,
  CheckCircle2,
  Truck,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/axios";

type Analytics = {
  totalSalesRevenue: number;
  outstandingDueTotal: number;
  totalOrdersCount: number;
  lowStockVariantsCount: number;
  lowStockThreshold: number;
  recentActivityLogs: {
    _id: string;
    type?: string;
    message?: string;
    createdAt: string;
  }[];
};

type OrderStatus = {
  _id: string;
  count: number;
};

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [orders, setOrders] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    if (typeof window === "undefined") return null;

    return (
      localStorage.getItem("vendorstore_token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token")
    );
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Admin authentication required.");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [analyticsResponse, ordersResponse] = await Promise.all([
        api.get("/admin/analytics", config),
        api.get("/orders/admin/status-summary", config).catch(() => null),
      ]);

      setAnalytics(analyticsResponse.data?.data ?? null);

      if (ordersResponse?.data?.data) {
        setOrders(ordersResponse.data.data);
      }
    } catch (err: any) {
      console.error("Failed to load admin dashboard:", err);

      if (err?.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (err?.response?.status === 403) {
        setError("You do not have permission to access the admin panel.");
      } else {
        setError(
          err?.response?.data?.message || "Failed to load dashboard data.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatMoney = (value: number) =>
    `$${Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const getStatusCount = (status: string) =>
    orders.find((item) => item._id?.toLowerCase() === status.toLowerCase())
      ?.count ?? 0;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-[#f85606]" />
          <p className="text-sm text-gray-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>

          <h2 className="mt-4 text-lg font-extrabold text-gray-900">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-gray-500">{error}</p>

          <button
            onClick={fetchDashboard}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#f85606] px-5 text-sm font-bold text-white hover:bg-[#df4d03]"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: formatMoney(analytics?.totalSalesRevenue ?? 0),
      icon: DollarSign,
      href: "/admin/revenue",
      description: "Total paid revenue",
    },
    {
      label: "Total Orders",
      value: analytics?.totalOrdersCount ?? 0,
      icon: ShoppingBag,
      href: "/admin/orders",
      description: "All customer orders",
    },
    {
      label: "Outstanding Due",
      value: formatMoney(analytics?.outstandingDueTotal ?? 0),
      icon: Clock3,
      href: "/admin/orders",
      description: "Pending payments",
    },
    {
      label: "Low Stock",
      value: analytics?.lowStockVariantsCount ?? 0,
      icon: AlertTriangle,
      href: "/admin/products",
      description: `Stock ≤ ${analytics?.lowStockThreshold ?? 5}`,
    },
  ];

  const quickActions = [
    {
      title: "Add Product",
      description: "Create a new product",
      href: "/admin/products/new",
      icon: Package,
    },
    {
      title: "Add Category",
      description: "Create product category",
      href: "/admin/categories",
      icon: FolderTree,
    },
    {
      title: "Manage Orders",
      description: "Review and process orders",
      href: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      title: "View Users",
      description: "Manage customers",
      href: "/admin/users",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#f85606]">
            Admin Panel
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor your store performance and manage operations.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 transition hover:border-[#f85606] hover:text-[#f85606]"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                  <Icon className="h-5 w-5 text-[#f85606]" />
                </div>

                <ArrowUpRight className="h-4 w-4 text-gray-300 transition group-hover:text-[#f85606]" />
              </div>

              <p className="mt-5 text-xs font-semibold text-gray-500">
                {stat.label}
              </p>

              <p className="mt-1 text-2xl font-black tracking-tight text-gray-900">
                {stat.value}
              </p>

              <p className="mt-1 text-[11px] text-gray-400">
                {stat.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Order Overview */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">
            <div>
              <h2 className="text-base font-extrabold text-gray-900">
                Order Overview
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Current order pipeline
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#f85606] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 divide-x divide-gray-100 sm:grid-cols-4">
            <OrderStatusCard
              label="Pending"
              value={getStatusCount("PENDING")}
              icon={Clock3}
            />

            <OrderStatusCard
              label="Approved"
              value={getStatusCount("APPROVED")}
              icon={CheckCircle2}
            />

            <OrderStatusCard
              label="Shipping"
              value={getStatusCount("SHIPPED")}
              icon={Truck}
            />

            <OrderStatusCard
              label="Delivered"
              value={getStatusCount("DELIVERED")}
              icon={CheckCircle2}
            />
          </div>

          <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">
                Total orders
              </span>

              <span className="text-sm font-black text-gray-900">
                {analytics?.totalOrdersCount ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-5">
            <h2 className="text-base font-extrabold text-gray-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Common management tasks
            </p>
          </div>

          <div className="p-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-orange-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 transition group-hover:bg-white">
                    <Icon className="h-4 w-4 text-gray-600 group-hover:text-[#f85606]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800">
                      {action.title}
                    </p>

                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {action.description}
                    </p>
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-[#f85606]" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">
            <div>
              <h2 className="text-base font-extrabold text-gray-900">
                Recent Activity
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Latest store activity
              </p>
            </div>

            <BarChart3 className="h-5 w-5 text-gray-300" />
          </div>

          <div className="divide-y divide-gray-100">
            {analytics?.recentActivityLogs?.length ? (
              analytics.recentActivityLogs.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-start gap-3 px-5 py-4"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                    <MessageSquare className="h-3.5 w-3.5 text-[#f85606]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-5 text-gray-700">
                      {activity.message || "Store activity"}
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center">
                <MessageSquare className="mx-auto h-6 w-6 text-gray-300" />
                <p className="mt-2 text-xs text-gray-400">
                  No recent activity.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Management Overview */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-5">
            <h2 className="text-base font-extrabold text-gray-900">
              Store Management
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Manage the main parts of your store
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-3">
            <AdminLink href="/admin/products" icon={Package} label="Products" />

            <AdminLink
              href="/admin/categories"
              icon={FolderTree}
              label="Categories"
            />

            <AdminLink href="/admin/orders" icon={ShoppingBag} label="Orders" />

            <AdminLink href="/admin/users" icon={Users} label="Users" />

            <AdminLink
              href="/admin/reviews"
              icon={MessageSquare}
              label="Reviews"
            />

            <AdminLink href="/admin/revenue" icon={BarChart3} label="Revenue" />
          </div>
        </div>
      </div>

      {/* Low Stock Warning */}
      {(analytics?.lowStockVariantsCount ?? 0) > 0 && (
        <Link
          href="/admin/products"
          className="flex items-center gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-5 transition hover:bg-orange-100"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
            <AlertTriangle className="h-5 w-5 text-[#f85606]" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-extrabold text-gray-900">
              Low stock alert
            </h3>

            <p className="mt-1 text-xs text-gray-600">
              {analytics?.lowStockVariantsCount ?? 0} product variant
              {(analytics?.lowStockVariantsCount ?? 0) === 1 ? "" : "s"}{" "}
              currently have stock at or below{" "}
              {analytics?.lowStockThreshold ?? 5}.
            </p>
          </div>

          <ArrowUpRight className="h-5 w-5 text-[#f85606]" />
        </Link>
      )}
    </div>
  );
}

function OrderStatusCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="px-4 py-5 text-center">
      <Icon className="mx-auto h-4 w-4 text-gray-400" />

      <p className="mt-2 text-xl font-black text-gray-900">{value}</p>

      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
    </div>
  );
}

function AdminLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-[100px] flex-col items-center justify-center bg-white p-4 text-center transition hover:bg-orange-50"
    >
      <Icon className="h-5 w-5 text-gray-500 transition-colors hover:text-[#f85606]" />

      <span className="mt-2 text-xs font-bold text-gray-700">{label}</span>
    </Link>
  );
}
