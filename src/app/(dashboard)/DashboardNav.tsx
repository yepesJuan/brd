'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import { Avatar } from '@/components/ui/Avatar';
import { RoleBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types';

interface DashboardNavProps {
  user: User;
}

export function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Nav */}
            <div className="flex items-center gap-8">
              <Link href="/requirements" className="text-xl font-bold text-gray-900">
                Greenlight
              </Link>
              <div className="hidden sm:flex items-center gap-4">
                <Link
                  href="/requirements"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Requirements
                </Link>
                {user.role === 'BUSINESS' && (
                  <Link
                    href="/requirements/new"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Upload New
                  </Link>
                )}
              </div>
            </div>

            {/* Desktop user menu */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar src={user.avatar_url} name={user.name} size="sm" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <RoleBadge role={user.role} size="sm" />
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>

            {/* Mobile hamburger button */}
            <button
              type="button"
              className="sm:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-out drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl">
            <div className="flex h-full flex-col">
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
                <span className="text-lg font-semibold text-gray-900">Menu</span>
                <button
                  type="button"
                  className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  onClick={closeMobileMenu}
                  aria-label="Close menu"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* User info */}
              <div className="border-b border-gray-200 px-4 py-4">
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatar_url} name={user.name} size="md" />
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <RoleBadge role={user.role} size="sm" />
                  </div>
                </div>
              </div>

              {/* Nav links */}
              <nav className="flex-1 px-4 py-4">
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/requirements"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={closeMobileMenu}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Requirements
                    </Link>
                  </li>
                  {user.role === 'BUSINESS' && (
                    <>
                      <li>
                        <Link
                          href="/requirements/new"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          onClick={closeMobileMenu}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Upload New
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/requirements/generate"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          onClick={closeMobileMenu}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          Generate with AI
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </nav>

              {/* Logout button */}
              <div className="border-t border-gray-200 px-4 py-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
