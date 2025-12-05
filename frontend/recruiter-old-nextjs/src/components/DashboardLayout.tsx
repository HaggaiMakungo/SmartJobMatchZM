'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Briefcase, Users, BarChart3, Settings, Bell, Menu, X, Sun, Moon, ChevronLeft, ChevronRight, FolderHeart, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { NotificationBell } from './NotificationBell';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Candidates', href: '/dashboard/candidates', icon: Users },
  { name: 'Talent Pools', href: '/dashboard/talent-pools', icon: FolderHeart },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    // Clear all auth tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('zedsafe_user');
    localStorage.removeItem('zedsafe_trust_device');
    
    // Clear cookies
    document.cookie = 'zedsafe_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Redirect to login
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-peach/5 dark:bg-gunmetal">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-gunmetal/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-gunmetal/95 border-r border-sage/10 transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        {/* Collapse toggle - desktop only */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-tangerine text-white rounded-full items-center justify-center hover:bg-tangerine/90 transition-colors z-10"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className="p-6 border-b border-sage/10">
            <div className="flex items-center gap-3">
              <img src="/ZedSafeLogo.png" alt="ZedSafe" className="w-10 h-10 rounded-lg" />
              {!sidebarCollapsed && <span className="font-bold text-lg text-gunmetal dark:text-peach">ZedSafe</span>}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-tangerine text-white shadow-md'
                      : 'text-gunmetal dark:text-sage hover:bg-sage/10'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.name : ''}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Profile section at bottom */}
          <div className="p-4 border-t border-sage/10 space-y-2">
            <div className={`flex items-center gap-3 p-3 rounded-lg bg-sage/5 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <img src="/ZedSafeLogo.png" alt="Company" className="w-10 h-10 rounded-lg" />
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gunmetal dark:text-peach truncate">ZedSafe</p>
                  <p className="text-xs text-sage truncate">Recruiter Account</p>
                </div>
              )}
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 ${sidebarCollapsed ? 'justify-center' : ''}`}
              title={sidebarCollapsed ? 'Logout' : ''}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gunmetal/95 border-b border-sage/10 backdrop-blur-sm">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            {/* Left: Mobile menu + Company logo + Tagline */}
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-gunmetal dark:text-peach hover:bg-sage/10 rounded-lg">
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center gap-3">
                <img src="/ZedSafeLogo.png" alt="ZedSafe" className="w-8 h-8 rounded-lg" />
                <div>
                  <span className="font-semibold text-gunmetal dark:text-peach">ZedSafe</span>
                  <p className="hidden md:block text-xs text-sage/80 dark:text-sage italic mt-0.5">The Play's the Thing Wherein We'll Catch Your Next King</p>
                </div>
              </div>
            </div>

            {/* Right: Notifications + Theme toggle */}
            <div className="flex items-center gap-2">
              <NotificationBell />
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 text-gunmetal dark:text-peach hover:bg-sage/10 rounded-lg transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
