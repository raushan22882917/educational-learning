'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import {
  HomeIcon,
  BookOpenIcon,
  ChartBarIcon,
  AcademicCapIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Learn', href: '/learn', icon: BookOpenIcon },
  { name: 'Quiz', href: '/quiz', icon: AcademicCapIcon },
  { name: 'Progress', href: '/progress', icon: ChartBarIcon },
  { name: 'Profile', href: '/profile', icon: UserCircleIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 bg-gradient-to-b from-blue-600 to-purple-700 dark:from-gray-900 dark:to-gray-800
          shadow-2xl
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">TUTOR</h1>
              <p className="text-xs text-white/70">AI Learning Platform</p>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="px-6 py-4 bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-semibold">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-white/60 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                    group relative overflow-hidden
                    ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r" />
                  )}

                  <item.icon
                    className={`
                      h-5 w-5 transition-transform duration-200
                      ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                    `}
                  />
                  <span className="font-medium">{item.name}</span>

                  {/* Hover effect */}
                  <div
                    className={`
                      absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
                      translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700
                      ${isActive ? 'hidden' : ''}
                    `}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="px-3 py-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="
                flex items-center gap-3 px-3 py-3 rounded-lg w-full
                text-white/80 hover:bg-red-500/20 hover:text-white
                transition-all duration-200 group
              "
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 text-center border-t border-white/10">
            <p className="text-xs text-white/50">© 2025 TUTOR</p>
          </div>
        </div>
      </aside>

      {/* Spacer for content */}
      <div className="lg:ml-64" />
    </>
  );
}
