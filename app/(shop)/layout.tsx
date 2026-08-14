import { Navbar } from "@/components/Navbar";
import {Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>{children}</main>

      <Footer />
    </>
  );
}
