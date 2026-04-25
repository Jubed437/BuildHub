"use client";

import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token, logout, updateUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [activeUser, setActiveUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);

    const validateSession = async () => {
      if (!token) {
        router.replace('/login');
        setIsCheckingAuth(false);
        return;
      }

      try {
        const res = await api.get('/api/auth/me');
        setActiveUser(res.data);
        updateUser({
          id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          skills: res.data.skills || [],
        });
      } catch (error) {
        console.error(error);
        logout();
        router.replace('/login');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    validateSession();
  }, [token, router, logout, updateUser]);

  if (isCheckingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-on-surface-variant">Checking session...</div>;
  }

  const navLinkClass = (isActive: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 ease-in-out ${isActive ? 'bg-primary-fixed-dim/30 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`;

  return (
    <div className="bg-background font-sans text-on-surface min-h-screen flex">
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <nav className={`fixed inset-y-0 left-0 z-50 flex flex-col w-72 max-w-[85vw] bg-surface-container-lowest font-lexend font-medium text-base p-4 gap-2 shadow-xl border-r border-surface-container transform transition-transform duration-300 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="mb-8 px-4 flex items-center gap-3 mt-4">
          <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center text-surface-container-lowest">
            <span className="font-bold text-xl">C</span>
          </div>
          <div>
            <h2 className="font-black text-primary leading-tight">Project Hub</h2>
            <p className="text-xs text-secondary">Campus Engine</p>
          </div>
        </div>

        <div className="space-y-1">
          <Link href="/dashboard" className={navLinkClass(pathname === '/dashboard')}>
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/workspace" className={navLinkClass(pathname.includes('/workspace'))}>
            <span className="material-symbols-outlined">workspaces</span>
            <span>Workspace</span>
          </Link>
          <Link href="/dashboard/find" className={navLinkClass(pathname === '/dashboard/find')}>
            <span className="material-symbols-outlined">person_search</span>
            <span>Find People</span>
          </Link>
          <Link href="/dashboard/projects" className={navLinkClass(pathname.includes('/projects'))}>
            <span className="material-symbols-outlined">folder_shared</span>
            <span>My Projects</span>
          </Link>
          <Link href="/dashboard/leaderboard" className={navLinkClass(pathname === '/dashboard/leaderboard')}>
            <span className="material-symbols-outlined">leaderboard</span>
            <span>Scoreboard</span>
          </Link>
          <Link href={`/dashboard/profile/${activeUser?._id || ''}`} className={navLinkClass(pathname.includes('/profile'))}>
            <span className="material-symbols-outlined">person</span>
            <span>Profile</span>
          </Link>
        </div>
        
        <div className="mt-auto px-4 py-3">
          <button onClick={() => { logout(); router.push('/login'); }} className="text-sm font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors">
            Log Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 min-w-0 w-full md:ml-72 md:w-[calc(100%-18rem)] min-h-screen overflow-x-hidden">
        {/* Top App Bar */}
        <header className="w-full h-16 sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-surface-container flex items-center justify-between md:justify-end px-4 sm:px-6">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low border border-surface-container-high text-on-surface"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <NotificationBell />
            <div className="h-8 w-[1px] bg-surface-container-high mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-lexend font-semibold text-primary">{activeUser?.name ?? 'Guest'}</span>
                <span className="text-xs text-secondary">{activeUser?.skills?.slice(0, 2).join(', ') ?? 'Browsing'}</span>
              </div>
              <div className="w-9 h-9 border border-primary/20 rounded-full bg-primary-fixed-dim flex items-center justify-center font-bold text-primary overflow-hidden">
                {activeUser?.avatar ? <img src={activeUser.avatar} className="w-full h-full object-cover" /> : (activeUser?.name?.charAt(0) ?? 'G')}
              </div>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
