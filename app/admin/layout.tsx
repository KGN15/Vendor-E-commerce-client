"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Warehouse,
  Users,
  Star,
  BarChart3,
  Store,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useStore } from "@/lib/store";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: Warehouse,
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Reviews",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { user } = useStore();

  const [mounted, setMounted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token =
      localStorage.getItem("vendorstore_token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (user && user.role !== "ADMIN") {
      router.replace("/");
      return;
    }

    setChecking(false);
  }, [mounted, user, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("vendorstore_token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");

    router.replace("/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  if (!mounted || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f85606]">
            <Store className="h-5 w-5 text-white" />
          </div>

          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-[#f85606]" />

          <p className="text-xs font-medium text-gray-500">
            Checking admin access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-gray-900">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f85606] shadow-sm">
              <Store className="h-[19px] w-[19px] text-white" />
            </div>

            <div>
              <p className="text-base font-extrabold tracking-tight text-gray-900">
                Vendor<span className="text-[#f85606]">Store</span>
              </p>

              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                Admin CMS
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Management
          </p>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-all ${
                    active
                      ? "bg-orange-50 text-[#f85606]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      active
                        ? "text-[#f85606]"
                        : "text-gray-400 group-hover:text-gray-700"
                    }`}
                  />

                  <span className="flex-1">{item.label}</span>

                  {active && (
                    <ChevronRight className="h-3.5 w-3.5 text-[#f85606]" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="shrink-0 border-t border-gray-100 p-3">
          {/* Store */}
          <Link
            href="/"
            className="mb-1 flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <Store className="h-[18px] w-[18px] text-gray-400" />
            View Store
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className=" lg:pl-64">
        {/* Header */}
        <header className=" sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-sm font-extrabold text-gray-900">
                Admin Panel
              </p>

              <p className="hidden text-[11px] text-gray-400 sm:block">
                Manage your store
              </p>
            </div>
          </div>

          {/* Admin User */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-gray-800">
                {user?.name || "Administrator"}
              </p>

              <p className="text-[10px] text-gray-400">
                {user?.email || "Admin"}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-xs font-extrabold text-[#f85606]">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="m-10 min-h-[calc(100vh-64px)]">{children}</main>
        <footer className="w-full h-8 bg-amber-50">

        </footer>
      </div>
    </div>
  );
}
