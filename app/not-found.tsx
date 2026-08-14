"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  PackageSearch,
  ShoppingBag,
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f7f7] px-4 py-10">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 animate-[float_7s_ease-in-out_infinite] rounded-full bg-[#fff0e8]" />

        <div className="absolute -bottom-32 -right-24 h-80 w-80 animate-[float_9s_ease-in-out_infinite_reverse] rounded-full bg-[#ffe3d5]" />

        <div className="absolute left-[12%] top-[25%] h-3 w-3 animate-pulse rounded-full bg-[#f85606]/30" />

        <div className="absolute right-[15%] top-[18%] h-2 w-2 animate-pulse rounded-full bg-[#f85606]/40" />

        <div className="absolute bottom-[20%] left-[18%] h-2 w-2 animate-pulse rounded-full bg-[#f85606]/30" />
      </div>

      {/* Main Card */}
      <section className="relative z-10 w-full max-w-2xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/5 ring-1 ring-black/5">
          {/* Orange Top Line */}
          <div className="h-1.5 w-full bg-[#f85606]" />

          <div className="px-6 py-12 text-center sm:px-10 sm:py-16">
            {/* Animated Icon */}
            <div className="relative mx-auto mb-7 h-28 w-28">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#f85606]/10 [animation-duration:2.5s]" />

              <div className="absolute inset-2 flex items-center justify-center rounded-full bg-[#fff3ed]">
                <PackageSearch className="h-14 w-14 text-[#f85606] stroke-[1.5] animate-[float_3s_ease-in-out_infinite]" />
              </div>
            </div>

            {/* 404 */}
            <div className="relative">
              <h1 className="text-[90px] font-black leading-none tracking-tighter text-gray-900 sm:text-[120px]">
                4<span className="text-[#f85606]">0</span>4
              </h1>

              <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-[#f85606]" />
            </div>

            {/* Text */}
            <h2 className="mt-7 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Oops! Page not found
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
              The page you&apos;re looking for may have been moved, deleted, or
              simply doesn&apos;t exist anymore.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => router.push("/")}
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-[#f85606] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#df4d03] hover:shadow-lg hover:shadow-[#f85606]/20 active:translate-y-0"
              >
                <Home className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Back to Home
              </button>

              <button
                onClick={() => router.back()}
                className="group inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                Go Back
              </button>
            </div>

            {/* Bottom Hint */}
            <div className="mx-auto mt-10 flex max-w-sm items-center justify-center gap-2 border-t border-gray-100 pt-6 text-xs text-gray-400">
              <ShoppingBag className="h-4 w-4 text-[#f85606]" />
              <span>Find something great on our store</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* Brand Accent */}
        <div className="mt-5 text-center">
          <p className="text-xs font-medium text-gray-400">
            Quality products · Better prices · Better shopping
          </p>
        </div>
      </section>

      {/* Custom Animation */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </main>
  );
}
