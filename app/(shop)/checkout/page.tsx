// app/checkout/page.tsx
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { api } from "@/lib/axios";
import Image from "next/image";
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  CreditCard,
  AlertCircle,
  ShieldCheck,
  MapPin,
  Mail,
  User,
  Phone,
  Truck,
} from "lucide-react";

type CheckoutForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
};

export default function CheckoutPage() {
  const router = useRouter();

  const { cart, getCartSubtotal, clearCart, user } = useStore();

  const [form, setForm] = useState<CheckoutForm>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*
   * ============================================================
   * AUTH CHECK
   * ============================================================
   */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token =
      localStorage.getItem("vendorstore_token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  /*
   * ============================================================
   * USER -> FORM
   * ============================================================
   */

  useEffect(() => {
    if (!user) return;

    setForm((current) => ({
      ...current,
      fullName: current.fullName || user.name || "",
      email: current.email || user.email || "",
      phone:
        current.phone ||
        (user as typeof user & { phone?: string }).phone ||
        "",
    }));
  }, [user]);

  /*
   * ============================================================
   * PRICE
   * ============================================================
   */

  const subtotal = useMemo(() => {
    return typeof getCartSubtotal === "function"
      ? Number(getCartSubtotal()) || 0
      : 0;
  }, [cart, getCartSubtotal]);

  const shipping = subtotal > 0 ? 10 : 0;
  const total = Number((subtotal + shipping).toFixed(2));

  /*
   * ============================================================
   * FORM HELPERS
   * ============================================================
   */

  const updateField = (field: keyof CheckoutForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError(null);
    }
  };

  /*
   * ============================================================
   * ERROR HANDLER
   * ============================================================
   */

  const getErrorMessage = (err: any): string => {
    const status = err?.response?.status;

    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.response?.data?.errors?.[0]?.message;

    if (message) return message;

    if (status === 400) {
      return "Please check your order and customer information.";
    }

    if (status === 401) {
      return "Your session has expired. Please login again.";
    }

    if (status === 403) {
      return "You are not authorized to place this order.";
    }

    if (status === 404) {
      return "Order service was not found.";
    }

    if (status === 409) {
      return "Some products are no longer available in the requested quantity.";
    }

    if (status >= 500) {
      return "Server error. Please try again later.";
    }

    if (!err?.response) {
      return "Unable to connect to the server.";
    }

    return "Something went wrong while placing your order.";
  };

  /*
   * ============================================================
   * PLACE COD ORDER
   * ============================================================
   */

  const handlePlaceOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading || success) return;

    if (!cart || cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("vendorstore_token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("token")
        : null;

    if (!token) {
      router.push("/login");
      return;
    }

    const cleanName = form.fullName.trim();
    const cleanEmail = form.email.trim().toLowerCase();
    const cleanPhone = form.phone.trim();
    const cleanAddress = [
      form.address.trim(),
      form.city.trim(),
      form.postalCode.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    /*
     * Backend requires:
     *
     * customer.name
     * customer.phone
     * customer.address
     *
     * Email is only used by the frontend/customer account
     * and is NOT sent because your current Order schema
     * does not contain customer.email.
     */

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!cleanPhone) {
      setError("Please enter your phone number.");
      return;
    }

    if (!cleanAddress) {
      setError("Please enter your complete delivery address.");
      return;
    }

    /*
     * Optional client-side phone validation.
     */
    const normalizedPhone = cleanPhone.replace(/[\s-]/g, "");

    if (!/^\+?\d{10,15}$/.test(normalizedPhone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    /*
     * Backend expects ONLY:
     *
     * {
     *   customer: {
     *     name,
     *     phone,
     *     address
     *   },
     *   paymentMethod: "COD",
     *   items: [
     *     {
     *       variant,
     *       quantity
     *     }
     *   ]
     * }
     *
     * Price is calculated securely by backend.
     * Client MUST NOT be trusted for totalAmount/price.
     */

    const orderPayload = {
      customer: {
        name: cleanName,
        phone: cleanPhone,
        address: cleanAddress,
      },

      paymentMethod: "COD" as const,

      items: cart.map((item) => ({
        variant: item.variantId,
        quantity: item.quantity,
      })),
    };

    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/orders/checkout", orderPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("COD order created:", response.data);

      /*
       * IMPORTANT:
       * Clear cart ONLY after successful backend response.
       */
      clearCart();

      setSuccess(true);
    } catch (err: any) {
      console.error("Failed to place COD order:", err);

      if (err?.response?.status === 401) {
        localStorage.removeItem("vendorstore_token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");

        setError("Your session has expired. Redirecting to login...");

        setTimeout(() => {
          router.push("/login");
        }, 1200);

        return;
      }

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * AUTH LOADING
   * ============================================================
   */

  if (checkingAuth) {
    return (
      <main className="min-h-[calc(100vh-60px)] bg-[#f7f7f7]">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-[#f85606]" />

            <p className="text-xs font-medium text-gray-500">
              Checking your account...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * SUCCESS
   * ============================================================
   */

  if (success) {
    return (
      <main className="min-h-[calc(100vh-60px)] bg-[#f7f7f7]">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10"
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 18,
              }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600"
            >
              <CheckCircle2 size={42} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-xs font-bold uppercase tracking-wider text-[#f85606]"
            >
              Order Confirmed
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl"
            >
              Order Placed Successfully!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500"
            >
              Your Cash on Delivery order has been received. Your order is
              currently pending admin approval.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs font-medium text-green-700"
            >
              <ShieldCheck className="h-4 w-4" />
              Order status: PENDING
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
            >
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#f85606] px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#df4d03] active:scale-[0.98]"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>

              <Link
                href="/orders"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-6 text-sm font-bold text-gray-700 transition-all hover:border-[#f85606] hover:text-[#f85606]"
              >
                View My Orders
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * EMPTY CART
   * ============================================================
   */

  if (!cart || cart.length === 0) {
    return (
      <main className="min-h-[calc(100vh-60px)] bg-[#f7f7f7]">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
              <ShoppingBag className="h-7 w-7 text-[#f85606]" />
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-gray-900">
              Your Cart is Empty
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add some items to your cart before checking out.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[#f85606] px-5 text-sm font-bold text-white transition-all hover:bg-[#df4d03]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Store
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * CHECKOUT
   * ============================================================
   */

  return (
    <main className="min-h-[calc(100vh-60px)] bg-[#f7f7f7] text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* TOP */}

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-[#f85606]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Store
          </Link>

          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#f85606]">
              Secure Checkout
            </p>

            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Checkout
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Complete your delivery information to place your order.
            </p>
          </div>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* LEFT */}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <form
              onSubmit={handlePlaceOrder}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
            >
              {/* FORM HEADER */}

              <div className="flex items-start gap-3 border-b border-gray-100 pb-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                  <Truck className="h-5 w-5 text-[#f85606]" />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-gray-900">
                    Delivery Details
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Enter the information required to deliver your order.
                  </p>
                </div>
              </div>

              {/* ERROR */}

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -8 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

                      <div>
                        <p className="text-xs font-bold text-red-700">
                          Unable to place order
                        </p>

                        <p className="mt-0.5 text-xs leading-5 text-red-600">
                          {error}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* INPUTS */}

              <div className="mt-6 space-y-5">
                {/* FULL NAME */}

                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-700"
                  >
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    disabled={loading}
                    value={form.fullName}
                    onChange={(e) =>
                      updateField("fullName", e.target.value)
                    }
                    placeholder="Your full name"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#f85606] focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-700"
                  >
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    disabled={loading}
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#f85606] focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-700"
                  >
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    disabled={loading}
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#f85606] focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>

                {/* ADDRESS */}

                <div>
                  <label
                    htmlFor="address"
                    className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-700"
                  >
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    Delivery Address
                  </label>

                  <textarea
                    id="address"
                    required
                    rows={3}
                    autoComplete="street-address"
                    disabled={loading}
                    value={form.address}
                    onChange={(e) =>
                      updateField("address", e.target.value)
                    }
                    placeholder="House / Road / Area"
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#f85606] focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>

                {/* CITY + POSTAL */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="city"
                      className="mb-1.5 block text-xs font-bold text-gray-700"
                    >
                      City
                    </label>

                    <input
                      id="city"
                      type="text"
                      required
                      autoComplete="address-level2"
                      disabled={loading}
                      value={form.city}
                      onChange={(e) =>
                        updateField("city", e.target.value)
                      }
                      placeholder="Dhaka"
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#f85606] focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="postalCode"
                      className="mb-1.5 block text-xs font-bold text-gray-700"
                    >
                      Postal Code
                    </label>

                    <input
                      id="postalCode"
                      type="text"
                      required
                      inputMode="numeric"
                      autoComplete="postal-code"
                      disabled={loading}
                      value={form.postalCode}
                      onChange={(e) =>
                        updateField("postalCode", e.target.value)
                      }
                      placeholder="1207"
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#f85606] focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* PAYMENT */}

              <div className="mt-7 border-t border-gray-100 pt-6">
                <div className="mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Payment Method
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                      <CreditCard className="h-5 w-5 text-[#f85606]" />
                    </div>

                    <div>
                      <p className="text-xs font-extrabold text-gray-900">
                        Cash on Delivery
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-500">
                        Pay when your order arrives.
                      </p>
                    </div>
                  </div>

                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#f85606]">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#f85606]" />
                  </div>
                </div>
              </div>

              {/* SUBMIT */}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={
                  !loading
                    ? {
                        y: -2,
                        boxShadow: "0 10px 25px rgba(248,86,6,0.18)",
                      }
                    : undefined
                }
                whileTap={
                  !loading
                    ? {
                        scale: 0.985,
                      }
                    : undefined
                }
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f85606] text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#df4d03] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Placing Order...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="order"
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Place COD Order
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* SECURITY */}

              <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" />

                <span>
                  Your order information is securely protected
                </span>
              </div>
            </form>
          </motion.div>

          {/* RIGHT — ORDER SUMMARY */}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* SUMMARY HEADER */}

              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">
                      Order Summary
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      {cart.length} {cart.length === 1 ? "item" : "items"} in
                      your cart
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                    <ShoppingBag className="h-4 w-4 text-[#f85606]" />
                  </div>
                </div>
              </div>

              {/* PRODUCTS */}

              <div className="max-h-80 overflow-y-auto px-6">
                {cart.map((item) => {
                  const price =
                    Number(
                      item.variant?.price ??
                        item.product?.basePrice ??
                        0
                    ) || 0;

                  const image =
                    item.product?.thumbnail ||
                    item.product?.gallery?.[0] ||
                    "/placeholder-product.png";

                  return (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex items-center gap-3 border-b border-gray-100 py-4 last:border-b-0"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        <Image
                          src={image}
                          alt={item.product?.name || "Product"}
                          width={300}
                          height={300}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-1 text-xs font-bold text-gray-800">
                          {item.product?.name || "Product"}
                        </h3>

                        <p className="mt-1 text-[11px] text-gray-500">
                          Qty: {item.quantity}
                        </p>

                        <p className="mt-1 text-[11px] font-semibold text-gray-400">
                          ${price.toFixed(2)} each
                        </p>
                      </div>

                      <p className="shrink-0 text-xs font-extrabold text-gray-900">
                        ${(price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* TOTALS */}

              <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-5">
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>

                    <span className="font-semibold text-gray-800">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-500">
                    <span>Shipping Fee</span>

                    <span className="font-semibold text-gray-800">
                      ${shipping.toFixed(2)}
                    </span>
                  </div>

                  <div className="my-3 h-px bg-gray-200" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-gray-900">
                      Total
                    </span>

                    <span className="text-xl font-black text-[#f85606]">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* COD STATUS */}

                <div className="mt-5 flex items-start gap-2 rounded-lg border border-orange-100 bg-orange-50 p-3">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#f85606]" />

                  <p className="text-[10px] leading-4 text-orange-700">
                    Your order will be created as{" "}
                    <strong>PENDING</strong>. An admin will review and approve
                    it before processing.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}