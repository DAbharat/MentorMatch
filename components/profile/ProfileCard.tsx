"use client";

import React from "react";
import { Card } from "../ui/card";
import { DM_Sans } from "next/font/google";
import { ArrowUpRight, Star } from "lucide-react";

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

type ProfileCardProps = {
  skillsOffered: string[];
  name: string;
  rating: number;
  id: string;
  completedSessions: number;
  onClick?: () => void;
};

export default function ProfileCard({
  skillsOffered,
  name,
  rating,
  completedSessions,
  onClick,
}: ProfileCardProps) {
  const skillsList = skillsOffered.join(", ");

  return (
    <Card
      className={`bg-[#11140e] border-[#242a1e] hover:border-[#3c4832] transition-colors px-4 py-4 max-w-4xl w-full mx-auto rounded-2xl shadow-none ${DM_Sans_Font.className} cursor-pointer group`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3.5">
        <div className="shrink-0">
          <div className="w-11 h-11 rounded-full bg-[#161b12] border border-[#3a4530] flex items-center justify-center text-[#b7cc7e] text-base font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-[#f2f0e8] group-hover:text-[#b7cc7e] transition-colors leading-tight truncate">
            {name}
          </h3>
          <p className="text-[#a8ab9e] text-xs sm:text-sm mt-0.5 truncate">
            <span className="font-medium text-[#c7cabf]">Skills:</span>{" "}
            {skillsList || "None listed"}
          </p>
          <div className="flex items-center gap-2.5 mt-1 text-xs text-[#a8ab9e] tabular-nums">
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Star
                className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
              {rating.toFixed(1)} / 5.0
            </span>
            <span className="text-[#3a4530]">·</span>
            <span className="whitespace-nowrap">
              {completedSessions} sessions
            </span>
          </div>
        </div>

        <ArrowUpRight
          className="shrink-0 w-4 h-4 text-[#8e9484] group-hover:text-[#b7cc7e] transition-colors"
          aria-hidden="true"
        />
      </div>
    </Card>
  );
}
