"use client";

import { Store, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <main className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-[#fafafa]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-200/30 blur-[100px]" />

        <div className="absolute inset-0 opacity-[0.025]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="relative"
        >
          {/* Glow */}
          <motion.div
            animate={{
              scale: [1, 1.18, 1],
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-[22px] bg-[#f85606] blur-2xl"
          />

          {/* Logo box */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#f85606] shadow-2xl shadow-orange-500/25">
            <Store className="h-10 w-10 text-white" strokeWidth={1.8} />
          </div>
        </motion.div>

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.15,
          }}
          className="mt-6"
        >
          <h1 className="text-center text-2xl font-black tracking-[-0.04em] text-gray-950">
            Vendor<span className="text-[#f85606]">Store</span>
          </h1>

          <p className="mt-1 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
            Everything you need
          </p>
        </motion.div>

        {/* Loader */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-col items-center"
        >
          <div className="relative flex h-10 w-10 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-[3px] border-orange-100" />

            <Loader2 className="h-5 w-5 animate-spin text-[#f85606]" />
          </div>

          <p className="mt-4 text-xs font-semibold text-gray-500">
            Preparing your experience
          </p>

          {/* Loading line */}
          <div className="mt-4 h-1 w-40 overflow-hidden rounded-full bg-gray-100">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-full w-1/2 rounded-full bg-[#f85606]"
            />
          </div>
        </motion.div>

        {/* Bottom text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-[10px] font-medium text-gray-300"
        >
          Quality products · Better prices
        </motion.p>
      </div>
    </main>
  );
}