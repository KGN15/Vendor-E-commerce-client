import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
    Send,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact VendorStore | Get in Touch",
  description:
    "Contact VendorStore for questions about products, orders, delivery, shopping, or customer support. We are here to help.",
  keywords: [
    "Contact VendorStore",
    "VendorStore contact",
    "online store support",
    "customer support",
    "shopping support",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact VendorStore | Get in Touch",
    description:
      "Have a question about VendorStore? Get in touch with our team for help with products, orders, delivery, and shopping.",
    url: "/contact",
    siteName: "VendorStore",
    type: "website",
  },
};

const contactOptions = [
  {
    icon: Mail,
    title: "Email us",
    description: "For general questions and support.",
    value: "support@myvendorstore.com",
    href: "mailto:support@myvendorstore.com",
  },
  {
    icon: Phone,
    title: "Call us",
    description: "For urgent questions and order assistance.",
    value: "+880 1XXX-XXXXXX",
    href: "tel:+8801XXXXXXXXX",
  },
  {
    icon: MessageCircle,
    title: "Customer support",
    description: "Need help with an order or product?",
    value: "We're here to help",
    href: "/products",
  },
];

export default function ContactPage() {
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
            <div className="grid min-h-[500px] items-center gap-12 py-16 lg:grid-cols-[1fr_0.8fr] lg:py-20">
              <div className="max-w-3xl">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#f85606] shadow-sm backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f85606]" />
                  Contact VendorStore
                </div>

                <h1 className="max-w-4xl text-[48px] font-black leading-[0.94] tracking-[-0.055em] text-gray-950 sm:text-6xl lg:text-[78px]">
                  We&apos;re here
                  <br />
                  <span className="text-[#f85606]">to help.</span>
                </h1>

                <p className="mt-8 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg sm:leading-8">
                  Have a question about a product, an order, delivery, or
                  anything else? Get in touch with VendorStore and we&apos;ll do
                  our best to help.
                </p>
              </div>

              <div className="relative mx-auto flex h-[300px] w-[300px] items-center justify-center sm:h-[360px] sm:w-[360px]">
                <div className="absolute inset-0 rounded-full bg-[#f85606]" />

                <div className="absolute inset-[7%] rounded-full bg-[#ff7b39]" />

                <div className="absolute inset-0 rounded-full border border-gray-300/70" />

                <div className="absolute inset-[5%] rounded-full border border-white/50" />

                <div className="relative flex h-[55%] w-[55%] items-center justify-center rounded-[32px] bg-white shadow-[0_35px_90px_rgba(0,0,0,0.18)]">
                  <MessageCircle className="h-[45%] w-[45%] text-[#f85606] stroke-[1.15]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            CONTACT OPTIONS
        ========================================================== */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#f85606]">
                Get in touch
              </p>

              <h2 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                Choose the easiest way to reach us.
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-500">
                Whether you have a question before placing an order or need help
                after your purchase, we&apos;re ready to assist.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {contactOptions.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.title}
                    href={item.href}
                    className="group rounded-2xl border border-gray-200 bg-gray-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-black/5"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#f85606]">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h2 className="mt-6 text-sm font-black text-gray-950">
                      {item.title}
                    </h2>

                    <p className="mt-2 text-xs leading-6 text-gray-500">
                      {item.description}
                    </p>

                    <p className="mt-5 text-sm font-bold text-gray-900 transition group-hover:text-[#f85606]">
                      {item.value}
                    </p>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            CONTACT FORM
        ========================================================== */}
        <section className="border-y border-gray-200 bg-[#f7f7f5]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
              {/* Info */}
              <div>
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#f85606]">
                  Send us a message
                </p>

                <h2 className="max-w-md text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                  Have something to ask?
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-gray-500">
                  Fill out the form and tell us what you need help with. For
                  order-related questions, include your order information so we
                  can assist you faster.
                </p>

                <div className="mt-8 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Clock3 className="h-4 w-4 text-[#f85606]" />
                    </div>

                    <div>
                      <p className="text-sm font-black text-gray-900">
                        Support availability
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        We aim to respond to customer questions as quickly as
                        possible.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <ShieldCheck className="h-4 w-4 text-[#f85606]" />
                    </div>

                    <div>
                      <p className="text-sm font-black text-gray-900">
                        Customer focused
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Your questions and feedback help us improve the
                        VendorStore experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <form className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-xs font-black text-gray-800"
                      >
                        Your name
                      </label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-xs font-black text-gray-800"
                      >
                        Email address
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-2 block text-xs font-black text-gray-800"
                    >
                      Subject
                    </label>

                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="How can we help?"
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-xs font-black text-gray-800"
                    >
                      Message
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      placeholder="Tell us how we can help..."
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#f85606] focus:bg-white focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="group inline-flex h-13 w-full items-center justify-center gap-3 rounded-xl bg-gray-950 px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#f85606]"
                  >
                    Send message
                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            LOCATION / STORE INFO
        ========================================================== */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-[#f7f7f5] p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
                  <MapPin className="h-5 w-5 text-[#f85606]" />
                </div>

                <h2 className="mt-6 text-lg font-black text-gray-950">
                  VendorStore
                </h2>

                <p className="mt-2 max-w-md text-sm leading-7 text-gray-500">
                  An online shopping destination focused on quality products,
                  better value, and a simple customer experience.
                </p>
              </div>

              <div className="rounded-2xl bg-gray-950 p-7 text-white">
                <ShoppingBag className="h-7 w-7 text-[#f85606]" />

                <h2 className="mt-6 text-lg font-black">
                  Looking for something specific?
                </h2>

                <p className="mt-2 max-w-md text-sm leading-7 text-gray-400">
                  Browse our product collection and discover what&apos;s
                  currently available at VendorStore.
                </p>

                <Link
                  href="/products"
                  className="group mt-6 inline-flex items-center gap-2 text-sm font-black text-white transition hover:text-[#f85606]"
                >
                  Browse products
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            FINAL CTA
        ========================================================== */}
        <section className="border-t border-gray-200 bg-[#f7f7f5]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[28px] border border-orange-100 bg-orange-50 px-6 py-14 text-center sm:px-10">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-200/30 blur-3xl" />

              <div className="relative z-10">
                <h2 className="mx-auto max-w-2xl text-3xl font-black tracking-tight text-gray-950 sm:text-5xl">
                  Still have questions?
                </h2>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-gray-500">
                  We&apos;re always happy to help. Explore the store or get in
                  touch with VendorStore.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/products"
                    className="inline-flex h-13 items-center justify-center gap-3 rounded-xl bg-[#f85606] px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#df4d03]"
                  >
                    Shop the collection
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/about"
                    className="inline-flex h-13 items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-sm font-black text-gray-800 transition hover:bg-gray-50"
                  >
                    About VendorStore
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
