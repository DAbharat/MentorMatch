"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { DM_Sans } from "next/font/google";

const DM_Sans_Font = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

interface SearchBarProps {
  onClose?: () => void;
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const [text, setText] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (text.trim() === "") return;
    router.push(
      `/search?name=${encodeURIComponent(text)}&skill=${encodeURIComponent(text)}`
    );
    onClose?.();
  };

  return (
    <div className={`w-full ${DM_Sans_Font.className}`}>
      <div className="relative">
        <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e9484] pointer-events-none z-10" />
        <input
          type="text"
          aria-label="Search mentors or skills"
          className="auth-input w-full h-9 md:h-10 pl-9 sm:pl-10 pr-8 sm:pr-9 bg-[#0d0f0b] rounded-xl text-xs sm:text-sm text-[#f2f0e8] placeholder:text-[#787d6f] caret-[#9eb660] border border-[#283022] hover:border-[#3c4832] focus:outline-none focus:border-[#8fa654] focus:ring-2 focus:ring-[#8fa654]/25 transition-colors"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search mentors, skills..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        {text.length > 0 && (
          <button
            type="button"
            onClick={() => setText("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#8e9484] hover:text-[#f2f0e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fa654]/50 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
