'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  UserIcon, 
  HeartIcon, 
  QrCodeIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon 
} from '@heroicons/react/24/solid';

interface OwnerLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: UserIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Medical Info', href: '/medical', icon: HeartIcon },
  { name: 'Tags', href: '/tags', icon: QrCodeIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    // TODO: Load user data from API/context
    // For now, mock user data
    setUser({
      name: 'John Doe',
      email: 'john@example.com',
      avatar: null
    });
  }, []);

  const logout = () => {
    // TODO: Implement logout
    localStorage.removeItem('access_token');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'fixed inset-0 z-40' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <SidebarContent navigation={navigation} pathname={pathname} user={user} logout={logout} />
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <SidebarContent navigation={navigation} pathname={pathname} user={user} logout={logout} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="lg:hidden">
          <div className="flex items-center justify-between bg-white px-4 py-2 border-b border-gray-200">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <HeartSolidIcon className="h-6 w-6 text-red-500" />
              <span className="text-lg font-semibold text-gray-900">Vital Tags</span>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ 
  navigation, 
  pathname, 
  user, 
  logout 
}: { 
  navigation: any[], 
  pathname: string, 
  user: any, 
  logout: () => void 
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <HeartSolidIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Vital Tags</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-red-100 text-red-900 border-r-2 border-red-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 flex-shrink-0 h-5 w-5 ${
                  isActive ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="flex-shrink-0 flex bg-gray-50 p-4">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div>
              <div className="inline-block h-9 w-9 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {user?.name || 'User'}
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
        <div className="flex items-start space-x-2">
          <ShieldCheckIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            Your data is encrypted and only shared according to your privacy settings.
          </p>
        </div>
      </div>
    </>
  );
}