"use client";

import { useMemo, useState } from "react";

type SkillBubbleSelectorProps = {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  label?: string;
  helperText?: string;
  placeholder?: string;
};

const POPULAR_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Express",
  "Python",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "Tailwind CSS",
  "Figma",
  "UI Design",
  "Docker",
  "AWS",
  "CI/CD",
  "Git",
  "Java",
  "Spring Boot",
  "Machine Learning",
  "Deep Learning",
  "PyTorch",
  "Flutter",
  "React Native",
  "Data Analysis"
];

const RELATED_SKILLS: Record<string, string[]> = {
  react: ["Next.js", "TypeScript", "Tailwind CSS", "Redux", "React Query"],
  "next.js": ["React", "TypeScript", "Node.js", "Tailwind CSS", "REST APIs"],
  typescript: ["React", "Next.js", "Node.js", "Express", "Jest"],
  "node.js": ["Express", "MongoDB", "PostgreSQL", "REST APIs", "Docker"],
  express: ["Node.js", "MongoDB", "REST APIs", "JWT", "TypeScript"],
  python: ["FastAPI", "Django", "Pandas", "Data Analysis", "Machine Learning"],
  sql: ["PostgreSQL", "MySQL", "MongoDB", "Data Analysis", "ETL"],
  mongodb: ["Node.js", "Express", "Mongoose", "REST APIs", "Docker"],
  postgresql: ["SQL", "Node.js", "Prisma", "ETL", "Data Analysis"],
  "machine learning": ["Python", "PyTorch", "TensorFlow", "NLP", "Data Analysis"],
  figma: ["UI Design", "Design Systems", "Wireframing", "Prototyping", "UX Research"],
  docker: ["CI/CD", "AWS", "Linux", "Kubernetes", "Nginx"]
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function SkillBubbleSelector({
  selectedSkills,
  onChange,
  label = "Skills",
  helperText = "Select from suggestions or popular skills. You can still add a custom skill.",
  placeholder = "Search skills or add your own"
}: SkillBubbleSelectorProps) {
  const [query, setQuery] = useState("");
  const [showAllPopular, setShowAllPopular] = useState(false);

  const normalizedSelected = useMemo(
    () => new Set(selectedSkills.map((skill) => normalize(skill))),
    [selectedSkills]
  );

  const allSkills = useMemo(() => {
    const relatedPool = Object.values(RELATED_SKILLS).flat();
    return Array.from(new Set([...POPULAR_SKILLS, ...relatedPool]));
  }, []);

  const filteredSuggestions = useMemo(() => {
    const term = normalize(query);
    if (!term) return [];

    return allSkills
      .filter((skill) => normalize(skill).includes(term) && !normalizedSelected.has(normalize(skill)))
      .slice(0, 8);
  }, [allSkills, normalizedSelected, query]);

  const anchorSkill = selectedSkills[selectedSkills.length - 1];
  const relatedSkills = useMemo(() => {
    if (!anchorSkill) return [];
    const candidates = RELATED_SKILLS[normalize(anchorSkill)] || [];
    return candidates.filter((skill) => !normalizedSelected.has(normalize(skill))).slice(0, 4);
  }, [anchorSkill, normalizedSelected]);

  const availablePopularSkills = useMemo(
    () => POPULAR_SKILLS.filter((skill) => !normalizedSelected.has(normalize(skill))),
    [normalizedSelected]
  );

  const visiblePopularSkills = useMemo(
    () => (showAllPopular ? availablePopularSkills : availablePopularSkills.slice(0, 8)),
    [availablePopularSkills, showAllPopular]
  );

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;

    if (normalizedSelected.has(normalize(trimmed))) return;
    onChange([...selectedSkills, trimmed]);
    setQuery("");
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(selectedSkills.filter((skill) => normalize(skill) !== normalize(skillToRemove)));
  };

  const hasExactSuggestion = filteredSuggestions.some((skill) => normalize(skill) === normalize(query));
  const canAddCustom = query.trim().length > 0 && !hasExactSuggestion && !normalizedSelected.has(normalize(query));

  const handleQueryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    if (filteredSuggestions.length > 0) {
      addSkill(filteredSuggestions[0]);
      return;
    }

    if (canAddCustom) {
      addSkill(query);
    }
  };

  const clearSelectedSkills = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="space-y-1">
        <label className="text-label-md uppercase tracking-wider text-secondary font-bold block">{label}</label>
        <p className="text-[11px] md:text-xs text-on-surface-variant leading-relaxed">{helperText}</p>
      </div>

      <div className="space-y-2 bg-surface-container-low/50 rounded-xl p-3 md:p-4 border border-surface-container-high/60">
        <div className="flex items-center justify-between">
          <p className="text-[11px] md:text-xs uppercase tracking-wider text-secondary font-bold">Selected</p>
          {selectedSkills.length > 0 && (
            <button
              type="button"
              onClick={clearSelectedSkills}
              className="text-[11px] font-semibold text-on-surface-variant hover:text-primary transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 min-h-6">
          {selectedSkills.length > 0 ? (
            selectedSkills.map((skill) => (
              <button
                key={`selected-${skill}`}
                type="button"
                onClick={() => removeSkill(skill)}
                className="inline-flex w-full sm:w-auto min-w-0 sm:min-w-[8.5rem] items-center justify-between px-3 py-1.5 rounded-full text-xs font-bold bg-primary-fixed text-on-primary-fixed border border-primary/30 hover:bg-primary hover:text-white transition-colors"
                title="Remove skill"
              >
                <span className="truncate pr-2 max-w-[10rem] sm:max-w-none">{skill}</span>
                <span
                  aria-hidden="true"
                  className="ml-2 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/25"
                >
                  <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M2 2L8 8" />
                    <path d="M8 2L2 8" />
                  </svg>
                </span>
              </button>
            ))
          ) : (
            <p className="text-xs text-on-surface-variant">No skills selected yet.</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleQueryKeyDown}
          placeholder={placeholder}
          className="w-full bg-surface-container-low focus:bg-surface-container-lowest rounded-DEFAULT px-4 py-3 text-sm md:text-base outline-none focus:ring-1 focus:ring-primary/30 transition-all font-sans"
        />

        {(filteredSuggestions.length > 0 || canAddCustom) && (
          <div className="flex flex-wrap gap-2">
            {filteredSuggestions.map((skill) => (
              <button
                key={`suggestion-${skill}`}
                type="button"
                onClick={() => addSkill(skill)}
                className="px-3 py-1.5 rounded-full text-[11px] md:text-xs font-semibold bg-surface-container text-on-surface border border-surface-container-high hover:bg-surface-container-high transition-colors"
              >
                {skill}
              </button>
            ))}

            {canAddCustom && (
              <button
                type="button"
                onClick={() => addSkill(query)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary-container text-on-secondary-container border border-secondary/20 hover:opacity-90 transition-opacity"
              >
                Add &quot;{query.trim()}&quot;
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-[11px] md:text-xs uppercase tracking-wider text-secondary font-bold">Popular Skills</p>
        <div className="flex flex-wrap gap-2">
          {visiblePopularSkills.map((skill) => (
            <button
              key={`popular-${skill}`}
              type="button"
              onClick={() => addSkill(skill)}
              className="px-3 py-1.5 rounded-full text-[11px] md:text-xs font-semibold bg-surface-container text-on-surface border border-surface-container-high hover:bg-surface-container-high transition-colors"
            >
              {skill}
            </button>
          ))}
        </div>
        {availablePopularSkills.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAllPopular((prev) => !prev)}
            className="text-[11px] font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            {showAllPopular ? "Show fewer" : `Show more (${availablePopularSkills.length - 8} more)`}
          </button>
        )}
      </div>

      {relatedSkills.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] md:text-xs uppercase tracking-wider text-secondary font-bold">Related to {anchorSkill}</p>
          <div className="flex flex-wrap gap-2">
            {relatedSkills.map((skill) => (
              <button
                key={`related-${skill}`}
                type="button"
                onClick={() => addSkill(skill)}
                className="px-3 py-1.5 rounded-full text-[11px] md:text-xs font-semibold bg-primary-fixed/70 text-on-primary-fixed border border-primary/20 hover:bg-primary-fixed transition-colors"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
