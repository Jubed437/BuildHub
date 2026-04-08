"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/leaderboard');
      setLeaders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-on-surface-variant">Loading Leaderboard...</div>;

  const top3 = leaders.slice(0, 3);
  const theRest = leaders.slice(3);

  return (
    <div className="pt-6 pb-20 px-6 max-w-7xl mx-auto flex-1">
      {/* Hero Header Section */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full mb-4 tracking-widest uppercase">COMMUNITY RECOGNITION</span>
            <h1 className="text-5xl md:text-7xl font-lexend font-extrabold tracking-tighter text-on-surface leading-none mb-4">
              Campus <br/><span className="text-primary italic">Contributors</span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed">
              Honoring the minds that bridge innovation and collaboration across our university ecosystem.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="p-6 bg-surface-container rounded-xl text-center min-w-[140px]">
              <p className="text-3xl font-lexend font-bold text-primary">{leaders.length}</p>
              <p className="text-xs font-bold text-secondary uppercase tracking-wider">Top Minds</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top 3 Contributors Component - Fallbacks to Top 1, 2 depending on count */}
      {top3.length > 0 && (
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            
            {/* Rank 2 */}
            {top3[1] && (
              <div className="md:col-span-4 order-2 md:order-1">
                <Link href={`/dashboard/profile/${top3[1]._id}`}>
                  <div className="bg-surface-container-low p-8 rounded-xl border-b-4 border-surface-container-highest relative group hover:bg-surface-container-high transition-colors text-center cursor-pointer">
                    <div className="absolute -top-6 left-8 w-12 h-12 bg-surface-container-highest text-on-surface-variant font-lexend font-black rounded-full flex items-center justify-center text-xl shadow-lg">2</div>
                    <div className="w-32 h-32 rounded-full mb-6 mx-auto bg-primary-fixed-dim/30 flex items-center justify-center text-4xl font-lexend font-bold text-primary group-hover:scale-105 transition-transform">
                      {top3[1].name.charAt(0)}
                    </div>
                    <h3 className="text-2xl font-lexend font-bold mb-1">{top3[1].name}</h3>
                    <p className="text-primary text-sm font-bold uppercase mb-4 tracking-wide">{top3[1].skills[0] || 'Contributor'}</p>
                    <div className="px-4 py-2 bg-surface-container-lowest rounded-full shadow-sm border border-surface-container inline-flex items-center gap-2">
                      <span className="material-symbols-outlined text-stone-400 text-sm">star</span>
                      <span className="font-bold text-on-surface">{top3[1].contributions}</span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Rank 1 (The Hero) */}
            {top3[0] && (
              <div className="md:col-span-4 order-1 md:order-2">
                <Link href={`/dashboard/profile/${top3[0]._id}`}>
                  <div className="bg-surface-container-highest p-10 rounded-xl border-b-8 border-primary relative transform md:-translate-y-8 shadow-2xl shadow-primary/10 group cursor-pointer hover:bg-surface-container-high transition-colors">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest font-lexend font-black rounded-full flex items-center justify-center text-4xl shadow-xl border-4 border-surface-container-lowest">1</div>
                    <div className="w-48 h-48 mx-auto rounded-full mb-6 flex items-center justify-center bg-gradient-to-tr from-primary to-secondary-container text-surface-container-lowest text-6xl font-black font-lexend group-hover:scale-105 transition-transform">
                      {top3[0].name.charAt(0)}
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <h3 className="text-3xl font-lexend font-bold mb-1">{top3[0].name}</h3>
                      <p className="text-primary text-base font-bold uppercase mb-4 tracking-widest">{top3[0].skills[0] || 'Elite Contributor'}</p>
                      <div className="px-6 py-3 bg-primary text-surface-container-lowest rounded-full shadow-lg flex items-center gap-3 scale-110">
                        <span className="material-symbols-outlined text-base">military_tech</span>
                        <span className="font-bold text-lg">{top3[0].contributions}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Rank 3 */}
            {top3[2] && (
              <div className="md:col-span-4 order-3 md:order-3">
                <Link href={`/dashboard/profile/${top3[2]._id}`}>
                  <div className="bg-surface-container-low p-8 rounded-xl border-b-4 border-secondary-container relative group hover:bg-surface-container-high transition-colors text-center cursor-pointer">
                    <div className="absolute -top-6 left-8 w-12 h-12 bg-secondary-container text-on-secondary-container font-lexend font-black rounded-full flex items-center justify-center text-xl shadow-lg">3</div>
                    <div className="w-32 h-32 rounded-full mb-6 mx-auto bg-secondary-fixed/50 flex items-center justify-center text-4xl font-lexend font-bold text-secondary group-hover:scale-105 transition-transform">
                      {top3[2].name.charAt(0)}
                    </div>
                    <h3 className="text-2xl font-lexend font-bold mb-1">{top3[2].name}</h3>
                    <p className="text-primary text-sm font-bold uppercase mb-4 tracking-wide">{top3[2].skills[0] || 'Contributor'}</p>
                    <div className="px-4 py-2 bg-surface-container-lowest rounded-full shadow-sm border border-surface-container inline-flex items-center gap-2">
                      <span className="material-symbols-outlined text-stone-400 text-sm">star</span>
                      <span className="font-bold text-on-surface">{top3[2].contributions}</span>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Overall Rankings Table Section */}
      {theRest.length > 0 && (
        <section className="bg-surface p-8 rounded-xl border border-surface-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-lexend font-bold tracking-tight">Overall Rankings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs font-bold text-secondary uppercase tracking-widest">
                  <th className="px-6 py-4 w-16">Rank</th>
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Top Skill</th>
                  <th className="px-6 py-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {theRest.map((user: any, index: number) => (
                  <tr key={user._id} className="group hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 bg-surface-container-low rounded-l-xl font-lexend font-bold text-lg text-stone-500">
                      {(index + 4).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4 bg-surface-container-low">
                      <Link href={`/dashboard/profile/${user._id}`}>
                        <div className="flex items-center gap-4 cursor-pointer">
                          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-on-surface-variant">
                            {user.name.charAt(0)}
                          </div>
                          <div className="font-bold text-on-surface hover:text-primary transition-colors">{user.name}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 bg-surface-container-low">
                      <span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-xs font-bold rounded-full">
                        {user.skills[0] || 'Member'}
                      </span>
                    </td>
                    <td className="px-6 py-4 bg-surface-container-low rounded-r-xl text-right font-lexend font-bold">
                      {user.contributions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
