"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, FolderPlus } from "lucide-react";
import { api } from "@/lib/axios";

export default function NewCategoryPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("vendorstore_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token")
      : null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanPrefix = prefix.trim();

    if (!cleanName) {
      setError("Category name is required.");
      return;
    }

    if (!cleanPrefix) {
      setError("Category prefix is required.");
      return;
    }

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post(
        "/categories",
        {
          name: cleanName,
          prefix: cleanPrefix,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      router.push("/admin/categories");
      router.refresh();
    } catch (err: any) {
      console.error("Failed to create category:", err);

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
          "Failed to create category. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/categories"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#f85606]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
            <FolderPlus className="h-5 w-5 text-[#f85606]" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Add Category
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create a new product category.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-base font-extrabold text-gray-900">
            Category Information
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Enter the basic information for this category.
          </p>
        </div>

        <div className="space-y-5 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Category Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              placeholder="e.g. T-Shirts"
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#f85606] focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
            />
          </div>

          {/* Prefix */}
          <div>
            <label
              htmlFor="prefix"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Category Prefix
            </label>

            <input
              id="prefix"
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              disabled={loading}
              placeholder="e.g. 12"
              maxLength={10}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#f85606] focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
            />

            <p className="mt-1.5 text-xs text-gray-400">
              Used as the category prefix for product/barcode generation.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4 sm:flex-row sm:justify-end">
          <Link
            href="/admin/categories"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-5 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#f85606] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#df4d03] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Category
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
