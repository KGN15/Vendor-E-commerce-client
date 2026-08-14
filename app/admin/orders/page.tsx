"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  Eye,
  Package,
  Clock3,
  CheckCircle2,
  Truck,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/axios";

type Order = {
  _id: string;
  orderNumber?: string;

  // Support both possible backend fields
  status?: string;
  orderStatus?: string;

  paymentMethod?: string;
  paymentStatus?: string;
  totalAmount?: number;
  subtotal?: number;
  shippingFee?: number;
  paidAmount?: number;
  dueAmount?: number;

  customer?: {
    user?: {
      _id?: string;
      name?: string;
      email?: string;
    };
    name?: string;
    email?: string;
  };

  shippingAddress?: {
    fullName?: string;
    email?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };

  items?: Array<{
    quantity: number;
    price: number;
    product?: {
      _id?: string;
      name?: string;
      thumbnail?: string;
    };
    variant?: {
      size?: string;
      color?: string;
    };
  }>;

  createdAt?: string;
  updatedAt?: string;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80";

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
    icon: typeof Clock3;
  }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock3,
  },

  CONFIRMED: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: CheckCircle2,
  },

  PROCESSING: {
    label: "Processing",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Package,
  },

  SHIPPED: {
    label: "Shipped",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: Truck,
  },

  DELIVERED: {
    label: "Delivered",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },

  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },

  CANCELED: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

function getToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("vendorstore_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
}

/**
 * IMPORTANT:
 * Backend might return either:
 *
 * status: "SHIPPED"
 *
 * OR
 *
 * orderStatus: "SHIPPED"
 *
 * So frontend always uses this function.
 */
function getOrderStatus(order?: Order | null) {
  const rawStatus = order?.status ?? order?.orderStatus ?? "PENDING";

  return String(rawStatus)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function normalizeOrder(raw: any): Order {
  const order = raw?.order ?? raw;

  return {
    ...order,

    // Make sure frontend always has `status`
    status: String(
      order?.status ?? order?.orderStatus ?? order?.order_status ?? "PENDING",
    )
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_"),
  };
}

function formatMoney(value = 0) {
  return `$${Number(value).toFixed(2)}`;
}

function formatDate(value?: string) {
  if (!value) return "—";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatus(status?: string) {
  const normalized = String(status || "PENDING")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  return (
    statusConfig[normalized] || {
      label: normalized.replace(/_/g, " "),
      className: "bg-gray-50 text-gray-600 border-gray-200",
      icon: Clock3,
    }
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchOrders = async (isRefresh = false) => {
    const token = getToken();

    if (!token) {
      setError("Authentication required.");
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("ORDERS API RESPONSE:", response.data);

      const data = response?.data?.data;

      let rawOrders: any[] = [];

      if (Array.isArray(data)) {
        rawOrders = data;
      } else if (Array.isArray(data?.orders)) {
        rawOrders = data.orders;
      } else if (Array.isArray(response?.data?.orders)) {
        rawOrders = response.data.orders;
      }

      const normalizedOrders = rawOrders.map(normalizeOrder);

      console.log("NORMALIZED ORDERS:", normalizedOrders);

      setOrders(normalizedOrders);
    } catch (err: any) {
      console.error("Failed to fetch admin orders:", err);

      if (err?.response?.status === 401) {
        localStorage.removeItem("vendorstore_token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
      }

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load orders.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const status = getOrderStatus(order);

      const customerName =
        order.customer?.user?.name ||
        order.customer?.name ||
        order.shippingAddress?.fullName ||
        "";

      const customerEmail =
        order.customer?.user?.email ||
        order.customer?.email ||
        order.shippingAddress?.email ||
        "";

      const matchesSearch =
        !query ||
        String(order._id).toLowerCase().includes(query) ||
        String(order.orderNumber || "")
          .toLowerCase()
          .includes(query) ||
        customerName.toLowerCase().includes(query) ||
        customerEmail.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "ALL" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter((order) => getOrderStatus(order) === "PENDING")
        .length,

      processing: orders.filter((order) =>
        ["CONFIRMED", "PROCESSING"].includes(getOrderStatus(order)),
      ).length,

      delivered: orders.filter((order) => getOrderStatus(order) === "DELIVERED")
        .length,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#f85606]">
            Order Management
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
            Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage, review and process customer orders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Orders" value={stats.total} icon={Package} />

        <StatCard label="Pending" value={stats.pending} icon={Clock3} />

        <StatCard label="Processing" value={stats.processing} icon={Truck} />

        <StatCard
          label="Delivered"
          value={stats.delivered}
          icon={CheckCircle2}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

          <div>
            <p className="text-sm font-bold text-red-700">
              Unable to load orders
            </p>

            <p className="mt-1 text-xs text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID, customer name or email..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#f85606] focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none focus:border-[#f85606] focus:ring-2 focus:ring-orange-100"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900">All Orders</h2>

            <p className="mt-0.5 text-xs text-gray-500">
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1 ? "order" : "orders"} found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-[#f85606]" />

              <p className="text-xs font-medium text-gray-500">
                Loading orders...
              </p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
              <Package className="h-6 w-6 text-[#f85606]" />
            </div>

            <h3 className="mt-4 text-sm font-extrabold text-gray-900">
              No orders found
            </h3>

            <p className="mt-1 max-w-sm text-xs text-gray-500">
              {search || statusFilter !== "ALL"
                ? "Try changing your search or filter."
                : "Customer orders will appear here."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      Order
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      Customer
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      Items
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      Total
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <OrderRow key={order._id} order={order} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-gray-100 md:hidden">
              {filteredOrders.map((order) => (
                <MobileOrderCard key={order._id} order={order} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Package;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>

          <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
          <Icon className="h-4 w-4 text-[#f85606]" />
        </div>
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const status = getStatus(getOrderStatus(order));
  const StatusIcon = status.icon;

  const customerName =
    order.customer?.user?.name ||
    order.customer?.name ||
    order.shippingAddress?.fullName ||
    "Guest Customer";

  const customerEmail =
    order.customer?.user?.email ||
    order.customer?.email ||
    order.shippingAddress?.email ||
    "—";

  return (
    <tr className="transition-colors hover:bg-gray-50/60">
      <td className="px-5 py-4">
        <p className="text-sm font-extrabold text-gray-900">
          #{order.orderNumber || order._id.slice(-8).toUpperCase()}
        </p>

        <p className="mt-1 text-[11px] text-gray-400">
          {formatDate(order.createdAt)}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="max-w-[180px] truncate text-sm font-bold text-gray-800">
          {customerName}
        </p>

        <p className="mt-1 max-w-[200px] truncate text-[11px] text-gray-400">
          {customerEmail}
        </p>
      </td>

      <td className="px-5 py-4 text-sm font-semibold text-gray-700">
        {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-extrabold text-gray-900">
          {formatMoney(order.totalAmount)}
        </p>

        <p className="mt-1 text-[11px] text-gray-400">
          {order.paymentMethod || "COD"}
        </p>
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}
        >
          <StatusIcon className="h-3 w-3" />

          {status.label}
        </span>
      </td>

      <td className="px-5 py-4 text-right">
        <Link
          href={`/admin/orders/${order._id}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:border-[#f85606] hover:text-[#f85606]"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Link>
      </td>
    </tr>
  );
}

function MobileOrderCard({ order }: { order: Order }) {
  const status = getStatus(getOrderStatus(order));
  const StatusIcon = status.icon;

  const customerName =
    order.customer?.user?.name ||
    order.customer?.name ||
    order.shippingAddress?.fullName ||
    "Guest Customer";

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-gray-900">
            #{order.orderNumber || order._id.slice(-8).toUpperCase()}
          </p>

          <p className="mt-1 text-[11px] text-gray-400">
            {formatDate(order.createdAt)}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${status.className}`}
        >
          <StatusIcon className="h-3 w-3" />

          {status.label}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-800">{customerName}</p>

          <p className="mt-1 text-xs text-gray-400">
            {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}{" "}
            items
          </p>
        </div>

        <p className="text-lg font-black text-gray-900">
          {formatMoney(order.totalAmount)}
        </p>
      </div>

      <Link
        href={`/admin/orders/${order._id}`}
        className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 transition hover:border-[#f85606] hover:text-[#f85606]"
      >
        <Eye className="h-3.5 w-3.5" />
        View Order
      </Link>
    </div>
  );
}
