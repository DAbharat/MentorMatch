"use client";

import React from "react";
import { DM_Sans } from "next/font/google";

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

type Skill = {
  id: string;
  name: string;
};

type ProfileSkillsProps = {
  skillsOffered: Skill[];
  skillsWanted: Skill[];
  isOwner?: boolean;
};

export default function ProfileSkills({
  skillsOffered,
  skillsWanted,
  isOwner = false,
}: ProfileSkillsProps) {
  return (
    <div
      className={`w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 ${DM_Sans_Font.className}`}
    >
      {/* Skills Offered */}
      <div>
        <h2 className="text-base font-semibold text-[#f2f0e8]">
          Skills offered
        </h2>
        <p className="mt-1 text-sm text-[#8a8f80]">
          Topics available for mentorship
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {skillsOffered.length > 0 ? (
            skillsOffered.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-[#161b12] border border-[#323d28] text-[#dbe8b5]"
              >
                {skill.name}
              </span>
            ))
          ) : (
            <p className="text-sm text-[#787d6f]">
              {isOwner
                ? "No skills offered yet. Add them from Edit profile."
                : "No skills offered yet."}
            </p>
          )}
        </div>
      </div>

      {/* Skills Wanted */}
      <div>
        <h2 className="text-base font-semibold text-[#f2f0e8]">
          Skills wanted
        </h2>
        <p className="mt-1 text-sm text-[#8a8f80]">
          Topics currently learning
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {skillsWanted.length > 0 ? (
            skillsWanted.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-[#11140e] border border-[#242a1e] text-[#c7cabf]"
              >
                {skill.name}
              </span>
            ))
          ) : (
            <p className="text-sm text-[#787d6f]">
              {isOwner
                ? "No skills wanted yet. Add them from Edit profile."
                : "No skills wanted yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
