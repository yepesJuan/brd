'use client';

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

  const handleLogout = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Nav */}
          <div className="flex items-center gap-8">
            <Link href="/requirements" className="text-xl font-bold text-gray-900">
              BRD Sign-Off
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

          {/* User menu */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
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
        </div>
      </div>
    </nav>
  );
}
