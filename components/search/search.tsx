"use client"

import React, { useState } from 'react'
import { Input } from '../ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { DM_Sans } from "next/font/google";

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

interface SearchBarProps {
    onClose?: () => void
}

export default function SearchBar({ onClose }: SearchBarProps) {
    const [text, setText] = useState("")
    const router = useRouter()

    const handleSubmit = () => {
        if (text.trim() === "") return;
        router.push(`/search?name=${encodeURIComponent(text)}&skill=${encodeURIComponent(text)}`)
        onClose?.()
    }

    return (
        <div className={`w-full ${DM_Sans_Font.className}`}>
            <div className="relative">
                <Search className="absolute left-2.5 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none z-10" />
                <input
                    type="text"
                    className="w-full h-9 sm:h-10 md:h-11 pl-8 sm:pl-10 md:pl-12 pr-3 sm:pr-4 md:pr-5 bg-transparent rounded-full text-xs sm:text-sm md:text-[#d3d3d3] text-[#d3d3d3] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm transition-all border border-[#1f1f1f]"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Search mentors, skills..."
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSubmit()
                        }
                    }}
                />
            </div>
        </div>
    )
}

