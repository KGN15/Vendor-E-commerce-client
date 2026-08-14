"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  Plus,
  Package,
  ImagePlus,
  Power,
} from "lucide-react";
import { api } from "@/lib/axios";

type Category = {
  _id: string;
  name: string;
};

type Variant = {
  _id?: string;
  size?: string;
  color?: string;
  design?: string;
  sizeCode: string;
  price: string;
  stock: string;
  isActive?: boolean;
};

type ProductVariantFromApi = {
  _id: string;
  size?: string;
  color?: string;
  design?: string;
  sizeCode?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
};

type Product = {
  _id: string;
  name: string;
  description?: string;
  fullDescription?: string;
  category?: Category | string;
  images?: string[];
  thumbnail?: string;
  highlights?: string[];
  isActive?: boolean;
};

type ProductResponseData = {
  product?: Product;
  variants?: ProductVariantFromApi[];
  reviews?: unknown[];
  ratings?: unknown;
  relatedProducts?: unknown[];
};

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();

  const productId = String(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    fullDescription: "",
    category: "",
    images: [""],
    highlights: [""],
    isActive: true,
  });

  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    if (!productId) return;

    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productResponse, categoryResponse] = await Promise.all([
          api.get(`/products/${productId}`),
          api.get("/categories"),
        ]);

        if (!mounted) return;

        /**
         * Backend response:
         *
         * {
         *   success: true,
         *   data: {
         *     product: {...},
         *     variants: [...]
         *   }
         * }
         */
        const responseData: ProductResponseData =
          productResponse.data?.data || {};

        const loadedProduct = responseData.product;

        const loadedVariants = Array.isArray(responseData.variants)
          ? responseData.variants
          : [];

        const categoryData = categoryResponse.data?.data;

        const loadedCategories: Category[] = Array.isArray(categoryData)
          ? categoryData
          : Array.isArray(categoryData?.categories)
            ? categoryData.categories
            : [];

        if (!loadedProduct?._id) {
          throw new Error("Product not found.");
        }

        setProduct(loadedProduct);
        setCategories(loadedCategories);

        const categoryId =
          typeof loadedProduct.category === "object"
            ? loadedProduct.category?._id || ""
            : loadedProduct.category || "";

        setForm({
          name: loadedProduct.name || "",
          description: loadedProduct.description || "",
          fullDescription: loadedProduct.fullDescription || "",
          category: categoryId,
          images: loadedProduct.images?.length
            ? loadedProduct.images
            : loadedProduct.thumbnail
              ? [loadedProduct.thumbnail]
              : [""],
          highlights: loadedProduct.highlights?.length
            ? loadedProduct.highlights
            : [""],
          isActive: loadedProduct.isActive !== false,
        });

        /**
         * IMPORTANT:
         * variants comes from responseData.variants
         * NOT loadedProduct.variants
         */
        if (loadedVariants.length > 0) {
          setVariants(
            loadedVariants.map((variant) => ({
              _id: variant._id,
              size: variant.size || "",
              color: variant.color || "",
              design: variant.design || "",
              sizeCode: String(variant.sizeCode || ""),
              price: String(variant.price ?? ""),
              stock: String(variant.stock ?? ""),
              isActive: variant.isActive !== false,
            })),
          );
        } else {
          setVariants([
            {
              size: "",
              color: "",
              design: "",
              sizeCode: "",
              price: "",
              stock: "",
              isActive: true,
            },
          ]);
        }
      } catch (err: any) {
        console.error("Failed to load product:", err);

        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load product.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [productId]);

  const updateForm = (
    field: keyof typeof form,
    value: string | boolean | string[],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateImage = (index: number, value: string) => {
    setForm((current) => {
      const images = [...current.images];
      images[index] = value;

      return {
        ...current,
        images,
      };
    });
  };

  const addImage = () => {
    setForm((current) => ({
      ...current,
      images: [...current.images, ""],
    }));
  };

  const removeImage = (index: number) => {
    setForm((current) => ({
      ...current,
      images:
        current.images.length <= 1
          ? [""]
          : current.images.filter((_, i) => i !== index),
    }));
  };

  const updateHighlight = (index: number, value: string) => {
    setForm((current) => {
      const highlights = [...current.highlights];
      highlights[index] = value;

      return {
        ...current,
        highlights,
      };
    });
  };

  const addHighlight = () => {
    setForm((current) => ({
      ...current,
      highlights: [...current.highlights, ""],
    }));
  };

  const removeHighlight = (index: number) => {
    setForm((current) => ({
      ...current,
      highlights:
        current.highlights.length <= 1
          ? [""]
          : current.highlights.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (
    index: number,
    field: keyof Variant,
    value: string | boolean,
  ) => {
    setVariants((current) =>
      current.map((variant, i) =>
        i === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant,
      ),
    );
  };

  const addVariant = () => {
    setVariants((current) => [
      ...current,
      {
        size: "",
        color: "",
        design: "",
        sizeCode: "",
        price: "",
        stock: "",
        isActive: true,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((current) =>
      current.length <= 1 ? current : current.filter((_, i) => i !== index),
    );
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (saving) return;

    setError("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    if (!variants.length) {
      setError("At least one product variant is required.");
      return;
    }

    for (let index = 0; index < variants.length; index++) {
      const variant = variants[index];

      const sizeCode = variant.sizeCode.trim();

      if (!/^\d{4}$/.test(sizeCode)) {
        setError(`Variant #${index + 1}: Size Code must be exactly 4 digits.`);
        return;
      }

      const price = Number(variant.price);
      const stock = Number(variant.stock);

      if (!variant.price || !Number.isFinite(price) || price < 0) {
        setError(`Variant #${index + 1}: Please enter a valid price.`);
        return;
      }

      if (!variant.stock || !Number.isFinite(stock) || stock < 0) {
        setError(`Variant #${index + 1}: Please enter a valid stock quantity.`);
        return;
      }
    }

    const images = form.images.map((image) => image.trim()).filter(Boolean);

    const highlights = form.highlights
      .map((highlight) => highlight.trim())
      .filter(Boolean);

    /**
     * Backend expects:
     *
     * variants: [
     *   {
     *     sizeCode: "0038",
     *     price: 1200,
     *     stock: 10
     *   }
     * ]
     */
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      fullDescription: form.fullDescription.trim(),
      category: form.category,
      images,
      thumbnail: images[0] || "",
      highlights,
      isActive: form.isActive,

      variants: variants.map((variant) => ({
        ...(variant._id ? { _id: variant._id } : {}),
        sizeCode: variant.sizeCode.trim(),
        price: Number(variant.price),
        stock: Number(variant.stock),

        ...(variant.size?.trim() ? { size: variant.size.trim() } : {}),

        ...(variant.color?.trim() ? { color: variant.color.trim() } : {}),

        ...(variant.design?.trim() ? { design: variant.design.trim() } : {}),

        isActive: variant.isActive !== false,
      })),
    };

    console.log("UPDATE PRODUCT PAYLOAD:", payload);

    try {
      setSaving(true);

      await api.put(`/products/${productId}`, payload);

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("Failed to update product:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to update product.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await api.delete(`/products/${productId}`);

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("Failed to delete product:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to delete product.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!product || saving) return;

    try {
      setSaving(true);
      setError("");

      const nextStatus = !form.isActive;

      await api.put(`/products/${productId}`, {
        isActive: nextStatus,
      });

      setForm((current) => ({
        ...current,
        isActive: nextStatus,
      }));

      setProduct((current) =>
        current
          ? {
              ...current,
              isActive: nextStatus,
            }
          : current,
      );
    } catch (err: any) {
      console.error("Failed to change product status:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to change product status.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f7]">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-[#f85606]" />
            <p className="text-xs font-medium text-gray-500">
              Loading product...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#f7f7f7]">
        <div className="mx-auto max-w-xl px-4 py-16">
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <Package className="mx-auto h-10 w-10 text-red-400" />

            <h1 className="mt-4 text-xl font-black text-gray-900">
              Product Not Found
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {error || "The requested product could not be found."}
            </p>

            <Link
              href="/admin/products"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#f85606] px-4 text-sm font-bold text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/admin/products"
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition hover:text-[#f85606]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>

            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              Edit Product
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Update product information, pricing and inventory.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={saving}
              className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-xs font-bold transition ${
                form.isActive
                  ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <Power className="h-4 w-4" />
              {form.isActive ? "Active" : "Inactive"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </button>

            <button
              form="edit-product-form"
              type="submit"
              disabled={saving || deleting}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#f85606] px-5 text-xs font-bold text-white shadow-sm transition hover:bg-[#df4d03] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        <div
          className={`mb-6 flex items-center justify-between rounded-xl border px-4 py-3 ${
            form.isActive
              ? "border-green-200 bg-green-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <div>
            <p
              className={`text-xs font-extrabold ${
                form.isActive ? "text-green-700" : "text-gray-700"
              }`}
            >
              Product is {form.isActive ? "Active" : "Inactive"}
            </p>

            <p className="mt-0.5 text-[11px] text-gray-500">
              {form.isActive
                ? "Customers can currently see and purchase this product."
                : "This product is currently hidden from customers."}
            </p>
          </div>

          <span
            className={`h-2.5 w-2.5 rounded-full ${
              form.isActive ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form id="edit-product-form" onSubmit={handleSave}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                    <Package className="h-5 w-5 text-[#f85606]" />
                  </div>

                  <div>
                    <h2 className="text-base font-extrabold text-gray-900">
                      Basic Information
                    </h2>

                    <p className="text-xs text-gray-500">
                      Product details and description
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-700">
                      Product Name *
                    </label>

                    <input
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-[#f85606] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-700">
                      Short Description
                    </label>

                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        updateForm("description", e.target.value)
                      }
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none transition focus:border-[#f85606] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-700">
                      Full Description
                    </label>

                    <textarea
                      value={form.fullDescription}
                      onChange={(e) =>
                        updateForm("fullDescription", e.target.value)
                      }
                      rows={8}
                      className="w-full resize-y rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none transition focus:border-[#f85606] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                      <ImagePlus className="h-5 w-5 text-[#f85606]" />
                    </div>

                    <div>
                      <h2 className="text-base font-extrabold text-gray-900">
                        Product Images
                      </h2>

                      <p className="text-xs text-gray-500">
                        Manage product image URLs
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addImage}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-[#f85606] hover:text-[#f85606]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Image
                  </button>
                </div>

                <div className="space-y-3">
                  {form.images.map((image, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => updateImage(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#f85606] focus:ring-2 focus:ring-orange-100"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-gray-900">
                      Highlights
                    </h2>

                    <p className="text-xs text-gray-500">
                      Important product features
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addHighlight}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-[#f85606] hover:text-[#f85606]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>

                <div className="space-y-3">
                  {form.highlights.map((highlight, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={highlight}
                        onChange={(e) => updateHighlight(index, e.target.value)}
                        placeholder="100% Organic Cotton"
                        className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#f85606] focus:ring-2 focus:ring-orange-100"
                      />

                      <button
                        type="button"
                        onClick={() => removeHighlight(index)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-gray-900">
                      Product Variants
                    </h2>

                    <p className="text-xs text-gray-500">
                      Manage size code, color, design, price and inventory
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#f85606] px-3 py-2 text-xs font-bold text-white hover:bg-[#df4d03]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Variant
                  </button>
                </div>

                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div
                      key={variant._id || `new-${index}`}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-extrabold text-gray-700">
                          Variant #{index + 1}
                        </p>

                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                        <div>
                          <label className="mb-1 block text-[10px] font-bold text-gray-500">
                            Size
                          </label>

                          <input
                            value={variant.size || ""}
                            onChange={(e) =>
                              updateVariant(index, "size", e.target.value)
                            }
                            placeholder="M"
                            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#f85606]"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[10px] font-bold text-gray-500">
                            Size Code *
                          </label>

                          <input
                            value={variant.sizeCode}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 4);

                              updateVariant(index, "sizeCode", value);
                            }}
                            placeholder="0038"
                            inputMode="numeric"
                            maxLength={4}
                            className={`h-10 w-full rounded-lg border bg-white px-3 text-xs font-medium outline-none focus:border-[#f85606] ${
                              variant.sizeCode.length > 0 &&
                              variant.sizeCode.length !== 4
                                ? "border-red-300"
                                : "border-gray-200"
                            }`}
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[10px] font-bold text-gray-500">
                            Color
                          </label>

                          <input
                            value={variant.color || ""}
                            onChange={(e) =>
                              updateVariant(index, "color", e.target.value)
                            }
                            placeholder="Red"
                            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#f85606]"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[10px] font-bold text-gray-500">
                            Design
                          </label>

                          <input
                            value={variant.design || ""}
                            onChange={(e) =>
                              updateVariant(index, "design", e.target.value)
                            }
                            placeholder="Solid"
                            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#f85606]"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[10px] font-bold text-gray-500">
                            Price *
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.price}
                            onChange={(e) =>
                              updateVariant(index, "price", e.target.value)
                            }
                            placeholder="1200"
                            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#f85606]"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[10px] font-bold text-gray-500">
                            Stock *
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={variant.stock}
                            onChange={(e) =>
                              updateVariant(index, "stock", e.target.value)
                            }
                            placeholder="10"
                            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#f85606]"
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-gray-400">
                            {variant._id ? "Existing variant" : "New variant"}
                          </span>

                          {variant.sizeCode && (
                            <span
                              className={`ml-3 text-[11px] font-semibold ${
                                variant.sizeCode.length === 4
                                  ? "text-green-600"
                                  : "text-red-500"
                              }`}
                            >
                              {variant.sizeCode.length === 4
                                ? "✓ Valid Size Code"
                                : "Size Code must be 4 digits"}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            updateVariant(
                              index,
                              "isActive",
                              variant.isActive === false,
                            )
                          }
                          className={`text-[11px] font-bold ${
                            variant.isActive === false
                              ? "text-gray-400"
                              : "text-green-600"
                          }`}
                        >
                          {variant.isActive === false ? "Inactive" : "Active"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-base font-extrabold text-gray-900">
                  Category
                </h2>

                <select
                  value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#f85606] focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </section>

              <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h2 className="text-base font-extrabold text-gray-900">
                    Preview
                  </h2>
                </div>

                <div className="p-5">
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    {form.images[0] ? (
                      <img
                        src={form.images[0]}
                        alt={form.name || "Product"}
                        className="aspect-square w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center text-gray-300">
                        <ImagePlus className="h-10 w-10" />
                      </div>
                    )}

                    <div className="bg-white p-4">
                      <h3 className="line-clamp-2 text-sm font-extrabold text-gray-900">
                        {form.name || "Product Name"}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                        {form.description || "Product description"}
                      </p>

                      {variants[0]?.price && (
                        <p className="mt-3 text-lg font-black text-[#f85606]">
                          ${Number(variants[0].price).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Product ID
                </p>

                <p className="mt-1 break-all font-mono text-xs text-gray-600">
                  {product._id}
                </p>
              </section>

              <button
                type="submit"
                disabled={saving || deleting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f85606] text-sm font-extrabold text-white shadow-sm transition hover:bg-[#df4d03] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
