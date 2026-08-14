// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VendorStore - E-Commerce",
  description: "A modern MVP e-commerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body
        cz-shortcut-listen="true"
        className={`${inter.className} bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col`}
      >
        
        <main className="flex-1">{children}</main>
    
      </body>
    </html>
  );
}
