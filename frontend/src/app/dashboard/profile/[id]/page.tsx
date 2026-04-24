"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const { id } = useParams();
  const profileId = Array.isArray(id) ? id[0] : id;
  const { user: authUser } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState<any>(null);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', skills: '', github: '', linkedin: '', portfolio: '', avatar: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    // Fetch both the viewed profile and the logged-in user at the same time
    Promise.all([
      api.get(`/api/users/profile/${profileId}`),
      api.get('/api/users/me')
    ]).then(([profileRes, meRes]) => {
      setProfileData(profileRes.data);
      setActiveUser(meRes.data);
      const user = profileRes.data.user;
      setEditForm({
        bio: user.bio || '',
        skills: user.skills ? user.skills.join(', ') : '',
        github: user.links?.github || '',
        linkedin: user.links?.linkedin || '',
        portfolio: user.links?.portfolio || '',
        avatar: user.avatar || ''
      });
    }).catch((err) => {
      console.error(err);
      toast.error('Unable to load profile');
    }).finally(() => setLoading(false));
  }, [profileId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast.error('Image must be under 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;

    setSaving(true);
    try {
      const links = { github: editForm.github, linkedin: editForm.linkedin, portfolio: editForm.portfolio };
      const res = await api.put(`/api/users/profile/${profileId}`, {
        bio: editForm.bio,
        skills: editForm.skills,
        links,
        avatar: editForm.avatar
      });
      setProfileData({ ...profileData, user: res.data });
      setIsEditing(false);
      toast.success('Profile updated');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.msg || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-on-surface-variant">Loading Profile...</div>;
  if (!profileData) return <div className="p-12 text-center">Profile not found.</div>;

  const { user, activeProjects } = profileData;
  const activeUserId = activeUser?._id?.toString() || activeUser?.id || authUser?.id;
  const canEditProfile = !!activeUserId && activeUserId.toString() === user._id.toString();

  return (
    <div className="flex-1 p-6 md:p-12 max-w-7xl mx-auto overflow-x-hidden">
      {/* Hero Header Section */}
      <div className="grid grid-cols-12 gap-8 mb-16 items-center">
        <div className="col-span-12 lg:col-span-8">
          <span className="text-secondary font-bold uppercase tracking-[0.2em] text-sm mb-4 block">Contributor Profile</span>
          <h1 className="font-lexend text-5xl md:text-7xl font-extrabold text-on-surface leading-tight tracking-tight mb-6">
            {user.name}
          </h1>
          <p className="text-xl text-on-surface-variant max-w-xl leading-relaxed mb-6">
            {user.bio ? user.bio : `Campus collaborator with expertise in ${user.skills?.join(', ') || 'various domains'}. Role: ${user.role === 'admin' ? 'Administrator' : 'Student Contributor'}.`}
          </p>

          {/* Social Links */}
          <div className="flex gap-4 mb-8">
            {user.links?.github && (
              <a href={user.links.github} target="_blank" className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined text-[20px] text-on-surface">code</span>
              </a>
            )}
            {user.links?.linkedin && (
              <a href={user.links.linkedin} target="_blank" className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined text-[20px] text-on-surface">work</span>
              </a>
            )}
            {user.links?.portfolio && (
              <a href={user.links.portfolio} target="_blank" className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined text-[20px] text-on-surface">language</span>
              </a>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {!canEditProfile && (
              <button className="bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest px-8 py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                Collaborate
              </button>
            )}
            {canEditProfile && (
              <button onClick={() => setIsEditing(true)} className="bg-surface-container-high text-on-surface px-8 py-3.5 rounded-full font-bold hover:bg-surface-container-highest transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">edit</span> Edit Profile
              </button>
            )}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 flex flex-col justify-center relative">
          <div className="absolute -top-6 -left-6 bg-surface-container-lowest p-6 rounded-lg shadow-xl z-10 border border-surface-container-highest">
            <span className="text-secondary uppercase text-[10px] tracking-widest font-bold">Contribution Score</span>
            <div className="text-4xl font-lexend font-black text-primary mt-1">{user.contributions || 0}</div>
          </div>
          <div className="rounded-xl overflow-hidden aspect-[4/5] bg-surface-container-high shadow-2xl rotate-2 flex items-center justify-center text-8xl font-black text-on-surface-variant bg-gradient-to-br from-primary/10 to-primary-container/20">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid - Skills & Projects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {/* Skills Section */}
        <div className="md:col-span-1 bg-surface-container-low p-8 rounded-xl h-fit">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-lexend text-2xl font-bold tracking-tight">Expertise</h2>
            <span className="material-symbols-outlined text-primary">verified</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.skills && user.skills.length > 0 ? (
              user.skills.map((skill: string) => (
                <span key={skill} className="px-4 py-2 bg-surface-container text-on-surface text-sm font-medium rounded-full border border-surface-container-highest">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-sm text-on-surface-variant">No skills listed</span>
            )}
          </div>
        </div>

        {/* Active Projects Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-lexend text-2xl font-bold tracking-tight">Active Projects</h2>
          </div>
          {activeProjects.map((project: any) => (
            <div key={project._id} className="bg-surface-container p-6 rounded-xl hover:bg-surface-container-high transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-lexend text-xl font-bold mb-1 text-on-surface">{project.title}</h3>
                  <p className="text-sm text-on-surface-variant max-w-md">{project.description.slice(0, 100)}...</p>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-xs font-bold text-on-surface-variant">{project.teamMembers.length + 1} Contributors</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-primary-fixed text-on-primary-fixed text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary hover:text-white transition-colors">
                    {project.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {activeProjects.length === 0 && (
            <div className="bg-surface-container p-6 rounded-xl text-center text-on-surface-variant">
              Not involved in any active projects yet.
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-surface/80 backdrop-blur-md">
          <div className="bg-surface-container-lowest rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-surface-container overflow-hidden">
            <div className="px-8 py-6 border-b border-surface-container flex items-center justify-between bg-surface-container-lowest z-10 shrink-0">
              <h2 className="text-2xl font-lexend font-extrabold text-on-surface flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">edit_document</span>
                Update Profile
              </h2>
              <button type="button" onClick={() => setIsEditing(false)} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center overflow-hidden hover:bg-surface-container-high transition-colors group">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors cursor-pointer">close</span>
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-8">
              <form id="edit-profile-form" onSubmit={handleSaveProfile} className="space-y-8">
                
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-on-surface">About Me</label>
                  <textarea
                    value={editForm.bio}
                    onChange={e => setEditForm({...editForm, bio: e.target.value})}
                    className="w-full bg-surface-container-low border-none rounded-2xl p-5 text-sm focus:ring-2 focus:ring-primary/20 outline-none h-32 resize-none shadow-inner"
                    placeholder="Tell your fellow contributors about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-on-surface">Skills <span className="text-secondary font-medium tracking-widest uppercase text-[10px] ml-2">Comma Separated</span></label>
                  <input
                    type="text"
                    value={editForm.skills}
                    onChange={e => setEditForm({...editForm, skills: e.target.value})}
                    className="w-full bg-surface-container-low border-none rounded-2xl p-5 text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-inner"
                    placeholder="e.g. Next.js, Node.js, Python, Figma"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-on-surface">Profile Picture (.jpg, .jpeg, .png)</label>
                  <div className="flex items-center gap-4">
                    {editForm.avatar && (
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-surface-container">
                        <img src={editForm.avatar} className="w-full h-full object-cover" alt="Preview" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleImageUpload}
                      className="w-full bg-surface-container-low border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-inner file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-container cursor-pointer text-on-surface-variant flex-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface">GitHub URL</label>
                    <input
                      type="url"
                      value={editForm.github}
                      onChange={e => setEditForm({...editForm, github: e.target.value})}
                      className="w-full bg-surface-container-low border-none rounded-2xl p-5 text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-inner"
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface">LinkedIn URL</label>
                    <input
                      type="url"
                      value={editForm.linkedin}
                      onChange={e => setEditForm({...editForm, linkedin: e.target.value})}
                      className="w-full bg-surface-container-low border-none rounded-2xl p-5 text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-inner"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-on-surface">Portfolio / Website</label>
                  <input
                    type="url"
                    value={editForm.portfolio}
                    onChange={e => setEditForm({...editForm, portfolio: e.target.value})}
                    className="w-full bg-surface-container-low border-none rounded-2xl p-5 text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-inner"
                    placeholder="https://mywebsite.com"
                  />
                </div>
              </form>
            </div>

            {/* Footer actions pinned to bottom */}
            <div className="p-6 border-t border-surface-container flex items-center justify-end gap-4 bg-surface-container-lowest shrink-0">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3.5 font-bold text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-profile-form"
                disabled={saving}
                className="bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest px-10 py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-2"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
