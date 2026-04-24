"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import SkillBubbleSelector from '@/components/SkillBubbleSelector';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const login = useAuthStore(state => state.login);
  const updateUser = useAuthStore(state => state.updateUser);
  const authUser = useAuthStore(state => state.user);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/api/auth/signup', { name, email, password });
      login(res.data.user, res.data.token);
      setCreatedUserId(res.data.user?.id || null);
      setShowSkillsModal(true);
      toast.success('Account created successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Error signing up');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSkillsAndContinue = async () => {
    if (!createdUserId) {
      router.push('/dashboard');
      return;
    }

    setIsSavingSkills(true);
    try {
      const res = await api.put(`/api/users/profile/${createdUserId}`, { skills });
      if (authUser) {
        updateUser({ ...authUser, skills: res.data.skills || skills });
      }
      toast.success('Skills saved');
      setShowSkillsModal(false);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Could not save skills');
    } finally {
      setIsSavingSkills(false);
    }
  };

  const handleSkipSkills = () => {
    setShowSkillsModal(false);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest p-6">
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

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest rounded-full py-[1.2rem] px-[3.5rem] font-bold tracking-wide hover:opacity-90 transition-opacity mt-6 font-lexend"
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          
          <p className="mt-8 text-center text-on-surface font-sans">
            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>

      {showSkillsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-surface rounded-2xl border border-surface-container-high shadow-2xl p-6 md:p-8">
            <div className="mb-5">
              <h2 className="text-2xl font-lexend font-bold text-on-surface">One More Step: Pick Your Skills</h2>
              <p className="text-sm text-on-surface-variant mt-1">
                This helps us recommend better collaborators and projects. You can skip and update later.
              </p>
            </div>

            <SkillBubbleSelector
              selectedSkills={skills}
              onChange={setSkills}
              label="Skills"
              helperText="Select a few core skills now. You can always edit this later in profile."
              placeholder="Search skills or add your own"
            />

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleSkipSkills}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={handleSaveSkillsAndContinue}
                disabled={isSavingSkills}
                className="px-6 py-2.5 rounded-full text-sm font-bold text-surface-container-lowest bg-gradient-to-br from-primary to-primary-container disabled:opacity-70"
              >
                {isSavingSkills ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
