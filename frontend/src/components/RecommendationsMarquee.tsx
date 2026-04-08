"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function RecommendationsMarquee() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/users/recommendations')
      .then(res => setUsers(res.data))
      .catch(console.error);
  }, []);

  if (users.length === 0) return null;

  // Duplicate list to create a seamless infinite loop
  const marqueeItems = [...users, ...users, ...users];

  return (
    <div className="w-full relative overflow-hidden py-10 my-8">
      {/* Label */}
      <div className="px-8 md:px-12 mb-6 flex items-center justify-between">
        <h2 className="font-lexend font-bold text-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
          AI Matches for You
        </h2>
        <span className="text-xs font-bold text-secondary uppercase tracking-widest hidden md:inline-block">Based on your skills & bio</span>
      </div>

      {/* Fade Edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
      
      {/* Marquee Track */}
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-6 px-6">
        {marqueeItems.map((user, i) => (
          <Link href={`/dashboard/profile/${user._id}`} key={`${user._id}-${i}`} className="flex-none block w-80">
            <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-container hover:border-primary/50 transition-colors h-full flex flex-col items-center text-center cursor-pointer group">
              
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center font-lexend font-black text-2xl text-surface-container-lowest overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                </div>
                {user.matchScore > 0 && (
                  <div className="absolute -top-2 -right-4 bg-primary text-surface-container-lowest text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                    {user.matchScore}% Match
                  </div>
                )}
              </div>

              <h3 className="font-lexend font-bold text-lg text-on-surface mb-1 group-hover:text-primary transition-colors">{user.name}</h3>
              <p className="text-xs text-on-surface-variant font-medium mb-4 line-clamp-2 min-h-[32px]">
                {user.bio || 'Campus contributor looking to collaborate.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-auto">
                {user.skills?.slice(0, 3).map((skill: string) => (
                  <span key={skill} className="px-2 py-1 bg-surface-container-high text-on-surface-variant text-[9px] font-black uppercase rounded-md tracking-wider">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
