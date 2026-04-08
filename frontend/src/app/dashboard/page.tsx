"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import RecommendationsMarquee from '@/components/RecommendationsMarquee';

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      {/* Hero */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-secondary font-bold text-xs uppercase tracking-[0.2em] mb-4 block">Spring Semester</span>
            <h1 className="font-lexend text-5xl md:text-7xl font-extrabold text-on-surface leading-[0.9] tracking-tighter mb-6">
              Discover. <br/>
              <span className="text-primary-container">Collaborate.</span> <br/>
              Build.
            </h1>
            <p className="text-lg text-on-surface-variant font-medium leading-relaxed max-w-lg">
              Connect with fellow innovators across disciplines to bring ambitious university projects to life.
            </p>
          </div>
          <div>
            <Link href="/dashboard/projects/create">
              <button className="bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest px-8 py-4 rounded-full font-lexend font-bold text-lg shadow-sm shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-3">
                Start New Project
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Marquee Recommendations */}
      <RecommendationsMarquee />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <p className="text-on-surface-variant">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="col-span-full bg-surface-container-low p-8 rounded-xl text-center">
            <p className="text-on-surface-variant mb-4">No projects found. Be the first to start one!</p>
          </div>
        ) : (
          projects.map((project: any, i: number) => (
            <div key={project._id} className="bg-surface-container-low p-8 rounded-xl hover:bg-surface-container transition-colors group flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-lexend text-2xl font-bold text-on-surface group-hover:text-primary transition-colors">{project.title}</h3>
              </div>
              <p className="text-on-surface-variant mb-6 font-medium flex-grow line-clamp-3">{project.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {project.requiredSkills.slice(0, 3).map((skill: string) => (
                  <span key={skill} className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-black uppercase rounded-md tracking-wider">
                    {skill}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-surface-container-highest">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${project.teamMembers.length < project.teamSize ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
                    {project.teamSize - project.teamMembers.length} slots left
                  </span>
                </div>
                <Link href={`/dashboard/projects/${project._id}`} className="text-primary font-bold text-sm">
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
