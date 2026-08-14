"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  Plus,
  Trash2,
  Package,
  ImagePlus,
  Upload,
  X,
} from "lucide-react";
import { api } from "@/lib/axios";

type Category = {
  _id: string;
  name: string;
  prefix?: string;
  slug?: string;
};

type Variant = {
  size: string;
  sizeCode: string;
  color: string;
  design: string;
  price: string;
  stock: string;
};

type UploadedImage = {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
};

const UPLOAD_ENDPOINT = "/uploads/image";
const CATEGORIES_ENDPOINT = "/categories";
const PRODUCTS_ENDPOINT = "/products";

const DRAFT_KEY = "admin-create-product-draft";

const emptyVariant = (): Variant => ({
  size: "",
  sizeCode: "",
  color: "",
  design: "",
  price: "",
  stock: "",
});

export default function AdminCreateProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    fullDescription: "",
    category: "",
    images: [] as string[],
    highlights: [""],
  });

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const [variants, setVariants] = useState<Variant[]>([emptyVariant()]);

  // --------------------------------------------------
  // LOAD SAVED DRAFT
  // --------------------------------------------------

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (parsed?.form) {
          setForm({
            name: parsed.form.name || "",
            description: parsed.form.description || "",
            fullDescription: parsed.form.fullDescription || "",
            category: parsed.form.category || "",
            images: Array.isArray(parsed.form.images) ? parsed.form.images : [],
            highlights:
              Array.isArray(parsed.form.highlights) &&
              parsed.form.highlights.length
                ? parsed.form.highlights
                : [""],
          });
        }

        if (Array.isArray(parsed?.variants) && parsed.variants.length) {
          setVariants(parsed.variants);
        }

        if (Array.isArray(parsed?.uploadedImages)) {
          setUploadedImages(parsed.uploadedImages);
        }
      }
    } catch (err) {
      console.error("Failed to restore product draft:", err);
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  // --------------------------------------------------
  // AUTO SAVE DRAFT
  // --------------------------------------------------

  useEffect(() => {
    if (!draftLoaded) return;

    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          form,
          variants,
          uploadedImages,
        }),
      );
    } catch (err) {
      console.error("Failed to save product draft:", err);
    }
  }, [form, variants, uploadedImages, draftLoaded]);

  // --------------------------------------------------
  // LOAD CATEGORIES
  // --------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      setLoadingCategories(true);
      setError("");

      try {
        const response = await api.get(CATEGORIES_ENDPOINT);

        console.log("CATEGORIES RESPONSE:", response.data);

        /*
         Expected API response:

         {
           success: true,
           count: 3,
           data: [
             {
               _id: "...",
               name: "Pants",
               prefix: "34",
               slug: "pants"
             }
           ]
         }
        */

        const rawData = response?.data?.data;

        let loadedCategories: Category[] = [];

        if (Array.isArray(rawData)) {
          loadedCategories = rawData;
        } else if (Array.isArray(rawData?.categories)) {
          loadedCategories = rawData.categories;
        } else if (Array.isArray(response?.data?.categories)) {
          loadedCategories = response.data.categories;
        }

        console.log("LOADED CATEGORIES:", loadedCategories);

        if (!mounted) return;

        setCategories(loadedCategories);

        if (!loadedCategories.length) {
          setError("Categories API returned no categories.");
        }
      } catch (err: any) {
        console.error("FAILED TO LOAD CATEGORIES:", err);
        console.error("CATEGORY STATUS:", err?.response?.status);
        console.error("CATEGORY URL:", err?.config?.url);
        console.error("CATEGORY BASE URL:", err?.config?.baseURL);
        console.error("CATEGORY RESPONSE:", err?.response?.data);

        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load categories.",
        );
      } finally {
        if (mounted) {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  const updateForm = (field: keyof typeof form, value: string | string[]) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // --------------------------------------------------
  // IMAGE UPLOAD
  // --------------------------------------------------

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setError("");
    setUploading(true);

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setError(`${file.name} is not a valid image file.`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        const formData = new FormData();
        formData.append("image", file);

        console.log("UPLOADING:", file.name);
        console.log("UPLOAD ENDPOINT:", UPLOAD_ENDPOINT);

        const response = await api.post(UPLOAD_ENDPOINT, formData);

        console.log("UPLOAD RESPONSE:", response.data);

        const uploaded = response?.data?.data;

        if (!uploaded?.url) {
          throw new Error(response?.data?.message || "Image upload failed.");
        }

        const image: UploadedImage = {
          url: uploaded.url,
          publicId: uploaded.publicId,
          width: uploaded.width,
          height: uploaded.height,
          format: uploaded.format,
          size: uploaded.size,
        };

        setUploadedImages((current) => [...current, image]);

        setForm((current) => ({
          ...current,
          images: [...current.images, uploaded.url],
        }));
      }
    } catch (err: any) {
      console.error("IMAGE UPLOAD ERROR:", err);
      console.error("STATUS:", err?.response?.status);
      console.error("URL:", err?.config?.url);
      console.error("BASE URL:", err?.config?.baseURL);
      console.error("RESPONSE:", err?.response?.data);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to upload image.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, i) => i !== index),
    }));

    setUploadedImages((current) => current.filter((_, i) => i !== index));
  };

  // --------------------------------------------------
  // HIGHLIGHTS
  // --------------------------------------------------

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

  // --------------------------------------------------
  // VARIANTS
  // --------------------------------------------------

  const updateVariant = (
    index: number,
    field: keyof Variant,
    value: string,
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
    setVariants((current) => [...current, emptyVariant()]);
  };

  const removeVariant = (index: number) => {
    setVariants((current) =>
      current.length <= 1 ? current : current.filter((_, i) => i !== index),
    );
  };

  // --------------------------------------------------
  // CREATE PRODUCT
  // --------------------------------------------------

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (saving || uploading) return;

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
        setError(
          `Variant #${index + 1}: Size Code must be exactly 4 digits (example: 0038).`,
        );
        return;
      }

      const price = Number(variant.price);

      if (variant.price.trim() === "" || !Number.isFinite(price) || price < 0) {
        setError(`Variant #${index + 1}: Please enter a valid price.`);
        return;
      }

      const stock = Number(variant.stock);

      if (
        variant.stock.trim() === "" ||
        !Number.isFinite(stock) ||
        stock < 0 ||
        !Number.isInteger(stock)
      ) {
        setError(`Variant #${index + 1}: Stock must be a valid whole number.`);
        return;
      }
    }

    const images = form.images.map((image) => image.trim()).filter(Boolean);

    const highlights = form.highlights
      .map((highlight) => highlight.trim())
      .filter(Boolean);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      fullDescription: form.fullDescription.trim(),
      category: form.category,
      images,
      thumbnail: images[0] || "",
      highlights,
      variants: variants.map((variant) => ({
        size: variant.size.trim(),
        sizeCode: variant.sizeCode.trim(),
        color: variant.color.trim(),
        design: variant.design.trim(),
        price: Number(variant.price),
        stock: Number(variant.stock),
      })),
    };

    console.log("CREATE PRODUCT PAYLOAD:", payload);

    try {
      setSaving(true);

      const response = await api.post(PRODUCTS_ENDPOINT, payload);

      console.log("PRODUCT CREATED:", response.data);

      // Clear saved draft only after successful product creation.
      localStorage.removeItem(DRAFT_KEY);

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("FAILED TO CREATE PRODUCT:", err);
      console.error("PRODUCT STATUS:", err?.response?.status);
      console.error("PRODUCT URL:", err?.config?.url);
      console.error("PRODUCT BASE URL:", err?.config?.baseURL);
      console.error("PRODUCT RESPONSE:", err?.response?.data);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to create product.",
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

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
              Create Product
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Add a new product, variants, pricing and inventory.
            </p>
          </div>

          <button
            form="create-product-form"
            type="submit"
            disabled={saving || uploading || loadingCategories}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#f85606] px-5 text-xs font-bold text-white shadow-sm transition hover:bg-[#df4d03] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Product
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form id="create-product-form" onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {/* BASIC INFORMATION */}
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
                      placeholder="Classic Cotton Shirt"
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
                      placeholder="Comfortable everyday cotton shirt"
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
                      placeholder="<h2>Product Details</h2>"
                      className="w-full resize-y rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none transition focus:border-[#f85606] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>
              </section>

              {/* IMAGES */}
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                      <ImagePlus className="h-5 w-5 text-[#f85606]" />
                    </div>

                    <div>
                      <h2 className="text-base font-extrabold text-gray-900">
                        Product Images
                      </h2>

                      <p className="text-xs text-gray-500">
                        Upload product images to Cloudinary
                      </p>
                    </div>
                  </div>

                  <label
                    className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#f85606] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#df4d03] ${
                      uploading ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        Upload Images
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {form.images.length === 0 ? (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center transition hover:border-[#f85606] hover:bg-orange-50/30">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
                      <Upload className="h-5 w-5 text-[#f85606]" />
                    </div>

                    <p className="mt-3 text-sm font-bold text-gray-800">
                      Upload product images
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, WEBP up to 10MB
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {form.images.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                      >
                        <img
                          src={image}
                          alt={`${form.name || "Product"} ${index + 1}`}
                          className="aspect-square w-full object-cover"
                        />

                        {index === 0 && (
                          <div className="absolute left-2 top-2 rounded-md bg-[#f85606] px-2 py-1 text-[10px] font-bold text-white">
                            Thumbnail
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-gray-500 shadow-sm transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center transition hover:border-[#f85606] hover:bg-orange-50/30">
                      {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-[#f85606]" />
                      ) : (
                        <>
                          <Plus className="h-6 w-6 text-[#f85606]" />
                          <span className="mt-2 text-xs font-bold text-gray-600">
                            Add Image
                          </span>
                        </>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </section>

              {/* HIGHLIGHTS */}
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

              {/* VARIANTS */}
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
                      key={index}
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
                            value={variant.size}
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

                          {variant.sizeCode.length > 0 && (
                            <p
                              className={`mt-1 text-[10px] font-semibold ${
                                variant.sizeCode.length === 4
                                  ? "text-green-600"
                                  : "text-red-500"
                              }`}
                            >
                              {variant.sizeCode.length === 4
                                ? "✓ Valid Size Code"
                                : "Must be exactly 4 digits"}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="mb-1 block text-[10px] font-bold text-gray-500">
                            Color
                          </label>

                          <input
                            value={variant.color}
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
                            value={variant.design}
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
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-6">
              {/* CATEGORY */}
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-gray-900">
                    Category
                  </h2>

                  {!loadingCategories && (
                    <span className="text-[10px] font-bold text-gray-400">
                      {categories.length} found
                    </span>
                  )}
                </div>

                <select
                  value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                  disabled={loadingCategories}
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#f85606] focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : categories.length
                        ? "Select category"
                        : "No categories found"}
                  </option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {!loadingCategories && categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {categories.map((category) => (
                      <button
                        key={category._id}
                        type="button"
                        onClick={() => updateForm("category", category._id)}
                        className={`rounded-md border px-2 py-1 text-[10px] font-bold transition ${
                          form.category === category._id
                            ? "border-[#f85606] bg-orange-50 text-[#f85606]"
                            : "border-gray-200 text-gray-500 hover:border-[#f85606] hover:text-[#f85606]"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* PREVIEW */}
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

              <button
                type="submit"
                disabled={saving || uploading || loadingCategories}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f85606] text-sm font-extrabold text-white shadow-sm transition hover:bg-[#df4d03] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Product...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Create Product
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
