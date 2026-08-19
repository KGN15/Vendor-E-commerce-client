import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  Check,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "About VendorStore | Quality Products at Better Prices",
  description:
    "Learn more about VendorStore, an online shopping store focused on quality products, competitive prices, secure shopping, and reliable delivery.",
  keywords: [
    "VendorStore",
    "online shopping",
    "quality products",
    "better prices",
    "online store",
    "secure shopping",
    "fast delivery",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About VendorStore | Shop Better. Live Better.",
    description:
      "Discover what makes VendorStore different — carefully selected products, better value, secure shopping, and reliable delivery.",
    url: "/about",
    siteName: "VendorStore",
    type: "website",
  },
};

const values = [
  {
    number: "01",
    icon: Check,
    title: "Quality first",
    text: "We focus on products selected with care so customers can shop with greater confidence.",
  },
  {
    number: "02",
    icon: BadgePercent,
    title: "Better value",
    text: "We aim to offer competitive prices and useful deals without making shopping complicated.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Secure shopping",
    text: "From browsing to checkout, we work to provide a straightforward and trustworthy shopping experience.",
  },
  {
    number: "04",
    icon: Truck,
    title: "Reliable delivery",
    text: "We believe a good shopping experience continues after checkout, with dependable order delivery.",
  },
];

const features = [
  {
    icon: ShoppingBag,
    title: "Curated products",
    text: "Explore a growing collection of everyday products selected with quality and usefulness in mind.",
  },
  {
    icon: BadgePercent,
    title: "Competitive prices",
    text: "We look for practical value so you can discover products that make sense for your budget.",
  },
  {
    icon: Zap,
    title: "Simple experience",
    text: "Our store is designed to make product discovery and shopping fast, clear, and easy to navigate.",
  },
  {
    icon: ShieldCheck,
    title: "Customer focused",
    text: "We put clarity, reliability, and customer satisfaction at the center of the shopping experience.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen overflow-hidden bg-[#fafafa] text-gray-900">
        {/* =========================================================
            HERO
        ========================================================== */}
        <section className="relative isolate overflow-hidden border-b border-gray-200 bg-[#f7f7f5]">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-orange-200/30 blur-3xl" />

            <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-orange-100/50 blur-3xl" />

            <div className="absolute bottom-[-250px] left-[-150px] h-[450px] w-[450px] rounded-full bg-gray-200/50 blur-3xl" />

            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid min-h-[560px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
              {/* Copy */}
              <div className="max-w-3xl">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#f85606] shadow-sm backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f85606]" />
                  About VendorStore
                </div>

                <h1 className="max-w-4xl text-[48px] font-black leading-[0.94] tracking-[-0.055em] text-gray-950 sm:text-6xl lg:text-[78px]">
                  Shop better.
                  <br />
                  <span className="text-[#f85606]">Live better.</span>
                </h1>

                <p className="mt-8 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg sm:leading-8">
                  VendorStore is an online shopping destination built around a
                  simple idea: make it easier to discover quality products, find
                  better value, and enjoy a straightforward shopping experience.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/products"
                    className="group inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-gray-950 px-7 text-sm font-black text-white shadow-xl shadow-gray-900/10 transition hover:-translate-y-0.5 hover:bg-[#f85606]"
                  >
                    Explore products
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/"
                    className="inline-flex h-14 items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-7 text-sm font-bold text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    Back to home
                  </Link>
                </div>
              </div>

              {/* Visual */}
              <div className="relative mx-auto w-full max-w-[500px]">
                <div className="relative aspect-square">
                  <div className="absolute inset-[8%] rounded-full bg-[#f85606]" />

                  <div className="absolute inset-[14%] rounded-full bg-[#ff7b39]" />

                  <div className="absolute inset-0 rounded-full border border-gray-300/70" />

                  <div className="absolute inset-[5%] rounded-full border border-gray-200" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-[58%] w-[58%] rotate-[-6deg] items-center justify-center rounded-[32px] bg-white shadow-[0_35px_90px_rgba(0,0,0,0.18)]">
                      <ShoppingBag className="h-[45%] w-[45%] text-[#f85606] stroke-[1.1]" />
                    </div>
                  </div>

                  <div className="absolute left-0 top-[17%] rounded-2xl border border-white/70 bg-white p-4 shadow-2xl shadow-black/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
                        <Sparkles className="h-5 w-5 text-[#f85606]" />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Our focus
                        </p>

                        <p className="mt-0.5 text-sm font-black text-gray-900">
                          Better shopping
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-[15%] right-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl shadow-black/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                        <Truck className="h-5 w-5 text-green-600" />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Service
                        </p>

                        <p className="mt-0.5 text-sm font-black text-gray-900">
                          Reliable delivery
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            INTRO
        ========================================================== */}
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f85606]">
              Who we are
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              A simpler way to discover products online.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-gray-500 sm:text-base sm:leading-8">
              Shopping should not feel complicated. VendorStore brings carefully
              selected products, competitive pricing, secure shopping, and
              reliable service together in one place. Our goal is to help
              customers spend less time searching and more time finding products
              that genuinely fit their needs.
            </p>
          </div>
        </section>

        {/* =========================================================
            WHAT WE OFFER
        ========================================================== */}
        <section className="bg-[#f7f7f5]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#f85606]">
                What we offer
              </p>

              <h2 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                Everything you need for a better shopping experience.
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-500">
                From product discovery to delivery, VendorStore is designed
                around the things that matter most to modern online shoppers.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#f85606]">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-6 text-sm font-black text-gray-950">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-gray-500">
                      {item.text}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            VALUES
        ========================================================== */}
        <section className="border-y border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#f85606]">
                  What matters to us
                </p>

                <h2 className="max-w-md text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                  Built around trust, value and simplicity.
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-gray-500">
                  We believe a strong online store is not only about having
                  products. It is about creating an experience customers can
                  understand, trust and return to.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {values.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.number}
                      className="group rounded-2xl border border-gray-200 bg-gray-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-black/5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#f85606]">
                          <Icon className="h-5 w-5" />
                        </div>

                        <span className="text-[10px] font-black tracking-widest text-gray-300">
                          {item.number}
                        </span>
                      </div>

                      <h3 className="mt-6 text-sm font-black text-gray-950">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-xs leading-6 text-gray-500">
                        {item.text}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SHOPPING EXPERIENCE
        ========================================================== */}
        <section className="bg-gray-950 text-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-orange-300">
                  The VendorStore experience
                </p>

                <h2 className="max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
                  Discover products without the unnecessary complexity.
                </h2>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
                  Browse our collection, explore categories, compare products,
                  and choose what works for you. We are continuously improving
                  the store to make online shopping faster, clearer, and more
                  enjoyable.
                </p>

                <Link
                  href="/products"
                  className="group mt-8 inline-flex h-13 items-center gap-3 rounded-xl bg-[#f85606] px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#ff6a22]"
                >
                  Start shopping
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="relative mx-auto flex h-64 w-64 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                <div className="absolute inset-6 rounded-full border border-white/10" />

                <div className="absolute inset-12 rounded-full bg-[#f85606]/10 blur-2xl" />

                <ShoppingBag className="relative h-24 w-24 text-[#f85606] stroke-[1]" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SEO CONTENT
        ========================================================== */}
        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-[#f85606]">
              About our online store
            </p>

            <h2 className="text-3xl font-black tracking-tight text-gray-950">
              Your online shopping destination
            </h2>

            <div className="mt-6 space-y-5 text-sm leading-7 text-gray-500 sm:text-base sm:leading-8">
              <p>
                VendorStore is an online store created to make product discovery
                and everyday shopping easier. Our collection is focused on
                bringing customers useful products, competitive prices, and a
                reliable shopping experience.
              </p>

              <p>
                Whether you are looking for everyday essentials or something new
                to add to your collection, you can browse our{" "}
                <Link
                  href="/products"
                  className="font-bold text-gray-900 underline decoration-[#f85606] underline-offset-4 transition hover:text-[#f85606]"
                >
                  products
                </Link>{" "}
                and explore available categories in one place.
              </p>

              <p>
                We believe online shopping should be convenient and transparent.
                That is why VendorStore focuses on clear product discovery,
                secure shopping, competitive value, and dependable service from
                browsing through delivery.
              </p>

              <p>
                As our store grows, we continue to improve the product selection
                and customer experience so that VendorStore can remain a
                dependable destination for online shoppers.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            CTA
        ========================================================== */}
        <section className="border-t border-gray-200 bg-[#f7f7f5]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[28px] border border-orange-100 bg-orange-50 px-6 py-14 text-center sm:px-10">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-200/30 blur-3xl" />

              <div className="relative z-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <ShoppingBag className="h-6 w-6 text-[#f85606]" />
                </div>

                <h2 className="mx-auto mt-7 max-w-2xl text-3xl font-black tracking-tight text-gray-950 sm:text-5xl">
                  Ready to discover something new?
                </h2>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-gray-500">
                  Explore VendorStore and find products selected for everyday
                  life.
                </p>

                <Link
                  href="/products"
                  className="mt-8 inline-flex h-13 items-center gap-3 rounded-xl bg-[#f85606] px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#df4d03]"
                >
                  Shop the collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
