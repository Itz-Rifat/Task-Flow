'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import ProjectsList from '@/components/ProjectsList';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) return null;

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <div className="min-h-screen purple-app-bg flex flex-col selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectsList />
      </main>
    </div>
  );
}
