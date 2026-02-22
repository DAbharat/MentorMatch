"use client"

import React from "react"
import { DM_Sans } from "next/font/google"

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
})

type Skill = {
  id: string
  name: string
}

type ProfileSkillsProps = {
  skillsOffered: Skill[]
  skillsWanted: Skill[]
}

export default function ProfileSkills({
  skillsOffered,
  skillsWanted,
}: ProfileSkillsProps) {
  return (
    <div
      className={`w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-0 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 ${DM_Sans_Font.className} bg-[#0b090a]`}
    >
      {/* Skills Offered */}
      <div className="bg-[#111315] rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 sm:p-6 flex flex-col border border-[#1f1f1f]">
        <div className="mb-4 pb-2 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-[#d3d3d3] flex items-center gap-2">
            <svg
              className="w-5 h-5 text-indigo-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            Skills Offered
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            What I can teach
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {skillsOffered.length > 0 ? (
            skillsOffered.map((skill) => (
              <span
                key={skill.id}
                className="text-[#d3d3d3] inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium border border-indigo-200 shadow-sm transition-all duration-200"
              >
                {skill.name}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm italic">
              No skills offered yet
            </span>
          )}
        </div>
      </div>

      {/* Skills Wanted */}
      <div className="bg-[#111315] rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 sm:p-6 flex flex-col border border-[#1f1f1f]">
        <div className="mb-4 pb-2 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-[#d3d3d3] flex items-center gap-2">
            <svg
              className="w-5 h-5 text-emerald-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Skills Wanted
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            What I want to learn
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {skillsWanted.length > 0 ? (
            skillsWanted.map((skill) => (
              <span
                key={skill.id}
                className="text-[#d3d3d3] inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium border border-emerald-200 shadow-sm transition-all duration-200"
              >
                {skill.name}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm italic">
              No skills wanted yet
            </span>
          )}
        </div>
      </div>
    </div>
  )
}