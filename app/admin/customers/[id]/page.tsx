"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  CalendarDays,
  ShieldCheck,
  ShoppingBag,
  DollarSign,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/axios";

type Customer = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  authProvider?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CustomerStats = {
  orderCount: number;
  totalSpent: number;
};

type CustomerOrder = {
  _id: string;
  totalAmount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CustomerResponse = {
  success: boolean;
  data: {
    customer: Customer;
    stats: CustomerStats;
    orders: CustomerOrder[];
  };
};

export default function AdminCustomerDetailsPage() {
  const params = useParams<{ id: string }>();
  const customerId = params?.id;

  const [customer, setCustomer] = useState<Customer | null>(null);

  const [stats, setStats] = useState<CustomerStats>({
    orderCount: 0,
    totalSpent: 0,
  });

  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchCustomer = async (refresh = false) => {
    if (!customerId) return;

    try {
      setError("");

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get<CustomerResponse>(
        `/admin/customers/${customerId}`,
      );

      console.log("CUSTOMER API RESPONSE:", response.data);

      const data = response.data?.data;

      if (!data?.customer) {
        throw new Error("Customer data not found.");
      }

      setCustomer(data.customer);

      setStats(
        data.stats || {
          orderCount: 0,
          totalSpent: 0,
        },
      );

      setOrders(data.orders || []);
    } catch (err: any) {
      console.error("Failed to fetch customer:", err);

      setCustomer(null);

      setStats({
        orderCount: 0,
        totalSpent: 0,
      });

      setOrders([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load customer details.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-[#f85606]" />

          <p className="text-xs font-medium text-gray-500">
            Loading customer...
          </p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>

          <h2 className="mt-4 text-sm font-extrabold text-red-800">
            Customer Not Found
          </h2>

          <p className="mt-1 text-xs text-red-600">
            {error || "This customer could not be loaded."}
          </p>

          <div className="mt-5 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => fetchCustomer(true)}
              disabled={refreshing}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#f85606] px-4 text-xs font-bold text-white transition hover:bg-[#df4d03] disabled:opacity-60"
            >
              {refreshing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Try Again
            </button>

            <Link
              href="/admin/customers"
              className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700"
            >
              Customers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition hover:text-[#f85606]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Customers
          </Link>

          <div className="mt-5 flex items-center gap-3">
            <Avatar name={customer.name} />

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#f85606]">
                Customer Profile
              </p>

              <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-gray-900">
                {customer.name || "Unnamed Customer"}
              </h1>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchCustomer(true)}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-[#f85606] hover:text-[#f85606] disabled:opacity-60"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </button>
      </div>

      {/* Profile */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-extrabold text-gray-900">
                Customer Information
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                Account details and authentication information.
              </p>
            </div>

            <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-y-0">
              <InfoItem
                icon={<User className="h-4 w-4" />}
                label="Full Name"
                value={customer.name || "—"}
              />

              <InfoItem
                icon={<Mail className="h-4 w-4" />}
                label="Email Address"
                value={customer.email || "—"}
              />

              <InfoItem
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Account Role"
                value={customer.role || "CUSTOMER"}
              />

              <InfoItem
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Authentication"
                value={
                  customer.authProvider === "GOOGLE"
                    ? "Google"
                    : "Email & Password"
                }
              />

              <InfoItem
                icon={<CalendarDays className="h-4 w-4" />}
                label="Joined"
                value={formatDate(customer.createdAt)}
              />

              <InfoItem
                icon={<CalendarDays className="h-4 w-4" />}
                label="Last Updated"
                value={formatDate(customer.updatedAt)}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <QuickCard
            icon={<ShoppingBag className="h-5 w-5" />}
            label="Total Orders"
            value={String(stats.orderCount)}
          />

          <QuickCard
            icon={<DollarSign className="h-5 w-5" />}
            label="Total Spent"
            value={`$${Number(stats.totalSpent || 0).toFixed(2)}`}
          />
        </div>
      </div>

      {/* Customer Orders */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-extrabold text-gray-900">
            Customer Orders
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Orders placed by this customer.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
              <ShoppingBag className="h-5 w-5 text-[#f85606]" />
            </div>

            <p className="mt-3 text-sm font-bold text-gray-800">
              No orders yet
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
              This customer has not placed any orders yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <div
                key={order._id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                    <ShoppingBag className="h-4 w-4 text-[#f85606]" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 sm:justify-end">
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-gray-900">
                      ${Number(order.totalAmount || 0).toFixed(2)}
                    </p>

                    {order.status && (
                      <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                        {order.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ name }: { name?: string }) {
  const letter = name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-extrabold text-[#f85606]">
      {letter}
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-gray-100 p-5 last:border-b-0 sm:border-b-0">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}

        <span className="text-[11px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function QuickCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-[#f85606]">
          {icon}
        </div>

        <span className="text-xl font-black text-gray-900">{value}</span>
      </div>

      <p className="mt-4 text-xs font-semibold text-gray-500">{label}</p>
    </div>
  );
}

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
