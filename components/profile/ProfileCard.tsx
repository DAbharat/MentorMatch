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
    // console.log("userid: ", user?.id)
    // console.log("clerkuserid: ", clerkUserId)

    return (
        <Card className={`p-5 max-w-4xl w-full mx-auto ${DM_Sans_Font.className} cursor-pointer`} onClick={onClick}>
            <div className="flex items-start gap-4">
                <div className="shrink-0">
                    <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-white text-lg font-semibold shadow-md">
                        {name.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-semibold hover:underline">{name}</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        <span className="font-medium">Skills Offered:</span> {skillsList || "None listed"}
                    </p>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        <span className="font-medium">Rating:</span> {rating.toFixed(1)} / 5.0
                    </p>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        <span className="font-medium">Completed Sessions:</span> {completedSessions}
                    </p>
                </div>

                {isOwner ? (
                    <></>
                ) : (
                    <BellPlus
                    className='cursor-pointer'
                    onClick={() => setOpen(true)} />
                )}
            </div>
        </Card>
    )
}