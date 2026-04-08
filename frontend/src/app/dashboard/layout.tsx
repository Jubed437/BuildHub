"use client";

import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [activeUser, setActiveUser] = useState<any>(null);

  useEffect(() => {
    // Fetch the mocked active user (since auth is disabled)
    axios.get('http://localhost:5000/api/users/me')
      .then(res => setActiveUser(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="bg-background font-sans text-on-surface min-h-screen flex">
      {/* Sidebar */}
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest font-lexend font-medium text-base p-4 gap-2 z-50 shadow-sm border-r border-surface-container">
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
          <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 ease-in-out ${pathname === '/dashboard' ? 'bg-primary-fixed-dim/30 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/workspace" className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 ease-in-out ${pathname.includes('/workspace') ? 'bg-primary-fixed-dim/30 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
            <span className="material-symbols-outlined">workspaces</span>
            <span>Workspace</span>
          </Link>
          <Link href="/dashboard/find" className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 ease-in-out ${pathname === '/dashboard/find' ? 'bg-primary-fixed-dim/30 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
            <span className="material-symbols-outlined">person_search</span>
            <span>Find People</span>
          </Link>
          <Link href="/dashboard/projects" className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 ease-in-out ${pathname.includes('/projects') ? 'bg-primary-fixed-dim/30 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
            <span className="material-symbols-outlined">folder_shared</span>
            <span>My Projects</span>
          </Link>
          <Link href="/dashboard/leaderboard" className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 ease-in-out ${pathname === '/dashboard/leaderboard' ? 'bg-primary-fixed-dim/30 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
            <span className="material-symbols-outlined">leaderboard</span>
            <span>Scoreboard</span>
          </Link>
          <Link href={`/dashboard/profile/${activeUser?._id || ''}`} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 ease-in-out ${pathname.includes('/profile') ? 'bg-primary-fixed-dim/30 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
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
      <main className="md:ml-64 flex-1 min-w-0 w-full md:w-[calc(100%-16rem)] min-h-screen overflow-x-hidden">
        {/* Top App Bar */}
        <header className="w-full h-16 sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-surface-container flex items-center justify-end px-6">
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="h-8 w-[1px] bg-surface-container-high mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="flex flex-col text-right">
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
