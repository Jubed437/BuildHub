"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function WorkspacePage() {
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeUser, setActiveUser] = useState<any>(null);

  useEffect(() => {
    // Fetch user and their active projects
    Promise.all([
      axios.get('http://localhost:5000/api/users/me'),
      axios.get('http://localhost:5000/api/projects/my/active')
    ]).then(([meRes, projRes]) => {
      setActiveUser(meRes.data);
      setActiveProjects(projRes.data);
      if (projRes.data.length > 0) {
        selectProject(projRes.data[0]._id);
      } else {
        setLoading(false);
      }
    }).catch(console.error);
  }, []);

  const selectProject = async (id: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/projects/${id}/workspace`);
      setSelectedProject(res.data.project);
      setTasks(res.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedProject) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/projects/${selectedProject._id}/tasks`, {
        title: newTaskTitle,
        tag: 'Development'
      });
      setTasks([...tasks, res.data]);
      setNewTaskTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/projects/${selectedProject._id}/tasks/${taskId}`, { status });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMilestone = async (milestoneId: string) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/projects/${selectedProject._id}/milestones/${milestoneId}`);
      setSelectedProject({ ...selectedProject, milestones: res.data });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && activeProjects.length === 0) return <div className="p-12 text-on-surface-variant text-center">Loading Workspace...</div>;

  if (activeProjects.length === 0) {
    return (
      <div className="p-8 md:p-12 max-w-7xl mx-auto text-center h-[80vh] flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-surface-container-highest mb-6 block">workspaces</span>
        <h1 className="text-3xl font-lexend font-bold text-on-surface mb-4">No Active Projects</h1>
        <p className="text-on-surface-variant font-medium max-w-md">You haven't joined or created any projects yet. Go to the dashboard to find a project to collaborate on!</p>
      </div>
    );
  }

  const allMembers = selectedProject ? [
    { user: selectedProject.creator, role: 'Creator', projectScore: selectedProject.creator.contributions },
    ...selectedProject.teamMembers
  ] : [];

  return (
    <div className="p-6 md:p-10 lg:p-16 max-w-[1600px] mx-auto min-h-screen">
      
      {/* 1. Project Selector Tabs (Replaced Sidebar) */}
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-secondary font-bold uppercase tracking-[0.2em] text-xs mb-3 block">Your Active Workspace</span>
            <h1 className="font-lexend text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter leading-none mb-2">
              Select <span className="text-primary italic">Project.</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-2 -mx-6 px-6 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {activeProjects.map(proj => (
            <button
              key={proj._id}
              onClick={() => selectProject(proj._id)}
              className={`flex-shrink-0 px-8 py-4 rounded-full font-lexend font-bold text-sm transition-all border-2 flex items-center gap-3 ${
                selectedProject?._id === proj._id 
                  ? 'bg-primary text-surface-container-lowest border-primary shadow-lg shadow-primary/20 scale-105' 
                  : 'bg-surface-container-lowest border-surface-container text-on-surface hover:border-primary/40'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">folder_open</span>
              {proj.title}
            </button>
          ))}
        </div>
      </div>

      {selectedProject && (
        <div className="space-y-16">
          {/* 2. Top Header & Leaderboard */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-surface-container-lowest p-8 md:p-10 rounded-[2.5rem] border border-surface-container shadow-sm">
            <div>
              <span className="text-secondary font-black uppercase text-xs tracking-widest block mb-2">Project Overview</span>
              <h2 className="font-lexend text-4xl font-extrabold text-on-surface">{selectedProject.title}</h2>
              <p className="text-on-surface-variant font-medium mt-3 max-w-2xl">{selectedProject.description}</p>
            </div>

            <div className="w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <span className="text-secondary font-bold text-xs uppercase tracking-widest block mb-4 xl:mb-2">Team Leaderboard</span>
              <div className="flex items-center gap-4">
                {allMembers.map((member: any, i) => (
                  <Link href={`/dashboard/profile/${member.user._id}`} key={i} className="flex items-center gap-4 bg-surface-container-low p-3 pr-6 rounded-full min-w-max hover:bg-surface-container transition-colors border border-surface-container group">
                    <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden font-lexend font-black text-sm text-primary shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                      {member.user.avatar ? <img src={member.user.avatar} className="w-full h-full object-cover"/> : member.user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-on-surface leading-none">{member.user.name.split(' ')[0]}</span>
                      <span className="text-xs font-black text-primary mt-1">{member.projectScore || 0} pts</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Milestones Block */}
          {selectedProject.milestones.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-lexend font-bold text-2xl flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-3xl">emoji_events</span> Project Milestones
                </h3>
                <span className="text-sm font-bold text-primary bg-primary-fixed-dim/30 px-5 py-2 rounded-full">
                  {selectedProject.milestones.filter((m:any) => m.status === 'completed').length} / {selectedProject.milestones.length} Completed
                </span>
              </div>
              
              <div className="h-4 w-full bg-surface-container overflow-hidden rounded-full shadow-inner shadow-surface-container-highest">
                <div 
                   className="h-full bg-primary transition-all duration-700 ease-out" 
                   style={{ width: `${(selectedProject.milestones.filter((m:any) => m.status === 'completed').length / (selectedProject.milestones.length || 1)) * 100}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                {selectedProject.milestones.map((milestone: any, index: number) => (
                  <button 
                    key={milestone._id}
                    onClick={() => toggleMilestone(milestone._id)}
                    className={`text-left p-6 rounded-[2rem] border transition-all relative overflow-hidden group ${
                      milestone.status === 'completed' 
                        ? 'bg-primary/5 text-on-surface border-primary '
                        : 'bg-surface-container-lowest text-on-surface border-surface-container hover:border-primary/40'
                    }`}
                  >
                    {milestone.status === 'completed' && <div className="absolute top-0 right-0 w-16 h-16 bg-primary rounded-bl-full flex items-center justify-center p-3 pb-5 pl-5"><span className="material-symbols-outlined text-white font-bold">check</span></div>}
                    <span className="text-secondary font-black uppercase text-[10px] tracking-widest block mb-3">Phase {index + 1}</span>
                    <p className={`font-lexend font-bold text-lg mb-2 pr-6 ${milestone.status === 'completed' ? 'opacity-50 line-through' : ''}`}>{milestone.title}</p>
                    {milestone.status !== 'completed' && <div className="mt-8 text-xs font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0"><span className="material-symbols-outlined text-[14px]">check_circle</span> Mark Complete</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Kanban Tasks */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-lexend font-bold text-2xl flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">task_alt</span> Tasks Board
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {['todo', 'in-progress', 'done'].map(statusColumn => (
                <div key={statusColumn} className="bg-surface-container-low rounded-[2.5rem] p-8 flex flex-col h-full border border-surface-container min-h-[500px]">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-lexend font-bold text-sm uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-3">
                      <span className={`w-3.5 h-3.5 rounded-full ${statusColumn === 'todo' ? 'bg-red-500' : statusColumn === 'in-progress' ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                      {statusColumn.replace('-', ' ')}
                    </h3>
                    <span className="text-xs font-bold text-secondary bg-surface-container-highest px-4 py-1.5 rounded-full">
                      {tasks.filter(t => t.status === statusColumn).length} Items
                    </span>
                  </div>

                  <div className="flex-1 space-y-5">
                    {tasks.filter(t => t.status === statusColumn).map(task => (
                      <div key={task._id} className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-surface-container group hover:shadow-md hover:border-primary/20 transition-all">
                        <span className="text-[10px] font-black tracking-widest text-secondary uppercase mb-3 block">{task.tag || 'Task'}</span>
                        <p className="font-bold text-base md:text-lg text-on-surface mb-8 leading-snug">{task.title}</p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="w-10 h-10 rounded-full bg-surface-container-high text-sm flex items-center justify-center font-bold text-on-surface-variant shadow-inner" title={task.assignedTo?.name || 'Unassigned'}>
                            {task.assignedTo?.name?.charAt(0) || '?'}
                          </div>
                          
                          <div className="flex gap-2">
                            {statusColumn !== 'todo' && (
                              <button onClick={() => updateTaskStatus(task._id, 'todo')} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[16px]">keyboard_double_arrow_left</span></button>
                            )}
                            {statusColumn !== 'in-progress' && (
                              <button onClick={() => updateTaskStatus(task._id, 'in-progress')} className="w-10 h-10 rounded-full bg-primary-fixed-dim/30 flex items-center justify-center hover:bg-primary-fixed text-primary transition-colors"><span className="material-symbols-outlined text-[16px]">play_arrow</span></button>
                            )}
                            {statusColumn !== 'done' && (
                              <button onClick={() => updateTaskStatus(task._id, 'done')} className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 text-green-700 transition-colors"><span className="material-symbols-outlined text-[16px]">check</span></button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {statusColumn === 'todo' && (
                    <form onSubmit={handleCreateTask} className="mt-8 relative">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        placeholder="Type task and hit Enter..."
                        className="w-full bg-surface-container-lowest border border-surface-container rounded-full py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-medium shadow-sm transition-shadow"
                      />
                      <button type="submit" className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-primary text-surface-container-lowest flex items-center justify-center hover:scale-105 transition-transform"><span className="material-symbols-outlined text-[20px]">add</span></button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
