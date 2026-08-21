'use client';

import React from 'react';
import { TaskPriority, TaskStatus } from '@/types';
import { Clock, AlertCircle, ArrowUpRight, CheckCircle2, User as UserIcon, Trash2 } from 'lucide-react';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string | null;
    assignee?: { name: string; email: string } | null;
  };
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, newStatus: TaskStatus) => void;
}

export default function TaskCard({ task, onDelete, onStatusChange }: TaskCardProps) {
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-semibold tracking-wide uppercase flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold tracking-wide uppercase flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Medium
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold tracking-wide uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Low
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="glass-card rounded-xl p-4 border border-white/5 hover:border-indigo-500/30 transition-all duration-200 shadow-lg group relative">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-white leading-snug group-hover:text-indigo-300 transition-colors">
          {task.title}
        </h4>
        <div className="flex items-center gap-1 shrink-0">
          {getPriorityBadge(task.priority)}
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed font-normal">
          {task.description}
        </p>
      )}

      {/* Quick column movement select fallback for accessibility */}
      {onStatusChange && (
        <div className="mb-3">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
            className="w-full text-[11px] bg-slate-900/90 text-slate-300 border border-slate-800 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
          >
            <option value="TODO">Move to: TODO</option>
            <option value="IN_PROGRESS">Move to: IN PROGRESS</option>
            <option value="DONE">Move to: DONE</option>
          </select>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-[10px]">
            {task.assignee ? task.assignee.name.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3 text-slate-400" />}
          </div>
          <span className="truncate max-w-[100px]">{task.assignee?.name || 'Unassigned'}</span>
        </div>

        {task.due_date && (
          <span className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3 h-3" />
            {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}
