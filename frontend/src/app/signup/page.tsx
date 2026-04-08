"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const login = useAuthStore(state => state.login);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const skills = skillsStr.split(',').map(s => s.trim()).filter(s => s);
      const res = await axios.post('http://localhost:5000/api/auth/signup', { name, email, password, skills });
      login(res.data.user, res.data.token);
      toast.success('Account created successfully');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Error signing up');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest p-6">
      <Toaster />
      <div className="w-full max-w-lg bg-surface p-10 rounded-xl shadow-sm border border-surface-container-high relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed-dim rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
        
        <div className="relative z-10">
          <h1 className="text-display-lg font-lexend text-primary mb-2 tracking-tight">Join the Archive</h1>
          <p className="text-body-lg text-secondary mb-8">Create your profile and start collaborating on campus projects.</p>
          
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label className="text-label-md uppercase tracking-wider text-secondary font-bold block">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-surface-container-low focus:bg-surface-container-lowest rounded-DEFAULT px-4 py-3 outline-none focus:ring-1 focus:ring-primary/30 transition-all font-sans"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-label-md uppercase tracking-wider text-secondary font-bold block">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-container-low focus:bg-surface-container-lowest rounded-DEFAULT px-4 py-3 outline-none focus:ring-1 focus:ring-primary/30 transition-all font-sans"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-label-md uppercase tracking-wider text-secondary font-bold block">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface-container-low focus:bg-surface-container-lowest rounded-DEFAULT px-4 py-3 outline-none focus:ring-1 focus:ring-primary/30 transition-all font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="text-label-md uppercase tracking-wider text-secondary font-bold block">Your Skills (comma separated)</label>
              <input 
                type="text" 
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="React, Node.js, Design"
                className="w-full bg-surface-container-low focus:bg-surface-container-lowest rounded-DEFAULT px-4 py-3 outline-none focus:ring-1 focus:ring-primary/30 transition-all font-sans"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest rounded-full py-[1.2rem] px-[3.5rem] font-bold tracking-wide hover:opacity-90 transition-opacity mt-6 font-lexend"
            >
              Sign Up
            </button>
          </form>
          
          <p className="mt-8 text-center text-on-surface font-sans">
            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
