"use client";

import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function CreateProjectPage() {
  const { token } = useAuthStore();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [teamSize, setTeamSize] = useState(4);
  const [milestones, setMilestones] = useState([{ title: '', status: 'pending' }]);

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: '', status: 'pending' }]);
  };

  const handleMilestoneChange = (index: number, value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index].title = value;
    setMilestones(newMilestones);
  };

  const handleSubmit = async () => {
    try {
      const requiredSkills = skillsStr.split(',').map(s => s.trim()).filter(s => s);
      const validMilestones = milestones.filter(m => m.title.trim() !== '');

      const payload = {
        title,
        description,
        requiredSkills,
        teamSize,
        milestones: validMilestones
      };

      await axios.post('http://localhost:5000/api/projects', payload, {
        headers: { 'x-auth-token': token }
      });
      
      toast.success('Project launched successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Error creating project');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <header className="mb-12">
        <span className="text-secondary font-bold tracking-[0.2em] text-xs uppercase mb-4 block">New Initiative</span>
        <h1 className="text-5xl md:text-6xl font-black font-lexend text-on-surface leading-[0.9] tracking-tighter mb-6 max-w-2xl">
          Create the future <span className="text-primary italic">together.</span>
        </h1>
        <p className="text-lg text-on-surface-variant font-medium max-w-xl leading-relaxed">
          Design your project framework, invite your collaborators, and set the rhythm for innovation.
        </p>
      </header>

      <div className="space-y-16">
        {/* Section 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <aside className="lg:col-span-1">
            <h3 className="text-xl font-bold font-lexend text-on-surface mb-2">The Foundation</h3>
            <p className="text-sm text-on-surface-variant font-medium">Define your project's identity and core mission.</p>
          </aside>
          <div className="lg:col-span-2 space-y-8 bg-surface-container-low p-8 rounded-xl shadow-sm">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-secondary">Project Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-surface-container-lowest border-none rounded-lg p-4 text-lg focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-surface-container-high font-medium" 
                placeholder="e.g. Sustainable Campus AI"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-secondary">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-surface-container-lowest border-none rounded-lg p-4 min-h-[180px] focus:ring-2 focus:ring-primary/20 text-on-surface leading-relaxed" 
                placeholder="Tell your story..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <aside className="lg:col-span-1">
            <h3 className="text-xl font-bold font-lexend text-on-surface mb-2">Talent Stack</h3>
            <p className="text-sm text-on-surface-variant font-medium">Who do you need on your dream team?</p>
          </aside>
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface-container p-8 rounded-xl space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-secondary">Required Skills (comma separated)</label>
                <input 
                  type="text" 
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20" 
                  placeholder="Python, UX Design, React"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-secondary block">Target Team Size: <span className="text-primary text-xl ml-2">{teamSize}</span></label>
                <div className="flex items-center gap-8">
                  <input 
                    type="range" 
                    min="2" max="12" 
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="flex-1 accent-primary h-2 bg-surface-container-highest rounded-full cursor-pointer" 
                  />
                </div>
                <p className="text-xs text-on-surface-variant italic">Optimal collaboration usually occurs with teams of 3-6.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <aside className="lg:col-span-1">
            <h3 className="text-xl font-bold font-lexend text-on-surface mb-2">Interactive Milestones</h3>
            <p className="text-sm text-on-surface-variant font-medium">Chart the journey with key phases and deadlines.</p>
          </aside>
          <div className="lg:col-span-2 space-y-6">
            {milestones.map((m, index) => (
              <div key={index} className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary-container text-surface-container-lowest rounded-full flex items-center justify-center font-bold text-lg">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  {index !== milestones.length - 1 && <div className="w-px h-full bg-surface-container-highest mt-2"></div>}
                </div>
                <div className="flex-1 bg-surface-container-low p-6 rounded-xl focus-within:bg-surface-container transition-colors">
                  <input 
                    type="text" 
                    value={m.title}
                    onChange={(e) => handleMilestoneChange(index, e.target.value)}
                    className="w-full bg-transparent border-none font-bold text-lg text-on-surface p-0 focus:ring-0 placeholder:text-surface-container-highest" 
                    placeholder="Milestone name..." 
                  />
                </div>
              </div>
            ))}
            
            <button onClick={handleAddMilestone} className="w-full py-4 border-2 border-dashed border-secondary rounded-xl text-secondary font-bold hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2">
              + Add Milestone
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-12 border-t border-surface-container-highest flex flex-col md:flex-row items-center justify-end gap-6 pb-20">
          <button onClick={handleSubmit} className="px-12 py-3 bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest font-black font-lexend rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            Launch Project
          </button>
        </div>
      </div>
    </div>
  );
}
