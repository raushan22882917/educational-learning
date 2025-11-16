'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  // Don't show nav on auth pages or home page
  if (!user || pathname.startsWith('/auth') || pathname === '/') {
    return null;
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/learn', label: 'Learn', icon: '📚' },
    { href: '/quiz', label: 'Quiz', icon: '✨' },
    { href: '/progress', label: 'Progress', icon: '📈' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                  'active:bg-gray-100 dark:active:bg-gray-800',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
              'active:bg-gray-100 dark:active:bg-gray-800',
              'text-gray-600 dark:text-gray-400'
            )}
          >
            <span className="text-xl">☰</span>
            <span className="text-xs font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 space-y-2">
              <div className="pb-3 mb-3 border-b border-gray-200 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full justify-start"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}
