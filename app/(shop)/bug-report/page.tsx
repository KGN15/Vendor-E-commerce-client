// app/bug-report/page.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bug,
  CheckCircle2,
  Loader2,
  Send,
  AlertCircle,
  Mail,
  FileText,
  MessageSquare,
} from "lucide-react";

type BugForm = {
  title: string;
  category: string;
  description: string;
  email: string;
};

const initialForm: BugForm = {
  title: "",
  category: "Other",
  description: "",
  email: "",
};

export default function BugReportPage() {
  const [form, setForm] = useState<BugForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field: keyof BugForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const title = form.title.trim();
    const description = form.description.trim();
    const email = form.email.trim();

    if (!title) {
      setError("Please enter a short title for the bug.");
      return;
    }

    if (!description) {
      setError("Please describe the problem you encountered.");
      return;
    }

    if (description.length < 10) {
      setError("Please provide a little more detail about the problem.");
      return;
    }

    setSubmitting(true);

    try {
      /*
       * Backend API can be connected here later.
       *
       * Example:
       *
       * await api.post("/bug-reports", {
       *   title,
       *   category: form.category,
       *   description,
       *   email: email || undefined,
       * });
       */

      await new Promise((resolve) => setTimeout(resolve, 700));

      setSubmitted(true);
      setForm(initialForm);
    } catch (err) {
      console.error("Bug report submission failed:", err);

      setError("We couldn't submit your report right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#f7f7f7] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-xl items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-sm sm:p-9"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>

            <h1 className="mt-6 text-2xl font-black tracking-tight text-gray-950">
              Report submitted
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              Thanks for helping us improve VendorStore. We've received your bug
              report and will review it.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/profile"
                className="flex h-11 flex-1 items-center justify-center rounded-lg bg-[#f85606] px-4 text-sm font-bold text-white transition hover:bg-[#df4d03]"
              >
                Back to profile
              </Link>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="flex h-11 flex-1 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-bold text-gray-700 transition hover:border-[#f85606] hover:text-[#f85606]"
              >
                Report another bug
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f7f7f7] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* =====================================================
            TOP
        ====================================================== */}

        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/profile"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#f85606]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to profile
          </Link>

          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Bug Report
          </span>
        </div>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50">
              <Bug className="h-7 w-7 text-red-500" />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                Report a Bug
              </h1>

              <p className="mt-1.5 text-sm leading-6 text-gray-500">
                Found something that's not working correctly? Let us know so we
                can fix it.
              </p>
            </div>
          </div>
        </motion.section>

        {/* =====================================================
            FORM
        ====================================================== */}

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          onSubmit={handleSubmit}
          className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {/* Error */}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

              <p className="text-sm font-medium leading-6 text-red-700">
                {error}
              </p>
            </motion.div>
          )}

          <div className="space-y-5">
            {/* Title */}

            <div>
              <label
                htmlFor="bug-title"
                className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800"
              >
                <FileText className="h-4 w-4 text-gray-400" />
                Bug title
              </label>

              <input
                id="bug-title"
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="e.g. Product image is not loading"
                maxLength={150}
                disabled={submitting}
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-1.5 text-xs text-gray-400">
                Give us a short description of the problem.
              </p>
            </div>

            {/* Category */}

            <div>
              <label
                htmlFor="bug-category"
                className="mb-2 block text-sm font-bold text-gray-800"
              >
                Category
              </label>

              <select
                id="bug-category"
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                disabled={submitting}
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 outline-none transition focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="Other">Other</option>
                <option value="Products">Products</option>
                <option value="Cart">Cart</option>
                <option value="Checkout">Checkout</option>
                <option value="Orders">Orders</option>
                <option value="Wishlist">Wishlist</option>
                <option value="Account">Account</option>
                <option value="Login">Login / Authentication</option>
                <option value="UI">UI / Design</option>
                <option value="Performance">Performance</option>
              </select>
            </div>

            {/* Description */}

            <div>
              <label
                htmlFor="bug-description"
                className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800"
              >
                <MessageSquare className="h-4 w-4 text-gray-400" />
                What happened?
              </label>

              <textarea
                id="bug-description"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Tell us what happened, what you expected to happen, and how we can reproduce the problem..."
                rows={7}
                maxLength={3000}
                disabled={submitting}
                className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="mt-1.5 flex justify-end">
                <span className="text-xs text-gray-400">
                  {form.description.length}/3000
                </span>
              </div>
            </div>

            {/* Email */}

            <div>
              <label
                htmlFor="bug-email"
                className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800"
              >
                <Mail className="h-4 w-4 text-gray-400" />
                Email
                <span className="font-normal text-gray-400">(optional)</span>
              </label>

              <input
                id="bug-email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="you@example.com"
                disabled={submitting}
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-1.5 text-xs leading-5 text-gray-400">
                Add your email if you'd like us to contact you about the report.
              </p>
            </div>
          </div>

          {/* =================================================
              SUBMIT
          ================================================== */}

          <div className="mt-7 border-t border-gray-100 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#f85606] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#df4d03] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[170px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit report
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* =====================================================
            TIPS
        ====================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="text-sm font-black text-gray-900">
            What makes a good bug report?
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-bold text-gray-800">
                1. What happened?
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Explain the problem you saw.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-bold text-gray-800">
                2. What did you expect?
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Tell us what should have happened.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-bold text-gray-800">
                3. How can we reproduce it?
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Include the steps that caused the issue.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
