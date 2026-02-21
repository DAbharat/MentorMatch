import React, { useState } from 'react'
import { Card } from '../ui/card';
import { DM_Sans } from 'next/font/google';
import { useUser } from '@clerk/nextjs';
import { Button } from '../retroui/Button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BellPlus } from 'lucide-react';

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

type ProfileCardProps = {
    skillsOffered: string[];
    name: string;
    rating: number;
    completedSessions: number;
    clerkUserId: string;
    onClick?: () => void;
}

export default function ProfileCard(
    { skillsOffered, name, rating, completedSessions, clerkUserId, onClick }: ProfileCardProps
) {
    const skillsList = skillsOffered.join(", ");
    const { user, isLoaded } = useUser()
    const router = useRouter()
    const[open, setOpen] = useState(false)

    if (!isLoaded) { return null }

    const isOwner = user && clerkUserId && user.id === clerkUserId

    return (
        <Card className={`bg-[#161a1d] border-none px-4 py-4 max-w-4xl w-full mx-auto ${DM_Sans_Font.className} cursor-pointer`} onClick={onClick}>
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#d3d3d3] flex items-center justify-center text-black text-base sm:text-lg font-semibold shadow-md">
                        {name.charAt(0).toUpperCase()}
                    </div>
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0 overflow-hidden">
                    <h1 className="text-base sm:text-lg font-semibold hover:underline text-[#d3d3d3] leading-tight truncate">{name}</h1>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 truncate">
                        <span className="font-medium">Skills:</span> {skillsList || "None listed"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap">
                            <span className="font-medium">Rating:</span> {rating.toFixed(1)}/5.0
                        </p>
                        <span className="text-muted-foreground opacity-40 text-xs">·</span>
                        <p className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap">
                            <span className="font-medium">Sessions:</span> {completedSessions}
                        </p>
                    </div>
                </div>

                {/* Bell icon */}
                {!isOwner && (
                    <BellPlus
                        className='shrink-0 cursor-pointer text-[#d3d3d3] w-4 h-4 sm:w-5 sm:h-5 ml-1'
                        onClick={() => setOpen(true)}
                    />
                )}
            </div>
        </Card>
    )
}