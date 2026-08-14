"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/axios";
import { useStore } from "@/lib/store";
import {
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  Mail,
  LockKeyhole,
  Store,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  /* =========================================================
      REMEMBER EMAIL
  ========================================================= */

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("vendorstore_login_email");

      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  /* =========================================================
      VALIDATION
  ========================================================= */

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
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length >= 6;

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
      return "Please check your email and password.";
    }

    if (status === 401) {
      return "Incorrect email or password.";
    }

    if (status === 403) {
      return "Your account does not have permission to sign in.";
    }

    if (status === 404) {
      return "Login service was not found.";
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
      LOGIN
  ========================================================= */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading || success) return;

    setEmailTouched(true);
    setPasswordTouched(true);
    setError(null);

    if (!isFormValid) return;

    try {
      setLoading(true);

      const normalizedEmail = email.trim().toLowerCase();

      const res = await api.post("/auth/login", {
        email: normalizedEmail,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      /* =====================================================
          GET TOKEN
      ===================================================== */

      const token =
        res.data?.token ||
        res.data?.accessToken ||
        res.data?.data?.token ||
        res.data?.data?.accessToken;

      /* =====================================================
          GET USER
      ===================================================== */

      const userData = res.data?.user || res.data?.data?.user;

      if (!token) {
        console.error("Token missing from login response:", res.data);

        throw new Error(
          "Login succeeded, but authentication token was not returned.",
        );
      }

      if (!userData) {
        console.error("User missing from login response:", res.data);

        throw new Error("Login succeeded, but user data was not returned.");
      }

      /* =====================================================
          SAVE TOKEN
      ===================================================== */

      localStorage.setItem("vendorstore_token", token);

      /* =====================================================
          SAVE USER
      ===================================================== */

      setUser(userData);
      

      /* =====================================================
          REMEMBER EMAIL
      ===================================================== */

      try {
        if (rememberMe) {
          localStorage.setItem("vendorstore_login_email", normalizedEmail);
        } else {
          localStorage.removeItem("vendorstore_login_email");
        }
      } catch {
        // Ignore localStorage errors
      }

      /* =====================================================
          SUCCESS
      ===================================================== */

      setSuccess(true);

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 850);
    } catch (err: any) {
      console.error("Login failed:", err);

      if (err?.message?.includes("authentication token")) {
        setError(err.message);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
      window.location.href = "/profile";
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-[calc(100vh-72px)] bg-[#f7f7f7] px-4 py-8 sm:px-6 sm:py-12"
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 25,
          scale: 0.985,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-2"
      >
        {/* =====================================================
            LEFT — BRAND PANEL
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative hidden overflow-hidden bg-[#f85606] p-10 lg:flex lg:flex-col lg:justify-between"
        >
          {/* Decorative shapes */}

          <motion.div
            initial={{
              scale: 0.7,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.8,
              delay: 0.25,
            }}
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[40px] border-white/10"
          />

          <motion.div
            initial={{
              scale: 0.7,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.8,
              delay: 0.4,
            }}
            className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full border-[50px] border-white/10"
          />

          {/* Floating glow */}

          <motion.div
            animate={{
              y: [0, -10, 0],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-16 top-24 h-24 w-24 rounded-full bg-white/10 blur-2xl"
          />

          {/* Brand */}

          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
            }}
            className="relative z-10"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white"
            >
              <motion.div
                whileHover={{
                  rotate: -5,
                  scale: 1.05,
                }}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm"
              >
                <Store className="h-5 w-5 text-[#f85606]" />
              </motion.div>

              <span className="text-xl font-extrabold tracking-tight">
                VendorStore
              </span>
            </Link>
          </motion.div>

          {/* Content */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.55,
              delay: 0.35,
            }}
            className="relative z-10 max-w-md"
          >
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
              Welcome back.
              <br />
              Shop smarter.
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-6 text-orange-50">
              Sign in to manage your account, track orders, save products and
              enjoy a faster checkout experience.
            </p>

            <div className="mt-8 space-y-4">
              <motion.div
                initial={{
                  opacity: 0,
                  x: -15,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.55,
                }}
                className="flex items-center gap-3 text-sm text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <span>Secure account access</span>
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                  x: -15,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.65,
                }}
                className="flex items-center gap-3 text-sm text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <span>Fast and simple checkout</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="relative z-10 text-xs text-orange-100"
          >
            © {new Date().getFullYear()} VendorStore
          </motion.p>
        </motion.div>

        {/* =====================================================
            RIGHT — LOGIN FORM
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            x: 30,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="p-6 sm:p-10 lg:p-12"
        >
          {/* Mobile Brand */}

          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.25,
            }}
            className="mb-8 flex items-center justify-between lg:hidden"
          >
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
          </motion.div>

          {/* Header */}

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
              duration: 0.4,
            }}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-[#f85606]">
              Welcome back
            </p>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Sign in to your account
            </h2>

            <p className="mt-2 text-sm leading-5 text-gray-500">
              Enter your credentials to continue shopping.
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
                  y: -8,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  y: -8,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="mt-6 overflow-hidden"
              >
                <motion.div
                  animate={{
                    x: [0, -5, 5, -4, 4, 0],
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                  className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

                  <div>
                    <p className="text-xs font-bold text-red-700">
                      Sign in failed
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
                  scale: 0.92,
                  y: 5,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                }}
                transition={{
                  duration: 0.3,
                }}
                className="mt-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3"
              >
                <motion.div
                  initial={{
                    scale: 0,
                    rotate: -45,
                  }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 15,
                  }}
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </motion.div>

                <div>
                  <p className="text-xs font-bold text-green-700">
                    Login successful
                  </p>

                  <p className="text-xs text-green-600">Redirecting you...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===================================================
              FORM
          ==================================================== */}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
            {/* EMAIL */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.4,
                duration: 0.4,
              }}
            >
              <label
                htmlFor="email"
                className="text-xs font-bold text-gray-700"
              >
                Email address
              </label>

              <motion.div
                whileFocus={{
                  scale: 1.005,
                }}
                className="relative mt-2"
              >
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

                    if (error) {
                      setError(null);
                    }
                  }}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="you@example.com"
                  className={`h-11 w-full rounded-lg border bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
                    emailError
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#f85606] focus:ring-2 focus:ring-orange-100"
                  } disabled:cursor-not-allowed disabled:bg-gray-50`}
                />
              </motion.div>

              <AnimatePresence>
                {emailError && (
                  <motion.p
                    initial={{
                      opacity: 0,
                      y: -3,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -3,
                    }}
                    className="mt-1.5 text-[11px] font-medium text-red-500"
                  >
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* PASSWORD */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.48,
                duration: 0.4,
              }}
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-bold text-gray-700"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-[#f85606] transition-all hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <motion.div
                whileFocus={{
                  scale: 1.005,
                }}
                className="relative mt-2"
              >
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-gray-400" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  disabled={loading}
                  onChange={(e) => {
                    setPassword(e.target.value);

                    if (error) {
                      setError(null);
                    }
                  }}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder="Enter your password"
                  className={`h-11 w-full rounded-lg border bg-white pl-10 pr-11 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
                    passwordError
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#f85606] focus:ring-2 focus:ring-orange-100"
                  } disabled:cursor-not-allowed disabled:bg-gray-50`}
                />

                <motion.button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  whileTap={{
                    scale: 0.8,
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={showPassword ? "hide" : "show"}
                      initial={{
                        opacity: 0,
                        scale: 0.7,
                        rotate: -20,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.7,
                        rotate: 20,
                      }}
                      transition={{
                        duration: 0.15,
                      }}
                    >
                      {showPassword ? (
                        <EyeOff className="h-[17px] w-[17px]" />
                      ) : (
                        <Eye className="h-[17px] w-[17px]" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
              </motion.div>

              <AnimatePresence>
                {passwordError && (
                  <motion.p
                    initial={{
                      opacity: 0,
                      y: -3,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -3,
                    }}
                    className="mt-1.5 text-[11px] font-medium text-red-500"
                  >
                    {passwordError}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* REMEMBER ME */}

            <motion.label
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.55,
              }}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                checked={rememberMe}
                disabled={loading}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-[#f85606]"
              />

              <span className="text-xs text-gray-600">Remember my email</span>
            </motion.label>

            {/* SUBMIT */}

            <motion.button
              type="submit"
              disabled={loading || success}
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.6,
                duration: 0.4,
              }}
              whileHover={
                !loading && !success
                  ? {
                      y: -2,
                      boxShadow: "0 8px 22px rgba(248, 86, 6, 0.2)",
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
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#f85606] text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#df4d03] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <AnimatePresence mode="wait" initial={false}>
                {success ? (
                  <motion.span
                    key="success"
                    initial={{
                      opacity: 0,
                      scale: 0.7,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Signed In
                  </motion.span>
                ) : loading ? (
                  <motion.span
                    key="loading"
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </motion.span>
                ) : (
                  <motion.span
                    key="login"
                    initial={{
                      opacity: 0,
                      y: 3,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="flex items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* Divider */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.65,
            }}
            className="my-7 flex items-center gap-3"
          >
            <div className="h-px flex-1 bg-gray-100" />

            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
              New to VendorStore?
            </span>

            <div className="h-px flex-1 bg-gray-100" />
          </motion.div>

          {/* Register */}

          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.7,
            }}
          >
            <Link
              href="/register"
              className="flex h-11 w-full items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-700 transition-all hover:border-[#f85606] hover:text-[#f85606]"
            >
              Create a new account
            </Link>
          </motion.div>

          {/* Footer */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.75,
            }}
            className="mt-7 flex items-center justify-center gap-1.5 text-[10px] text-gray-400"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-green-600" />

            <span>Your information is securely protected</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* =====================================================
          SUCCESS TRANSITION OVERLAY
      ====================================================== */}

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 0.08,
            }}
            exit={{
              opacity: 0,
            }}
            className="pointer-events-none fixed inset-0 z-50 bg-[#f85606]"
          />
        )}
      </AnimatePresence>
    </motion.main>
  );
}
