"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  UserCheck,
  ShoppingBag,
  DollarSign,
  Eye,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/axios";

type Customer = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  authProvider?: string;
  createdAt?: string;
};

type CustomerResponse = {
  success: boolean;
  data: Customer[];
  count?: number;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchCustomers = async (refresh = false) => {
    try {
      setError("");

      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await api.get<CustomerResponse>("/admin/customers");

      setCustomers(response.data?.data || []);
    } catch (err: any) {
      console.error("Failed to fetch customers:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load customers.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query),
    );
  }, [customers, search]);

  const totalCustomers = customers.length;

  const googleCustomers = customers.filter(
    (customer) => customer.authProvider === "GOOGLE",
  ).length;

  const localCustomers = customers.filter(
    (customer) => customer.authProvider !== "GOOGLE",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#f85606]">
            Customer Management
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
            Customers
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and inspect your store customers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchCustomers(true)}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-[#f85606] hover:text-[#f85606] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Customers"
          value={totalCustomers}
        />

        <StatCard
          icon={<UserCheck className="h-5 w-5" />}
          label="Local Accounts"
          value={localCustomers}
        />

        <StatCard
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Google Accounts"
          value={googleCustomers}
        />
      </div>

      {/* Main */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900">
              Customer List
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              {filteredCustomers.length} customer
              {filteredCustomers.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="m-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

            <div>
              <p className="text-xs font-bold text-red-700">
                Unable to load customers
              </p>

              <p className="mt-0.5 text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-[#f85606]" />

              <p className="text-xs font-medium text-gray-500">
                Loading customers...
              </p>
            </div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
              <Users className="h-6 w-6 text-[#f85606]" />
            </div>

            <h3 className="mt-4 text-sm font-extrabold text-gray-900">
              No customers found
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
              {search
                ? "Try changing your search query."
                : "There are no customers in your store yet."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Customer
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Email
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Login
                    </th>

                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Joined
                    </th>

                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.map((customer) => (
                    <CustomerRow key={customer._id} customer={customer} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-gray-100 md:hidden">
              {filteredCustomers.map((customer) => (
                <div key={customer._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={customer.name} />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {customer.name || "Unnamed Customer"}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          {customer.email}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/admin/customers/${customer._id}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-[#f85606] hover:text-[#f85606]"
                      aria-label="View customer"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-600">
                      {customer.authProvider === "GOOGLE" ? "Google" : "Email"}
                    </span>

                    <span className="text-gray-400">
                      {formatDate(customer.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CustomerRow({ customer }: { customer: Customer }) {
  return (
    <tr className="transition hover:bg-gray-50/70">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={customer.name} />

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">
              {customer.name || "Unnamed Customer"}
            </p>

            <p className="text-[11px] text-gray-400">
              ID: {customer._id.slice(-8)}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-gray-600">{customer.email}</p>
      </td>

      <td className="px-5 py-4">
        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">
          {customer.authProvider === "GOOGLE" ? "Google" : "Email"}
        </span>
      </td>

      <td className="px-5 py-4 text-sm text-gray-500">
        {formatDate(customer.createdAt)}
      </td>

      <td className="px-5 py-4 text-right">
        <Link
          href={`/admin/customers/${customer._id}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-bold text-gray-600 transition hover:border-[#f85606] hover:text-[#f85606]"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Link>
      </td>
    </tr>
  );
}

function Avatar({ name }: { name?: string }) {
  const letter = name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-extrabold text-[#f85606]">
      {letter}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-[#f85606]">
          {icon}
        </div>

        <span className="text-2xl font-black text-gray-900">{value}</span>
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
