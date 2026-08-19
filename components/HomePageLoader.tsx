"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function HomePageLoader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let startTime: number | null = null;
    let frame: number;
    let timeout: ReturnType<typeof setTimeout>;

    const duration = 700;

    const animate = (time: number) => {
      if (!startTime) startTime = time;

      const elapsed = time - startTime;
      const percentage = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - percentage, 3);

      setProgress(Math.floor(eased * 100));

      if (percentage < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setProgress(100);

        timeout = setTimeout(() => {
          setVisible(false);
        }, 150);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 0 }}
          exit={{
            y: "-100%",
            transition: {
              duration: 0.9,
              ease: [0.65, 0, 0.35, 1],
            },
          }}
          className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-white"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-100/40 blur-[110px]" />

          <div className="relative w-[300px] sm:w-[360px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 text-center"
            >
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
                Vendor
                <span className="text-[#f85606]">Store</span>
              </p>
            </motion.div>

            <div className="text-center">
              <motion.span className="inline-block text-[78px] font-black leading-none tracking-[-0.07em] text-gray-950 sm:text-[96px]">
                {progress}
                <span className="ml-1 text-[#f85606]">%</span>
              </motion.span>
            </div>

            <div className="mt-10">
              <div className="relative h-[2px] w-full overflow-hidden bg-gray-100">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-[#f85606]"
                  animate={{ width: `${progress}%` }}
                  transition={{
                    duration: 0.04,
                    ease: "linear",
                  }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-gray-300">
                  Loading
                </span>

                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400">
                  {progress === 100 ? "Ready" : "Please wait"}
                </span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-300">
              Quality products · Better prices
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
