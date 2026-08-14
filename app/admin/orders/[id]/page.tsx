"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock3,
  XCircle,
  MapPin,
  User,
  Mail,
  Phone,
  CreditCard,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/axios";

type OrderItem = {
  quantity: number;
  unitPrice?: number;
  price?: number;

  product?: {
    _id?: string;
    name?: string;
    thumbnail?: string;
  };

  variant?: {
    _id?: string;
    size?: string;
    color?: string;
    design?: string;
  };
};

type Order = {
  _id: string;
  orderNumber?: string;

  // Frontend normalized status
  status?: string;

  // Backend actual field
  orderStatus?: string;

  paymentMethod?: string;
  paymentStatus?: string;

  subtotal?: number;
  shippingFee?: number;
  totalAmount?: number;
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
    phone?: string;
    address?: string;
  };

  shippingAddress?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };

  items?: OrderItem[];

  createdAt?: string;
  updatedAt?: string;

  courierProvider?: string;
  consignmentId?: string;
  courierStatus?: string;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80";

/**
 * IMPORTANT:
 * These must exactly match backend ORDER_STATUSES.
 */
const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

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
};

function getToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("vendorstore_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
}

function money(value = 0) {
  return `$${Number(value).toFixed(2)}`;
}

function formatDate(value?: string) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Normalize backend order.
 *
 * Backend:
 *   orderStatus: "PROCESSING"
 *
 * Frontend:
 *   status: "PROCESSING"
 *
 * This is the important fix for refresh.
 */
function normalizeOrder(rawOrder: any): Order {
  if (!rawOrder) {
    return rawOrder;
  }

  const normalizedStatus = String(
    rawOrder.orderStatus ?? rawOrder.status ?? "PENDING",
  ).toUpperCase();

  return {
    ...rawOrder,

    // Always expose backend orderStatus as frontend status
    status: normalizedStatus,

    // Keep original backend field too
    orderStatus: normalizedStatus,

    items: Array.isArray(rawOrder.items)
      ? rawOrder.items.map((item: any) => ({
          ...item,

          // Backend uses unitPrice.
          // Keep price too so existing UI works.
          price: Number(item.price ?? item.unitPrice ?? 0),

          unitPrice: Number(item.unitPrice ?? item.price ?? 0),
        }))
      : [],
  };
}

function normalizeStatus(status?: string) {
  return String(status || "PENDING").toUpperCase();
}

function getStatus(status?: string) {
  const normalized = normalizeStatus(status);

  return (
    statusConfig[normalized] || {
      label: normalized.replace(/_/g, " "),
      className: "bg-gray-50 text-gray-600 border-gray-200",
      icon: Clock3,
    }
  );
}

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState("");
  const [error, setError] = useState("");

  /**
   * Fetch single order
   */
  const fetchOrder = async () => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = response?.data?.data;

      const fetchedOrder =
        responseData?.order ||
        responseData?.data?.order ||
        responseData?.data ||
        responseData;

      if (!fetchedOrder) {
        setOrder(null);
        return;
      }

      /**
       * IMPORTANT FIX
       *
       * Backend returns:
       * {
       *   orderStatus: "PROCESSING"
       * }
       *
       * Frontend normalizes it to:
       * {
       *   status: "PROCESSING"
       * }
       */
      const normalizedOrder = normalizeOrder(fetchedOrder);

      console.log("Fetched order:", fetchedOrder);

      console.log("Backend orderStatus:", fetchedOrder.orderStatus);

      console.log("Normalized frontend status:", normalizedOrder.status);

      setOrder(normalizedOrder);
    } catch (err: any) {
      console.error("Failed to fetch order:", err);

      if (err?.response?.status === 401) {
        localStorage.removeItem("vendorstore_token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");

        router.push("/login");
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load order.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  /**
   * Update order status
   */
  const updateStatus = async (newStatus: string) => {
    if (!order || updating) return;

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    const previousStatus = normalizeStatus(order.orderStatus || order.status);

    try {
      setUpdating(true);
      setUpdatingStatus(newStatus);
      setError("");

      /**
       * Optimistic update
       */
      setOrder((currentOrder) => {
        if (!currentOrder) {
          return currentOrder;
        }

        return {
          ...currentOrder,

          status: newStatus,
          orderStatus: newStatus,

          updatedAt: new Date().toISOString(),
        };
      });

      /**
       * Backend expects:
       *
       * {
       *   orderStatus: "PROCESSING"
       * }
       */
      const response = await api.patch(
        `/orders/${order._id}/status`,
        {
          orderStatus: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("STATUS UPDATE RESPONSE:", response?.data);

      const responseData = response?.data?.data;

      const serverOrder =
        responseData?.order ||
        responseData?.data?.order ||
        responseData?.data ||
        responseData;

      /**
       * Backend returns the complete order.
       *
       * Normalize it again so:
       * orderStatus -> status
       */
      if (serverOrder && typeof serverOrder === "object") {
        const normalizedServerOrder = normalizeOrder(serverOrder);

        setOrder(normalizedServerOrder);
      } else {
        /**
         * Keep optimistic state if
         * backend didn't return an order.
         */
        setOrder((currentOrder) => {
          if (!currentOrder) {
            return currentOrder;
          }

          return {
            ...currentOrder,
            status: newStatus,
            orderStatus: newStatus,
          };
        });
      }
    } catch (err: any) {
      console.error("Failed to update order:", err);

      /**
       * Restore previous status
       */
      setOrder((currentOrder) => {
        if (!currentOrder) {
          return currentOrder;
        }

        return {
          ...currentOrder,
          status: previousStatus,
          orderStatus: previousStatus,
        };
      });

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to update order status.",
      );
    } finally {
      setUpdating(false);
      setUpdatingStatus("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-[#f85606]" />

          <p className="text-xs font-medium text-gray-500">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>

          <h2 className="mt-4 text-lg font-extrabold text-gray-900">
            Order not found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {error || "This order could not be found."}
          </p>

          <Link
            href="/admin/orders"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#f85606] px-4 text-sm font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = normalizeStatus(order.orderStatus || order.status);

  const status = getStatus(currentStatus);

  const StatusIcon = status.icon;

  const customerName =
    order.customer?.user?.name ||
    order.customer?.name ||
    order.shippingAddress?.fullName ||
    "Customer";

  const customerEmail =
    order.customer?.user?.email ||
    order.customer?.email ||
    order.shippingAddress?.email ||
    "—";

  const itemCount =
    order.items?.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0,
    ) || 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-[#f85606]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              #{order.orderNumber || order._id.slice(-8).toUpperCase()}
            </h1>

            {/* Current Status */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />

              {status.label}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrder}
          disabled={loading || updating}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Status Control */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900">
              Order Status
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Update the order progress from here.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {statuses.map((item) => {
              const active = currentStatus === item;

              const isUpdatingThis = updating && updatingStatus === item;

              return (
                <button
                  key={item}
                  type="button"
                  disabled={updating || active}
                  onClick={() => updateStatus(item)}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                    active
                      ? "border-[#f85606] bg-[#f85606] text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#f85606] hover:text-[#f85606]"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  {isUpdatingThis ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    item.replace(/_/g, " ")
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main */}

        <div className="space-y-6 lg:col-span-2">
          {/* Products */}

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-extrabold text-gray-900">
                  Order Items
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              </div>

              <Package className="h-5 w-5 text-[#f85606]" />
            </div>

            <div className="divide-y divide-gray-100">
              {order.items?.map((item, index) => {
                const price = Number(item.unitPrice ?? item.price ?? 0);

                const image = item.product?.thumbnail || fallbackImage;

                return (
                  <div
                    key={`${
                      item.product?._id || item.variant?._id || "item"
                    }-${index}`}
                    className="flex gap-4 p-5"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      <img
                        src={image}
                        alt={item.product?.name || "Product"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = fallbackImage;
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-gray-900">
                        {item.product?.name || "Product"}
                      </h3>

                      {(item.variant?.size ||
                        item.variant?.color ||
                        item.variant?.design) && (
                        <p className="mt-1 text-xs text-gray-500">
                          {[
                            item.variant?.size,
                            item.variant?.color,
                            item.variant?.design,
                          ]
                            .filter(Boolean)
                            .join(" / ")}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-gray-400">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-extrabold text-gray-900">
                        {money(price * Number(item.quantity || 0))}
                      </p>

                      <p className="mt-1 text-[11px] text-gray-400">
                        {money(price)} each
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Shipping */}

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                <MapPin className="h-4 w-4 text-[#f85606]" />
              </div>

              <div>
                <h2 className="text-sm font-extrabold text-gray-900">
                  Shipping Address
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Delivery information
                </p>
              </div>
            </div>

            <div className="pt-5 text-sm text-gray-700">
              <p className="font-bold">
                {order.shippingAddress?.fullName || customerName}
              </p>

              <p className="mt-2 text-gray-600">
                {order.shippingAddress?.address ||
                  order.customer?.address ||
                  "—"}
              </p>

              <p className="mt-1 text-gray-600">
                {order.shippingAddress?.city || "—"}

                {order.shippingAddress?.postalCode
                  ? ` - ${order.shippingAddress.postalCode}`
                  : ""}
              </p>

              {order.shippingAddress?.email && (
                <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <Mail className="h-3.5 w-3.5" />
                  {order.shippingAddress.email}
                </p>
              )}

              {(order.shippingAddress?.phone || order.customer?.phone) && (
                <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <Phone className="h-3.5 w-3.5" />

                  {order.shippingAddress?.phone || order.customer?.phone}
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}

        <div className="space-y-6">
          {/* Customer */}

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                <User className="h-4 w-4 text-[#f85606]" />
              </div>

              <h2 className="text-sm font-extrabold text-gray-900">Customer</h2>
            </div>

            <div className="pt-4">
              <p className="text-sm font-bold text-gray-900">{customerName}</p>

              <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <Mail className="h-3.5 w-3.5" />

                {customerEmail}
              </p>

              {(order.customer?.phone || order.shippingAddress?.phone) && (
                <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <Phone className="h-3.5 w-3.5" />

                  {order.customer?.phone || order.shippingAddress?.phone}
                </p>
              )}
            </div>
          </section>

          {/* Payment */}

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                <CreditCard className="h-4 w-4 text-[#f85606]" />
              </div>

              <h2 className="text-sm font-extrabold text-gray-900">Payment</h2>
            </div>

            <div className="space-y-3 pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>

                <span className="font-bold text-gray-800">
                  {order.paymentMethod || "Cash on Delivery"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status</span>

                <span className="font-bold text-gray-800">
                  {order.paymentStatus || "Pending"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Paid</span>

                <span className="font-bold text-green-600">
                  {money(order.paidAmount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Due</span>

                <span className="font-bold text-red-500">
                  {money(order.dueAmount)}
                </span>
              </div>
            </div>
          </section>

          {/* Summary */}

          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-extrabold text-gray-900">
                Order Summary
              </h2>
            </div>

            <div className="space-y-3 px-5 py-5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>

                <span className="font-semibold text-gray-800">
                  {money(order.subtotal ?? order.totalAmount ?? 0)}
                </span>
              </div>

              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>

                <span className="font-semibold text-gray-800">
                  {money(order.shippingFee)}
                </span>
              </div>

              <div className="h-px bg-gray-200" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-gray-900">
                  Total
                </span>

                <span className="text-xl font-black text-[#f85606]">
                  {money(order.totalAmount)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
