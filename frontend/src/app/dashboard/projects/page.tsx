"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function MyProjectsPage() {
  const { user, token } = useAuthStore();
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && token) {
      fetchMyProjects();
    }
  }, [user, token]);

  const fetchMyProjects = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/profile/${user?.id}`, {
        headers: { 'x-auth-token': token }
      });
      setActiveProjects(res.data.activeProjects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-on-surface-variant">Loading Projects...</div>;

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <span className="text-secondary font-bold uppercase tracking-[0.2em] text-xs mb-4 block">WORKSPACE</span>
          <h1 className="text-5xl font-lexend font-black text-on-surface tracking-tighter">My Projects</h1>
        </div>
        <Link href="/dashboard/projects/create">
          <button className="bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            Start New Project
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeProjects.map((project: any) => (
          <div key={project._id} className="bg-surface-container p-8 rounded-xl hover:bg-surface-container-high transition-colors group flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed text-[10px] font-black uppercase tracking-widest rounded-full">
                {project.status}
              </span>
            </div>
            <h3 className="font-lexend text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
            <p className="text-sm text-on-surface-variant mb-6 flex-1">{project.description.slice(0, 100)}...</p>
            
            <div className="pt-6 border-t border-surface-container-highest flex justify-between items-center mt-auto">
              {project.creator._id === user?.id ? (
                <Link href={`/dashboard/projects/${project._id}/workspace`}>
                  <button className="text-sm font-bold text-primary hover:underline">Manage Workspace &rarr;</button>
                </Link>
              ) : (
                <Link href={`/dashboard/projects/${project._id}/workspace`}>
                  <button className="text-sm font-bold text-secondary hover:underline">Go to Workspace &rarr;</button>
                </Link>
              )}
            </div>
          </div>
        ))}
        {activeProjects.length === 0 && (
          <div className="col-span-full text-center py-20 bg-surface-container-lowest border border-surface-container-highest rounded-xl">
            <h3 className="text-xl font-lexend font-bold mb-2 text-on-surface">No Active Projects</h3>
            <p className="text-on-surface-variant mb-6">You aren't a part of any projects right now.</p>
            <Link href="/dashboard">
              <button className="bg-surface-container-high text-on-surface font-bold px-6 py-2 rounded-full hover:bg-surface-container-highest transition-colors">
                Discover Projects
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
