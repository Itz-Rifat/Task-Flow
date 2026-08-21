'use client';

import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { LayoutDashboard, LogOut, CheckSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  return (
    <header className={`sticky top-0 z-40 w-full border-b border-white/10 glass-panel ${isAuthRoute ? 'auth-navbar' : 'app-navbar'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 flex items-center gap-1.5">
              TaskFlow <Sparkles className="w-3.5 h-3.5 text-amber-400 inline" />
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Kanban PM</span>
          </div>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800">
              <div className="w-7 h-7 rounded-full bg-indigo-600/80 text-white text-xs font-semibold flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-slate-200">{user.name}</span>
                <span className="text-[10px] text-slate-400">{user.email}</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
