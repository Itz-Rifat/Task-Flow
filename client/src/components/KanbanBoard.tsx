'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { api } from '@/lib/api';
import { Task, TaskPriority, TaskStatus, User } from '@/types';
import TaskCard from './TaskCard';
import { Plus, Search, Filter, Circle, Clock, CheckCircle2, Loader2, X, Calendar as CalendarIcon, User as UserIcon, Check } from 'lucide-react';

interface KanbanBoardProps {
  projectId: string;
}

const COLUMNS: { id: TaskStatus; title: string; icon: any; color: string; bgHeader: string }[] = [
  {
    id: 'TODO',
    title: 'To Do',
    icon: Circle,
    color: 'text-indigo-400',
    bgHeader: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    icon: Clock,
    color: 'text-amber-400',
    bgHeader: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  },
  {
    id: 'DONE',
    title: 'Done',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgHeader: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  },
];

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State for Task Creation
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('TODO');
  const [taskDueDate, setTaskDueDate] = useState('');
  
  // Assignee Dropdown State
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<User | null>(null);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);

  const [modalError, setModalError] = useState('');

  const queryClient = useQueryClient();

  // Fetch users for assignment dropdown
  const { data: usersList = [] } = useQuery<User[]>({
    queryKey: ['users', assigneeSearch],
    queryFn: async () => {
      const res = await api.get('/users', { params: { search: assigneeSearch } });
      return res.data;
    },
    enabled: isTaskModalOpen,
  });

  // Fetch tasks with real-time query filtering
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', projectId, search, priorityFilter, statusFilter],
    queryFn: async () => {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get(`/projects/${projectId}/tasks`, { params });
      return res.data;
    },
  });

  // Task Update Mutation (Optimistic Update)
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: Partial<Task> }) => {
      const res = await api.patch(`/tasks/${taskId}`, data);
      return res.data;
    },
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId, search, priorityFilter, statusFilter] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', projectId, search, priorityFilter, statusFilter]);

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          ['tasks', projectId, search, priorityFilter, statusFilter],
          previousTasks.map((task) => (task.id === taskId ? { ...task, ...data } : task))
        );
      }

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId, search, priorityFilter, statusFilter], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: async (newTask: {
      title: string;
      description?: string;
      status: TaskStatus;
      priority: TaskPriority;
      assigned_to?: string | null;
      due_date?: string | null;
    }) => {
      const res = await api.post(`/projects/${projectId}/tasks`, newTask);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsTaskModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('MEDIUM');
      setTaskStatus('TODO');
      setTaskDueDate('');
      setSelectedAssignee(null);
      setAssigneeSearch('');
      setIsAssigneeDropdownOpen(false);
    },
    onError: (err: any) => {
      setModalError(err.response?.data?.error || 'Failed to create task');
    },
  });

  // Handle Drag End
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as TaskStatus;
    updateTaskMutation.mutate({
      taskId: draggableId,
      data: { status: newStatus },
    });
  };

  const handleStatusSelectChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskMutation.mutate({
      taskId,
      data: { status: newStatus },
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setModalError('');
    createTaskMutation.mutate({
      title: taskTitle,
      description: taskDesc,
      status: taskStatus,
      priority: taskPriority,
      assigned_to: selectedAssignee ? selectedAssignee.id : null,
      due_date: taskDueDate || null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              <option value="TODO" className="bg-slate-900">To Do</option>
              <option value="IN_PROGRESS" className="bg-slate-900">In Progress</option>
              <option value="DONE" className="bg-slate-900">Done</option>
            </select>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Priorities</option>
              <option value="HIGH" className="bg-slate-900 text-red-400">High</option>
              <option value="MEDIUM" className="bg-slate-900 text-amber-400">Medium</option>
              <option value="LOW" className="bg-slate-900 text-emerald-400">Low</option>
            </select>
          </div>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Drag & Drop Columns */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400">Syncing task columns...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {COLUMNS.map((column) => {
              const columnTasks = tasks.filter((t) => t.status === column.id);
              const IconComp = column.icon;

              return (
                <div
                  key={column.id}
                  className="glass-panel rounded-2xl p-4 border border-white/5 flex flex-col min-h-[500px]"
                >
                  {/* Column Header */}
                  <div className={`flex items-center justify-between p-3 rounded-xl border mb-4 ${column.bgHeader}`}>
                    <div className="flex items-center gap-2">
                      <IconComp className={`w-4 h-4 ${column.color}`} />
                      <h3 className="font-semibold text-sm tracking-wide text-white">{column.title}</h3>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-slate-900/60 text-xs font-bold flex items-center justify-center border border-white/10">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Droppable Task List */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-3 p-1 rounded-xl transition-colors ${
                          snapshot.isDraggingOver ? 'bg-indigo-500/5 ring-1 ring-indigo-500/20' : ''
                        }`}
                      >
                        {columnTasks.length > 0 ? (
                          columnTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`${snapshot.isDragging ? 'scale-102 shadow-2xl z-50' : ''}`}
                                >
                                  <TaskCard
                                    task={task}
                                    onDelete={(id) => deleteTaskMutation.mutate(id)}
                                    onStatusChange={handleStatusSelectChange}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <div className="h-32 border-2 border-dashed border-slate-800/80 rounded-xl flex items-center justify-center text-xs text-slate-500">
                            No tasks in {column.title}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Create Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/10 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Create Task</h2>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Build JWT auth middleware"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Task details and acceptance criteria..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Assignee Search & Dropdown Selection */}
              <div className="relative">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Assign To Person</label>
                <div
                  onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-indigo-400" />
                    {selectedAssignee ? (
                      <div>
                        <span className="font-semibold text-white">{selectedAssignee.name}</span>
                        <span className="text-slate-400 text-[11px] ml-2">({selectedAssignee.email})</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">Unassigned (Click to search user)</span>
                    )}
                  </div>
                  {selectedAssignee && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAssignee(null);
                      }}
                      className="p-1 text-slate-400 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown Menu */}
                {isAssigneeDropdownOpen && (
                  <div className="absolute z-50 mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl shadow-2xl p-2 animate-in fade-in duration-150">
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={assigneeSearch}
                        onChange={(e) => setAssigneeSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar bg-slate-950">
                      <div
                        onClick={() => {
                          setSelectedAssignee(null);
                          setIsAssigneeDropdownOpen(false);
                        }}
                        className="p-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer flex items-center justify-between"
                      >
                        <span>Unassigned</span>
                        {!selectedAssignee && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>

                      {usersList.length > 0 ? (
                        usersList.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => {
                              setSelectedAssignee(u);
                              setIsAssigneeDropdownOpen(false);
                            }}
                            className="p-2.5 rounded-lg text-xs hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors bg-slate-900/60 hover:bg-slate-800"
                          >
                            <p className="font-semibold text-white text-xs">{u.name}</p>
                            {selectedAssignee?.id === u.id && (
                              <Check className="w-3.5 h-3.5 text-indigo-400" />
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="p-2 text-xs text-slate-500 text-center">No users found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status, Priority, and Due Date Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Status Column</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Due Date (Optional)</label>
                <div className="relative">
                  <CalendarIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2"
                >
                  {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

