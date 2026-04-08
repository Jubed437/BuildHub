"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function WorkspacePage() {
  const { id } = useParams();
  const { user, token } = useAuthStore();
  const router = useRouter();
  
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('');

  useEffect(() => {
    fetchWorkspace();
  }, [id]);

  const fetchWorkspace = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/projects/${id}/workspace`, {
        headers: { 'x-auth-token': token }
      });
      setWorkspace(res.data);
    } catch (err: any) {
      toast.error('Unable to load workspace');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApplication = async (appId: string, status: string) => {
    try {
      await axios.post(`http://localhost:5000/api/projects/${id}/applications/${appId}/status`, { status }, {
        headers: { 'x-auth-token': token }
      });
      toast.success(`Application ${status}`);
      fetchWorkspace();
    } catch (err: any) {
      toast.error('Error updating application');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    
    try {
      await axios.post(`http://localhost:5000/api/projects/${id}/tasks`, {
        title: newTaskTitle,
        tag: newTaskTag || 'GENERAL'
      }, {
        headers: { 'x-auth-token': token }
      });
      setNewTaskTitle('');
      setNewTaskTag('');
      fetchWorkspace();
      toast.success('Task added');
    } catch (err: any) {
      toast.error('Error creating task');
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await axios.put(`http://localhost:5000/api/projects/${id}/tasks/${taskId}`, { status }, {
        headers: { 'x-auth-token': token }
      });
      fetchWorkspace();
    } catch (err: any) {
      toast.error('Error updating task');
    }
  };

  if (loading) return <div className="p-12 text-center">Loading Workspace...</div>;
  if (!workspace) return null;

  const { project, tasks } = workspace;
  const isCreator = user?.id === project.creator._id;

  const todoTasks = tasks.filter((t: any) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t: any) => t.status === 'in-progress');
  const doneTasks = tasks.filter((t: any) => t.status === 'done');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Workspace Header */}
      <section className="p-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-secondary font-bold tracking-[0.1em] text-xs uppercase mb-2 block">
              {project.status} • Workspace
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-lexend text-on-surface tracking-tighter">
              {project.title}
            </h2>
            <p className="mt-2 text-on-surface-variant max-w-xl font-medium">
              Manage tasks, review applications, and track progress.
            </p>
          </div>
          
          <div className="flex items-center -space-x-3">
            <div className="w-12 h-12 rounded-full ring-4 ring-background bg-primary-fixed-dim text-primary flex items-center justify-center font-bold text-sm">
              {project.creator.name.charAt(0)}
            </div>
            {project.teamMembers.slice(0, 3).map((m: any) => (
              <div key={m._id} className="w-12 h-12 rounded-full ring-4 ring-background bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-sm">
                {m.user.name.charAt(0)}
              </div>
            ))}
            {project.teamMembers.length > 3 && (
              <div className="w-12 h-12 rounded-full ring-4 ring-background bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-sm">
                +{project.teamMembers.length - 3}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-8 p-8 flex-1">
        {/* Kanban Board */}
        <div className="xl:col-span-3 space-y-8">
          {/* New Task Form */}
          <div className="bg-surface-container-low p-6 rounded-xl flex items-center gap-4">
            <input 
              type="text" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 bg-surface-container-lowest border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <input 
              type="text" 
              value={newTaskTag}
              onChange={(e) => setNewTaskTag(e.target.value)}
              placeholder="Tag (e.g. DESIGN)"
              className="w-32 bg-surface-container-lowest border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <button onClick={handleCreateTask} className="bg-primary text-surface-container-lowest px-6 py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
              Add Task
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TODO */}
            <div className="flex flex-col gap-4">
              <h3 className="font-lexend font-bold text-on-surface flex items-center gap-2">
                To Do <span className="bg-surface-container-highest px-2 py-0.5 rounded text-xs">{todoTasks.length}</span>
              </h3>
              <div className="space-y-4">
                {todoTasks.map((task: any) => (
                  <div key={task._id} className="bg-surface-container-low p-6 rounded-xl hover:bg-surface-container transition-colors group">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-[10px] font-bold tracking-widest text-secondary px-2 py-1 bg-secondary-fixed rounded uppercase">{task.tag}</span>
                      <button onClick={() => updateTaskStatus(task._id, 'in-progress')} className="text-secondary hover:text-primary">
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                    <h4 className="font-bold text-lg mb-4 text-on-surface leading-snug">{task.title}</h4>
                    <div className="flex justify-end text-xs font-bold text-on-surface-variant">
                      {task.assignedTo?.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IN PROGRESS */}
            <div className="flex flex-col gap-4">
              <h3 className="font-lexend font-bold text-on-surface flex items-center gap-2">
                In Progress <span className="bg-primary-fixed-dim/30 text-primary px-2 py-0.5 rounded text-xs">{inProgressTasks.length}</span>
              </h3>
              <div className="space-y-4">
                {inProgressTasks.map((task: any) => (
                  <div key={task._id} className="bg-surface-container-low p-6 rounded-xl ring-2 ring-primary/20 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-[10px] font-bold tracking-widest text-primary px-2 py-1 bg-primary-fixed-dim/20 rounded uppercase">{task.tag}</span>
                      <div className="flex gap-2">
                        <button onClick={() => updateTaskStatus(task._id, 'todo')} className="text-stone-400 hover:text-secondary">
                          <span className="material-symbols-outlined text-sm">arrow_back</span>
                        </button>
                        <button onClick={() => updateTaskStatus(task._id, 'done')} className="text-stone-400 hover:text-green-600">
                          <span className="material-symbols-outlined text-sm">check</span>
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-lg mb-4 text-on-surface leading-snug">{task.title}</h4>
                    <div className="flex justify-end text-xs font-bold text-primary">
                      {task.assignedTo?.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DONE */}
            <div className="flex flex-col gap-4">
              <h3 className="font-lexend font-bold text-on-surface flex items-center gap-2">
                Done <span className="bg-surface-container-highest px-2 py-0.5 rounded text-xs">{doneTasks.length}</span>
              </h3>
              <div className="space-y-4 opacity-70">
                {doneTasks.map((task: any) => (
                  <div key={task._id} className="bg-surface-container-low p-6 rounded-xl grayscale hover:grayscale-0 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-[10px] font-bold tracking-widest text-stone-500 px-2 py-1 bg-surface-container-high rounded uppercase">{task.tag}</span>
                    </div>
                    <h4 className="font-bold text-lg mb-4 text-on-surface leading-snug line-through decoration-surface-container-highest">{task.title}</h4>
                    <div className="flex justify-end text-xs font-bold text-stone-500">
                      {task.assignedTo?.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Applications & Team Management */}
        {isCreator && (
          <div className="flex flex-col gap-6">
            <div className="bg-surface-container-low rounded-xl p-8">
              <h3 className="font-lexend font-bold text-xl mb-6">Applications</h3>
              
              {project.applications.filter((a:any) => a.status === 'pending').length === 0 ? (
                <p className="text-sm text-on-surface-variant">No pending applications.</p>
              ) : (
                <div className="space-y-4">
                  {project.applications.filter((a:any) => a.status === 'pending').map((app: any) => (
                    <div key={app._id} className="bg-surface p-4 rounded-lg border border-surface-container-highest shadow-sm">
                      <p className="font-bold text-sm text-on-surface">{app.user.name}</p>
                      <p className="text-xs text-on-surface-variant mb-3">{app.user.skills?.join(', ')}</p>
                      
                      <div className="flex gap-2">
                        <button onClick={() => handleApplication(app._id, 'accepted')} className="flex-1 bg-primary text-surface-container-lowest text-xs font-bold py-2 rounded mb-1 hover:opacity-90">
                          Accept
                        </button>
                        <button onClick={() => handleApplication(app._id, 'rejected')} className="flex-1 bg-surface-container-high text-on-surface text-xs font-bold py-2 rounded hover:bg-surface-container-highest">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
