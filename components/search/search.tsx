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
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#8e9484] sm:left-3.5" />
        <input
          type="text"
          aria-label="Search mentors or skills"
          className="auth-input h-11 w-full rounded-xl border border-[#283022] bg-[#0d0f0b] pl-10 pr-12 text-sm text-[#f2f0e8] caret-[#9eb660] transition-colors placeholder:text-[#8a8f80] hover:border-[#3c4832] focus:border-[#8fa654] focus:outline-none focus:ring-2 focus:ring-[#8fa654]/25 sm:pl-11"
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
            className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-r-xl text-[#8e9484] transition-colors hover:text-[#f2f0e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8fa654]/50"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
