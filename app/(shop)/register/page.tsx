// app/register/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/axios";
import { useStore } from "@/lib/store";
import {
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  Mail,
  LockKeyhole,
  Store,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  User,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  /* =========================================================
      VALIDATION
  ========================================================= */

  const nameError =
    nameTouched && !name.trim()
      ? "Full name is required."
      : nameTouched && name.trim().length < 2
        ? "Name must be at least 2 characters."
        : null;

  const emailError =
    emailTouched && !email.trim()
      ? "Email address is required."
      : emailTouched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? "Please enter a valid email address."
        : null;

  const passwordError =
    passwordTouched && !password
      ? "Password is required."
      : passwordTouched && password.length < 6
        ? "Password must be at least 6 characters."
        : null;

  const isFormValid =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    password.length >= 6;

  /* =========================================================
      API ERROR MESSAGE
  ========================================================= */

  const getErrorMessage = (err: any) => {
    const status = err?.response?.status;

    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.response?.data?.errors?.[0]?.message;

    if (message) return message;

    if (status === 400) {
      return "Please check the information you entered.";
    }

    if (status === 409) {
      return "An account with this email already exists.";
    }

    if (status === 422) {
      return "Some of the information is invalid.";
    }

    if (status === 404) {
      return "Registration service was not found.";
    }

    if (status >= 500) {
      return "Server error. Please try again later.";
    }

    if (!err?.response) {
      return "Unable to connect to the server. Please check your internet connection.";
    }

    return "Something went wrong. Please try again.";
  };

  /* =========================================================
      REGISTER
  ========================================================= */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading || success) return;

    setNameTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);
    setError(null);

    if (!isFormValid) {
      return;
    }

    try {
      setLoading(true);

      const normalizedName = name.trim();
      const normalizedEmail = email.trim().toLowerCase();

      let userData;

      try {
        /* Primary endpoint */
        const res = await api.post("/auth/register", {
          name: normalizedName,
          email: normalizedEmail,
          password,
        });

        userData =
          res.data?.user || res.data?.data?.user || res.data?.data || res.data;
      } catch (primaryError) {
        /*
         * Fallback endpoint
         */
        const resFallback = await api.post("/users/register", {
          name: normalizedName,
          email: normalizedEmail,
          password,
        });

        userData =
          resFallback.data?.user ||
          resFallback.data?.data?.user ||
          resFallback.data?.data ||
          resFallback.data;
      }

      if (!userData) {
        throw new Error(
          "Registration succeeded but user data was not returned.",
        );
      }

      /* =====================================================
          SAVE USER
      ===================================================== */

      setUser(userData);

      /* =====================================================
          SUCCESS STATE
      ===================================================== */

      setSuccess(true);

      /*
       * Give the user a small success animation
       * before redirecting.
       */

      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 900);
    } catch (err: any) {
      console.error("Registration failed:", err);

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f7f7f7] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-2">
        {/* =====================================================
            LEFT — BRAND PANEL
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative hidden overflow-hidden bg-[#f85606] p-10 lg:flex lg:flex-col lg:justify-between"
        >
          {/* Decorative circles */}

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[40px] border-white/10"
          />

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full border-[50px] border-white/10"
          />

          {/* Brand */}

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative z-10"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                <Store className="h-5 w-5 text-[#f85606]" />
              </div>

              <span className="text-xl font-extrabold tracking-tight">
                VendorStore
              </span>
            </Link>
          </motion.div>

          {/* Main Content */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="relative z-10 max-w-md"
          >
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
              Create your account.
              <br />
              Start shopping.
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-6 text-orange-50">
              Join VendorStore to manage your account, track orders, save your
              favorite products and enjoy a faster shopping experience.
            </p>

            <div className="mt-8 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
                className="flex items-center gap-3 text-sm text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <span>Secure account creation</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
                className="flex items-center gap-3 text-sm text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <span>Simple and fast registration</span>
              </motion.div>
            </div>
          </motion.div>

          <p className="relative z-10 text-xs text-orange-100">
            © {new Date().getFullYear()} VendorStore
          </p>
        </motion.div>

        {/* =====================================================
            RIGHT — REGISTER FORM
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="p-6 sm:p-10 lg:p-12"
        >
          {/* Mobile Brand */}

          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                <Store className="h-5 w-5 text-[#f85606]" />
              </div>

              <span className="font-extrabold text-gray-900">VendorStore</span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-[#f85606]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
          </div>

          {/* Header */}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-[#f85606]">
              Get started
            </p>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Create your account
            </h2>

            <p className="mt-2 text-sm leading-5 text-gray-500">
              Enter your information to create your VendorStore account.
            </p>
          </motion.div>

          {/* ===================================================
              ERROR
          ==================================================== */}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  y: -5,
                }}
                className="mt-6 overflow-hidden"
              >
                <motion.div
                  initial={{ x: -5 }}
                  animate={{ x: 0 }}
                  className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

                  <div>
                    <p className="text-xs font-bold text-red-700">
                      Registration failed
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-red-600">
                      {error}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===================================================
              SUCCESS
          ==================================================== */}

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.94,
                  y: 5,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                }}
                transition={{
                  duration: 0.3,
                }}
                className="mt-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </motion.div>

                <div>
                  <p className="text-xs font-bold text-green-700">
                    Account created successfully
                  </p>

                  <p className="text-xs text-green-600">
                    Redirecting you to VendorStore...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===================================================
              FORM
          ==================================================== */}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
            {/* =================================================
                NAME
            ================================================== */}

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label htmlFor="name" className="text-xs font-bold text-gray-700">
                Full name
              </label>

              <div className="relative mt-2">
                <User className="pointer-events-none absolute left-3 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-gray-400" />

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  disabled={loading}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  onBlur={() => setNameTouched(true)}
                  placeholder="John Doe"
                  className={`h-11 w-full rounded-lg border bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
                    nameError
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#f85606] focus:ring-2 focus:ring-orange-100"
                  } disabled:cursor-not-allowed disabled:bg-gray-50`}
                />
              </div>

              <AnimatePresence>
                {nameError && (
                  <motion.p
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1.5 text-[11px] font-medium text-red-500"
                  >
                    {nameError}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* =================================================
                EMAIL
            ================================================== */}

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label
                htmlFor="email"
                className="text-xs font-bold text-gray-700"
              >
                Email address
              </label>

              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-gray-400" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  disabled={loading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="you@example.com"
                  className={`h-11 w-full rounded-lg border bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
                    emailError
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#f85606] focus:ring-2 focus:ring-orange-100"
                  } disabled:cursor-not-allowed disabled:bg-gray-50`}
                />
              </div>

              <AnimatePresence>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1.5 text-[11px] font-medium text-red-500"
                  >
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* =================================================
                PASSWORD
            ================================================== */}

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label
                htmlFor="password"
                className="text-xs font-bold text-gray-700"
              >
                Password
              </label>

              <div className="relative mt-2">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-gray-400" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  disabled={loading}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder="Enter your password"
                  className={`h-11 w-full rounded-lg border bg-white pl-10 pr-11 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
                    passwordError
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#f85606] focus:ring-2 focus:ring-orange-100"
                  } disabled:cursor-not-allowed disabled:bg-gray-50`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-[17px] w-[17px]" />
                  ) : (
                    <Eye className="h-[17px] w-[17px]" />
                  )}
                </button>
              </div>

              <AnimatePresence>
                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1.5 text-[11px] font-medium text-red-500"
                  >
                    {passwordError}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Password strength */}

              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2"
                >
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((item) => {
                      const strength = Math.min(
                        4,
                        Math.floor(password.length / 3),
                      );

                      return (
                        <motion.div
                          key={item}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          className={`h-1 flex-1 rounded-full ${
                            item <= strength ? "bg-[#f85606]" : "bg-gray-100"
                          }`}
                        />
                      );
                    })}
                  </div>

                  <p className="mt-1 text-[10px] text-gray-400">
                    {password.length < 6
                      ? "Password should be at least 6 characters."
                      : password.length < 9
                        ? "Good password."
                        : "Strong password."}
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* =================================================
                SUBMIT
            ================================================== */}

            <motion.button
              type="submit"
              disabled={loading || success}
              whileHover={
                !loading && !success
                  ? {
                      y: -1,
                      boxShadow: "0 6px 18px rgba(248, 86, 6, 0.18)",
                    }
                  : undefined
              }
              whileTap={
                !loading && !success
                  ? {
                      scale: 0.985,
                    }
                  : undefined
              }
              transition={{
                duration: 0.15,
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#f85606] text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#df4d03] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {success ? (
                <>
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 15,
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </motion.div>
                  Account Created
                </>
              ) : loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </>
              )}
            </motion.button>
          </form>

          {/* ===================================================
              DIVIDER
          ==================================================== */}

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100" />

            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
              Already a member?
            </span>

            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* ===================================================
              LOGIN
          ==================================================== */}

          <Link
            href="/login"
            className="flex h-11 w-full items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-700 transition-all hover:border-[#f85606] hover:text-[#f85606]"
          >
            Sign in to your account
          </Link>

          {/* Footer */}

          <div className="mt-7 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
            <ShieldCheck className="h-3.5 w-3.5 text-green-600" />

            <span>Your information is securely protected</span>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
