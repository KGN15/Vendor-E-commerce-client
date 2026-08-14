// app/admin/categories/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Tag,
  Loader2,
  AlertCircle,
  X,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { api } from "@/lib/axios";

type Category = {
  _id: string;
  name: string;
  slug: string;
  prefix?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CategoryForm = {
  name: string;
  slug: string;
  prefix: string;
};

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  prefix: "",
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getToken = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("vendorstore_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token")
      : null;

  const getErrorMessage = (err: any) =>
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    "Something went wrong. Please try again.";

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();

      const response = await api.get("/categories", {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      const data = response.data?.data ?? response.data;

      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return categories;

    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        category.prefix?.toLowerCase().includes(query),
    );
  }, [categories, search]);

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      prefix: category.prefix || "",
    });
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCategory(null);
    setForm(emptyForm);
  };

  const handleNameChange = (value: string) => {
    setForm((current) => ({
      ...current,
      name: value,
      slug: editingCategory ? current.slug : generateSlug(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (saving) return;

    const name = form.name.trim();
    const slug = form.slug.trim();
    const prefix = form.prefix.trim();

    if (!name || !slug) {
      setError("Category name and slug are required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const token = getToken();

      const config = {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      };

      const payload = {
        name,
        slug,
        ...(prefix ? { prefix } : {}),
      };

      if (editingCategory) {
        const response = await api.put(
          `/categories/${editingCategory._id}`,
          payload,
          config,
        );

        const updated = response.data?.data ?? response.data;

        setCategories((current) =>
          current.map((category) =>
            category._id === editingCategory._id ? updated : category,
          ),
        );
      } else {
        const response = await api.post("/categories", payload, config);

        const created = response.data?.data ?? response.data;

        setCategories((current) => [created, ...current]);
      }

      closeModal();
    } catch (err: any) {
      console.error("Failed to save category:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || deleting) return;

    try {
      setDeleting(true);
      setError(null);

      const token = getToken();

      await api.delete(`/categories/${deleteId}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      setCategories((current) =>
        current.filter((category) => category._id !== deleteId),
      );

      setDeleteId(null);
    } catch (err: any) {
      console.error("Failed to delete category:", err);
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f7f7f7]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                  <Tag className="h-4 w-4 text-[#f85606]" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#f85606]">
                    Catalog
                  </p>

                  <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
                    Categories
                  </h1>
                </div>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Manage your store categories and product organization.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#f85606] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#df4d03] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Error */}
        <AnimatePresence>
          {error && !showModal && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <p className="text-xs font-medium text-red-700">{error}</p>
              </div>

              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#f85606] focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <button
            type="button"
            onClick={fetchCategories}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">
              Total Categories
            </p>
            <p className="mt-1 text-2xl font-black text-gray-900">
              {categories.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Visible Results</p>
            <p className="mt-1 text-2xl font-black text-gray-900">
              {filteredCategories.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Catalog Status</p>
            <p className="mt-1 text-sm font-extrabold text-green-600">Active</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Category
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Slug
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Prefix
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Created
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex min-h-64 items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-6 w-6 animate-spin text-[#f85606]" />
                          <p className="text-xs text-gray-500">
                            Loading categories...
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                          <FolderOpen className="h-6 w-6 text-[#f85606]" />
                        </div>

                        <h3 className="mt-4 text-sm font-extrabold text-gray-900">
                          {search ? "No categories found" : "No categories yet"}
                        </h3>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                          {search
                            ? "Try another search term."
                            : "Create your first category to start organizing products."}
                        </p>

                        {!search && (
                          <button
                            type="button"
                            onClick={openCreateModal}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#f85606] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#df4d03]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Create Category
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category, index) => (
                    <motion.tr
                      key={category._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.025 }}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                            <Tag className="h-4 w-4 text-[#f85606]" />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {category.name}
                            </p>

                            <p className="mt-0.5 text-[10px] text-gray-400">
                              ID: {category._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <code className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          {category.slug}
                        </code>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">
                          {category.prefix || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-gray-500">
                        {category.createdAt
                          ? new Date(category.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(category)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-orange-200 hover:bg-orange-50 hover:text-[#f85606]"
                            aria-label={`Edit ${category.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteId(category._id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                            aria-label={`Delete ${category.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#f85606]">
                    Catalog
                  </p>

                  <h2 className="mt-0.5 text-lg font-extrabold text-gray-900">
                    {editingCategory ? "Edit Category" : "Create Category"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5">
                {error && (
                  <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <p className="text-xs leading-5 text-red-600">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="category-name"
                      className="mb-1.5 block text-xs font-bold text-gray-700"
                    >
                      Category Name
                    </label>

                    <input
                      id="category-name"
                      type="text"
                      required
                      disabled={saving}
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. T-Shirts"
                      className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-[#f85606] focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="category-slug"
                      className="mb-1.5 block text-xs font-bold text-gray-700"
                    >
                      Slug
                    </label>

                    <input
                      id="category-slug"
                      type="text"
                      required
                      disabled={saving}
                      value={form.slug}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          slug: generateSlug(e.target.value),
                        }))
                      }
                      placeholder="t-shirts"
                      className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-[#f85606] focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="category-prefix"
                      className="mb-1.5 block text-xs font-bold text-gray-700"
                    >
                      Prefix
                      <span className="ml-1 font-normal text-gray-400">
                        (optional)
                      </span>
                    </label>

                    <input
                      id="category-prefix"
                      type="text"
                      disabled={saving}
                      value={form.prefix}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          prefix: e.target.value,
                        }))
                      }
                      placeholder="12"
                      className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-[#f85606] focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="h-10 flex-1 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#f85606] text-xs font-bold text-white hover:bg-[#df4d03] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : editingCategory ? (
                      "Save Changes"
                    ) : (
                      "Create Category"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.97 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>

              <h3 className="mt-4 text-center text-lg font-extrabold text-gray-900">
                Delete Category?
              </h3>

              <p className="mt-2 text-center text-xs leading-5 text-gray-500">
                This action cannot be undone. Make sure no products depend on
                this category before deleting it.
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteId(null)}
                  className="h-10 flex-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-60"
                >
                  {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
