'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import KanbanBoard from '@/components/KanbanBoard';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Project } from '@/types';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, FolderKanban, Loader2 } from 'lucide-react';

export default function ProjectBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.id;

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data;
    },
    enabled: !!user,
  });

  const project = projects.find((p) => p.id === projectId);

  if (isAuthLoading || isProjectsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading project board...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {project ? project.title : 'Project Board'}
                </h1>
                {project?.description && (
                  <p className="text-xs text-slate-400 mt-1">{project.description}</p>
                )}
              </div>
            </div>

            {project?.created_at && (
              <span className="text-xs text-slate-500 flex items-center gap-1.5 self-start sm:self-auto">
                <Calendar className="w-3.5 h-3.5" />
                Created {new Date(project.created_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Client Kanban Board */}
        <KanbanBoard projectId={projectId} isOwner={project ? project.owner_id === user.id : true} />
      </main>
    </div>
  );
}
