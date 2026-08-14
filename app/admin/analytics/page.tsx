"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Activity,
} from "lucide-react";
import { api } from "@/lib/axios";

type Analytics = {
  totalSalesRevenue: number;
  outstandingDueTotal: number;
  totalOrdersCount: number;
  lowStockVariantsCount: number;
  lowStockThreshold: number;
  recentActivityLogs: Array<{
    _id: string;
    type?: string;
    message?: string;
    createdAt: string;
  }>;
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalytics = async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError("");

      const response = await api.get("/admin/analytics");

      setData(response.data?.data ?? null);
    } catch (err: any) {
      console.error("Failed to fetch analytics:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load analytics. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-semibold text-red-700">{error}</p>

        <button
          onClick={() => fetchAnalytics()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#f85606] px-4 py-2 text-sm font-bold text-white hover:bg-[#df4d03]"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      title: "Total Revenue",
      value: `$${Number(data.totalSalesRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      description: "Total paid revenue",
    },
    {
      title: "Outstanding Due",
      value: `$${Number(data.outstandingDueTotal || 0).toFixed(2)}`,
      icon: DollarSign,
      description: "Unpaid amount",
    },
    {
      title: "Total Orders",
      value: data.totalOrdersCount.toLocaleString(),
      icon: ShoppingBag,
      description: "Orders placed",
    },
    {
      title: "Low Stock",
      value: data.lowStockVariantsCount.toLocaleString(),
      icon: AlertTriangle,
      description: `Stock ≤ ${data.lowStockThreshold}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#f85606]" />

            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Analytics
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Monitor your store performance and activity.
          </p>
        </div>

        <button
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 shadow-sm transition hover:border-[#f85606] hover:text-[#f85606] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-2xl font-black text-gray-900">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {stat.description}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <Icon className="h-5 w-5 text-[#f85606]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#f85606]" />

            <div>
              <h2 className="text-sm font-extrabold text-gray-900">
                Recent Activity
              </h2>

              <p className="mt-0.5 text-xs text-gray-400">
                Latest activity across your store
              </p>
            </div>
          </div>
        </div>

        {data.recentActivityLogs?.length ? (
          <div className="divide-y divide-gray-100">
            {data.recentActivityLogs.map((activity) => (
              <div
                key={activity._id}
                className="flex items-start gap-3 px-5 py-4"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50">
                  <Activity className="h-4 w-4 text-[#f85606]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {activity.message || "Store activity"}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {activity.createdAt
                      ? new Date(activity.createdAt).toLocaleString()
                      : "Unknown time"}
                  </p>
                </div>

                {activity.type && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase text-gray-500">
                    {activity.type}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <Activity className="mx-auto h-8 w-8 text-gray-300" />

            <p className="mt-3 text-sm font-semibold text-gray-500">
              No recent activity
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
