"use client";

import Link from "next/link";
import { AdminProvider, AdminGuard, useAdmin } from "@/components/AdminAuth";

function AdminHeader() {
  const { logout } = useAdmin();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-xl font-bold text-gray-900">
              Book Club Admin
            </Link>
            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Events
              </Link>
              <Link
                href="/admin/new"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Create Event
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminGuard>
        <div className="min-h-screen bg-gray-50">
          <AdminHeader />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </AdminGuard>
    </AdminProvider>
  );
}
