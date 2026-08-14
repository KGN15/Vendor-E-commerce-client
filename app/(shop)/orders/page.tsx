// app/order/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/axios";
import {
  ArrowLeft,
  Package,
  Clock3,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronRight,
  Loader2,
  RefreshCw,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  CreditCard,
  AlertCircle,
} from "lucide-react";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type PaymentStatus = "PENDING" | "PARTIAL" | "PAID";

type OrderItem = {
  variant: string;
  product: string;
  productName: string;
  barcode: string;
  size?: string;
  color?: string;
  design?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type Order = {
  _id: string;
  customer: {
    user: string;
    name: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod: "COD" | "ONLINE";
  courierProvider?: "STEADFAST" | "PATHAO";
  consignmentId?: string;
  courierStatus?: string;
  createdAt: string;
  updatedAt: string;
};

type Filter =
  | "ALL"
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    icon: typeof Clock3;
    className: string;
  }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock3,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PROCESSING: {
    label: "Processing",
    icon: Package,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

const paymentConfig: Record<
  PaymentStatus,
  {
    label: string;
    className: string;
  }
> = {
  PENDING: {
    label: "Payment Pending",
    className: "text-amber-700 bg-amber-50 border-amber-200",
  },
  PARTIAL: {
    label: "Partially Paid",
    className: "text-blue-700 bg-blue-50 border-blue-200",
  },
  PAID: {
    label: "Paid",
    className: "text-green-700 bg-green-50 border-green-200",
  },
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
};

const formatCurrency = (amount: number) => {
  return `$${Number(amount || 0).toFixed(2)}`;
};

const getToken = () => {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("vendorstore_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async (isRefresh = false) => {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response = await api.get("/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data?.data || []);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);

      if (err?.response?.status === 401) {
        localStorage.removeItem("vendorstore_token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");

        window.location.href = "/login";
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to load your orders.",
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
    if (filter === "ALL") return orders;

    return orders.filter((order) => order.orderStatus === filter);
  }, [orders, filter]);

  const counts = useMemo(() => {
    return {
      ALL: orders.length,
      PENDING: orders.filter((o) => o.orderStatus === "PENDING").length,
      PROCESSING: orders.filter((o) => o.orderStatus === "PROCESSING").length,
      SHIPPED: orders.filter((o) => o.orderStatus === "SHIPPED").length,
      DELIVERED: orders.filter((o) => o.orderStatus === "DELIVERED").length,
      CANCELLED: orders.filter((o) => o.orderStatus === "CANCELLED").length,
    };
  }, [orders]);

  return (
    <main className="min-h-screen bg-[#f7f7f7] text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition hover:text-[#f85606]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Store
            </Link>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f85606]">
              My Account
            </p>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-900">
              My Orders
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Track and manage all your orders in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 shadow-sm transition hover:border-[#f85606] hover:text-[#f85606] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </motion.div>

        {/* Stats */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          >
            {(
              [
                ["ALL", "All Orders"],
                ["PENDING", "Pending"],
                ["PROCESSING", "Processing"],
                ["SHIPPED", "Shipped"],
                ["DELIVERED", "Delivered"],
                ["CANCELLED", "Cancelled"],
              ] as [Filter, string][]
            ).map(([key, label]) => {
              const active = filter === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    active
                      ? "border-[#f85606] bg-orange-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {label}
                  </p>

                  <p
                    className={`mt-1 text-xl font-black ${
                      active ? "text-[#f85606]" : "text-gray-900"
                    }`}
                  >
                    {counts[key]}
                  </p>
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

              <div>
                <p className="text-sm font-bold text-red-700">
                  Unable to load orders
                </p>

                <p className="mt-1 text-xs text-red-600">{error}</p>

                <button
                  onClick={() => fetchOrders()}
                  className="mt-3 text-xs font-bold text-red-700 underline"
                >
                  Try again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[45vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-[#f85606]" />
              <p className="text-xs font-medium text-gray-500">
                Loading your orders...
              </p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredOrders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
              <ShoppingBag className="h-7 w-7 text-[#f85606]" />
            </div>

            <h2 className="mt-5 text-xl font-black text-gray-900">
              {filter === "ALL"
                ? "No orders yet"
                : `No ${filter.toLowerCase()} orders`}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {filter === "ALL"
                ? "You haven't placed any orders yet. Start shopping and your orders will appear here."
                : "There are no orders with this status right now."}
            </p>

            {filter === "ALL" && (
              <Link
                href="/"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[#f85606] px-6 text-xs font-extrabold text-white transition hover:bg-[#df4d03]"
              >
                <ShoppingBag className="h-4 w-4" />
                Start Shopping
              </Link>
            )}
          </motion.div>
        )}

        {/* Orders */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="mt-6 space-y-4">
            {filteredOrders.map((order, index) => {
              const status = statusConfig[order.orderStatus];
              const StatusIcon = status.icon;
              const payment = paymentConfig[order.paymentStatus];

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(index * 0.04, 0.3),
                  }}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  {/* Order header */}
                  <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                        <Package className="h-5 w-5 text-[#f85606]" />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Order ID
                        </p>

                        <p className="mt-0.5 font-mono text-xs font-bold text-gray-800">
                          #{order._id.slice(-10).toUpperCase()}
                        </p>

                        <p className="mt-1 text-[11px] text-gray-400">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold ${status.className}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${payment.className}`}
                      >
                        {payment.label}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-5 sm:px-6">
                    {order.items.slice(0, 3).map((item, itemIndex) => (
                      <div
                        key={`${order._id}-${item.variant}-${itemIndex}`}
                        className="flex items-center gap-3 border-b border-gray-100 py-4 last:border-b-0"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-gray-800">
                            {item.productName}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-400">
                            <span>Qty: {item.quantity}</span>

                            {item.size && <span>Size: {item.size}</span>}

                            {item.color && <span>Color: {item.color}</span>}

                            {item.design && <span>Design: {item.design}</span>}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-extrabold text-gray-900">
                            {formatCurrency(item.subtotal)}
                          </p>

                          <p className="mt-1 text-[10px] text-gray-400">
                            {formatCurrency(item.unitPrice)} each
                          </p>
                        </div>
                      </div>
                    ))}

                    {order.items.length > 3 && (
                      <p className="py-3 text-center text-[10px] font-bold text-gray-400">
                        + {order.items.length - 3} more item
                        {order.items.length - 3 > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex flex-wrap gap-4 text-[11px]">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>
                          {order.paymentMethod === "COD"
                            ? "Cash on Delivery"
                            : "Online Payment"}
                        </span>
                      </div>

                      {order.courierProvider && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Truck className="h-3.5 w-3.5" />
                          <span>{order.courierProvider}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Total
                        </p>

                        <p className="text-lg font-black text-[#f85606]">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 transition hover:border-[#f85606] hover:text-[#f85606]"
                      >
                        Details
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedOrder(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#f85606]">
                    Order Details
                  </p>

                  <h2 className="mt-1 font-mono text-sm font-black text-gray-900">
                    #{selectedOrder._id.toUpperCase()}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6">
                {/* Status */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Order Status
                    </p>

                    <div className="mt-2">
                      {(() => {
                        const config = statusConfig[selectedOrder.orderStatus];

                        const Icon = config.icon;

                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${config.className}`}
                          >
                            <Icon className="h-4 w-4" />
                            {config.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Payment
                    </p>

                    <p className="mt-2 text-sm font-black text-gray-900">
                      {selectedOrder.paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {paymentConfig[selectedOrder.paymentStatus].label}
                    </p>
                  </div>
                </div>

                {/* Customer */}
                <div className="mt-4 rounded-xl border border-gray-200 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Delivery Information
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-2.5">
                      <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                      <div>
                        <p className="text-[10px] text-gray-400">Name</p>
                        <p className="text-xs font-bold text-gray-800">
                          {selectedOrder.customer.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                      <div>
                        <p className="text-[10px] text-gray-400">Phone</p>
                        <p className="text-xs font-bold text-gray-800">
                          {selectedOrder.customer.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 sm:col-span-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                      <div>
                        <p className="text-[10px] text-gray-400">Address</p>
                        <p className="text-xs font-bold leading-5 text-gray-800">
                          {selectedOrder.customer.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mt-4 rounded-xl border border-gray-200 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Order Timeline
                  </p>

                  <div className="mt-5">
                    {(
                      [
                        ["PENDING", "Order placed"],
                        ["PROCESSING", "Order approved"],
                        ["SHIPPED", "Order shipped"],
                        ["DELIVERED", "Order delivered"],
                      ] as [OrderStatus, string][]
                    ).map(([statusKey, label], index) => {
                      const statuses: OrderStatus[] = [
                        "PENDING",
                        "PROCESSING",
                        "SHIPPED",
                        "DELIVERED",
                      ];

                      const currentIndex = statuses.indexOf(
                        selectedOrder.orderStatus,
                      );

                      const itemIndex = statuses.indexOf(statusKey);

                      const completed =
                        selectedOrder.orderStatus !== "CANCELLED" &&
                        currentIndex >= itemIndex;

                      const isCancelled =
                        selectedOrder.orderStatus === "CANCELLED";

                      return (
                        <div key={statusKey} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                                completed
                                  ? "border-[#f85606] bg-[#f85606] text-white"
                                  : "border-gray-200 bg-white text-gray-300"
                              }`}
                            >
                              {completed ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-current" />
                              )}
                            </div>

                            {index < 3 && (
                              <div
                                className={`h-8 w-px ${
                                  completed && currentIndex > itemIndex
                                    ? "bg-[#f85606]"
                                    : "bg-gray-200"
                                }`}
                              />
                            )}
                          </div>

                          <div className="pt-1">
                            <p
                              className={`text-xs font-bold ${
                                completed ? "text-gray-900" : "text-gray-400"
                              }`}
                            >
                              {label}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {selectedOrder.orderStatus === "CANCELLED" && (
                      <div className="mt-3 flex items-center gap-3 rounded-lg bg-red-50 p-3 text-xs font-bold text-red-700">
                        <XCircle className="h-4 w-4" />
                        This order has been cancelled.
                      </div>
                    )}
                  </div>
                </div>

                {/* Courier */}
                {(selectedOrder.consignmentId ||
                  selectedOrder.courierProvider) && (
                  <div className="mt-4 rounded-xl border border-gray-200 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Delivery Tracking
                    </p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-[10px] text-gray-400">Courier</p>
                        <p className="mt-1 text-xs font-bold text-gray-800">
                          {selectedOrder.courierProvider || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-gray-400">
                          Consignment ID
                        </p>
                        <p className="mt-1 break-all font-mono text-xs font-bold text-gray-800">
                          {selectedOrder.consignmentId || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-gray-400">
                          Courier Status
                        </p>
                        <p className="mt-1 text-xs font-bold text-gray-800">
                          {selectedOrder.courierStatus || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="mt-4 rounded-xl border border-gray-200 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Items
                  </p>

                  <div className="mt-3 divide-y divide-gray-100">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={`${item.variant}-${index}`}
                        className="flex items-center justify-between gap-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-gray-800">
                            {item.productName}
                          </p>

                          <p className="mt-1 text-[10px] text-gray-400">
                            Qty {item.quantity} ×{" "}
                            {formatCurrency(item.unitPrice)}
                          </p>
                        </div>

                        <p className="shrink-0 text-xs font-black text-gray-900">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Total Amount</span>
                      <span className="font-bold text-gray-800">
                        {formatCurrency(selectedOrder.totalAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between text-gray-500">
                      <span>Paid</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(selectedOrder.paidAmount)}
                      </span>
                    </div>

                    <div className="h-px bg-gray-200" />

                    <div className="flex justify-between">
                      <span className="font-black text-gray-900">
                        Due Amount
                      </span>

                      <span className="text-lg font-black text-[#f85606]">
                        {formatCurrency(selectedOrder.dueAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-center text-[10px] text-gray-400">
                  Order placed on {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
