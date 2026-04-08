"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { user, token } = useAuthStore();
  const router = useRouter();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/projects/${id}`);
      setProject(res.data);
      
      if (user) {
        const applied = res.data.applications.some((app: any) => app.user._id === user.id);
        const member = res.data.teamMembers.some((member: any) => member.user._id === user.id);
        setHasApplied(applied || member || res.data.creator._id === user.id);
      }
    } catch (err: any) {
      toast.error('Project not found');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      await axios.post(`http://localhost:5000/api/projects/${id}/apply`, {}, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Successfully applied to project!');
      setHasApplied(true);
      fetchProject(); // Refresh status
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Error applying to project');
    }
  };

  if (loading) return <div className="p-12 text-center text-on-surface-variant">Loading...</div>;
  if (!project) return null;

  const isCreator = user?.id === project.creator._id;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-secondary font-medium hover:gap-3 transition-all w-fit">
          <span className="font-sans text-sm tracking-widest">&larr; Back to Directory</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface-container-high text-on-surface rounded-full text-xs font-bold uppercase tracking-tighter">
            <span className={`w-2 h-2 rounded-full ${project.status === 'open' ? 'bg-green-500 animate-pulse' : 'bg-primary'}`}></span>
            {project.status === 'open' ? 'Now Recruiting' : project.status}
          </div>
          <h1 className="font-lexend text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] text-on-surface">
            {project.title.split(' ')[0]} <span className="text-primary italic">{project.title.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-xl leading-relaxed">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            {!isCreator && !hasApplied && project.status === 'open' && (
              <button onClick={handleApply} className="bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest px-8 py-4 rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95 flex items-center gap-3">
                Apply to Join Team
              </button>
            )}
            {hasApplied && !isCreator && (
              <button disabled className="bg-surface-container-high text-on-surface-variant px-8 py-4 rounded-full font-bold cursor-not-allowed">
                Application Submitted
              </button>
            )}
            {isCreator && (
              <Link href={`/dashboard/projects/${id}/workspace`}>
                <button className="bg-surface-container-high text-on-surface px-8 py-4 rounded-full font-bold hover:bg-surface-container-highest transition-colors">
                  Go to Workspace
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface p-10 rounded-xl border border-surface-container-highest">
            <h2 className="font-lexend text-2xl font-bold tracking-tight mb-8">Required Expertise</h2>
            <div className="flex flex-wrap gap-3">
              {project.requiredSkills.map((skill: string) => (
                <div key={skill} className="flex items-center gap-2 bg-surface-container-high px-5 py-2.5 rounded-full">
                  <span className="font-medium text-sm text-primary">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Team */}
        <div className="space-y-6">
          <div className="bg-surface-container p-8 rounded-xl">
            <h2 className="font-lexend text-2xl font-bold tracking-tight mb-6">Core Team</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-fixed-dim flex justify-center items-center text-primary font-bold">
                  {project.creator.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">{project.creator.name}</h4>
                  <p className="text-sm text-on-surface-variant">Project Creator</p>
                </div>
              </div>
              {project.teamMembers.map((member: any) => (
                <div key={member.user._id} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high flex justify-center items-center text-on-surface font-bold">
                    {member.user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">{member.user.name}</h4>
                    <p className="text-sm text-secondary">{member.role || 'Member'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-primary-fixed-dim/30 p-8 rounded-xl">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase text-primary font-black tracking-[0.2em] mb-1">Target Team Size</p>
                <p className="font-lexend text-xl font-bold text-primary">{project.teamSize} Members</p>
              </div>
              <div>
                <p className="text-xs uppercase text-primary font-black tracking-[0.2em] mb-1">Available Slots</p>
                <p className="font-lexend text-xl font-bold text-secondary">{project.teamSize - project.teamMembers.length} Slots</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Timeline */}
      {project.milestones && project.milestones.length > 0 && (
        <section className="mt-16 mb-16">
          <h2 className="font-lexend text-2xl font-bold tracking-tight mb-8">Project Milestones</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {project.milestones.map((milestone: any, index: number) => (
              <div key={milestone._id} className="relative bg-surface p-6 rounded-xl border border-surface-container-highest shadow-sm">
                <div className="w-10 h-10 bg-primary-container text-surface-container-lowest rounded-full flex items-center justify-center font-bold mb-4">
                  {index + 1}
                </div>
                <p className="text-xs text-secondary font-bold uppercase tracking-widest mb-2">Phase {index + 1}</p>
                <h4 className="font-bold text-lg mb-2">{milestone.title}</h4>
                <div className={`mt-4 flex items-center gap-2 text-xs font-bold ${milestone.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                  {milestone.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
