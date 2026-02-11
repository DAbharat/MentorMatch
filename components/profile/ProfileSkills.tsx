import React from 'react'
import { DM_Sans } from 'next/font/google';


const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

type Skill = {
    id: string;
    name: string;
}

type ProfileSkillsProps = {
    skillsOffered: Skill[];
    skillsWanted: Skill[];
}

export default function ProfileSkills(
    { skillsOffered, skillsWanted }: ProfileSkillsProps
) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${DM_Sans_Font.className}`}>
            <div>
                <h3 className="font-semibold mb-3">Skills Offered</h3>
                <div className="flex flex-wrap gap-2">
                    {skillsOffered.map(skill => (
                        <span key={skill.id} className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm">
                            {skill.name}
                        </span>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Skills Wanted</h3>
                <div className="flex flex-wrap gap-2">
                    {skillsWanted.map(skill => (
                        <span key={skill.id} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                            {skill.name}
                        </span>
                    ))}
                </div>
            </div>

        </div>
    );
}
