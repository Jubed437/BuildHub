"use client";

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function FindPeoplePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/users/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Live search as user types
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/users/search?q=${encodeURIComponent(val)}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <span className="text-secondary font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Campus Network</span>
        <h1 className="font-lexend text-5xl md:text-6xl font-extrabold text-on-surface tracking-tighter leading-[0.9] mb-4">
          Find <span className="text-primary italic">People.</span>
        </h1>
        <p className="text-on-surface-variant text-lg font-medium max-w-xl">
          Search for collaborators by name, skill, or interest across the campus network.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-12">
        <div className="relative flex items-center gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Try 'Machine Learning', 'Kavya', 'Blockchain'..."
              className="w-full bg-surface-container-low border-none rounded-full py-4 pl-14 pr-6 text-base focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium placeholder:text-on-surface-variant/50"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {loading && (
        <div className="text-center text-on-surface-variant py-12">Searching...</div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-surface-container">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">person_search</span>
          <p className="text-on-surface-variant font-medium">No people found for <strong>"{query}"</strong></p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-6">{results.length} Result{results.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((person: any) => (
              <Link href={`/dashboard/profile/${person._id}`} key={person._id}>
                <div className="bg-surface-container-low p-6 rounded-xl hover:bg-surface-container-high transition-colors group cursor-pointer flex items-start gap-5">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-container text-surface-container-lowest flex items-center justify-center font-lexend font-black text-2xl shrink-0 group-hover:scale-105 transition-transform">
                    {person.name.charAt(0)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-lexend font-bold text-lg text-on-surface group-hover:text-primary transition-colors truncate">
                        {person.name}
                      </h3>
                      <span className="text-xs font-bold text-primary shrink-0">{person.contributions} pts</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {person.skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase rounded-full tracking-wider">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors mt-1">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Default state — trending skills */}
      {!searched && (
        <div className="mt-4">
          <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-5">Suggested Searches</p>
          <div className="flex flex-wrap gap-3">
            {['Machine Learning', 'Blockchain', 'UX Strategy', 'Quantum Computing', 'Robotics', 'Bio-Ethics', 'Urban Planning', 'Cybersecurity'].map((tag) => (
              <button
                key={tag}
                onClick={() => { setQuery(tag); handleChange({ target: { value: tag } } as any); }}
                className="px-5 py-2.5 bg-surface-container-low text-on-surface font-bold text-sm rounded-full hover:bg-primary hover:text-surface-container-lowest transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
