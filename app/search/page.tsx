"use client";
import ProfileCard from "@/components/profile/ProfileCard";
import searchService from "@/services/search.service";
import React, { use, useEffect, useState } from "react";
import { DM_Sans } from 'next/font/google';
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
})

export default function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ name?: string; skill?: string }>;
}) {
    const params = use(searchParams);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter()

    useEffect(() => {
        const loadSearch = async () => {
            try {
                setLoading(true);
                setError(null);
                const results = await searchService({
                    name: params.name,
                    skill: params.skill,
                });
                setData(results || []);
            } catch (err: any) {
                console.error("Search error:", err);
                setError(err.message || "Failed to search");
            } finally {
                setLoading(false);
            }
        };

        if (params.name || params.skill) {
            loadSearch();
        } else {
            setLoading(false);
        }
    }, [params.name, params.skill]);

    if (loading) {
        return <div className={`p-6 ${DM_Sans_Font.className}`}>Loading...</div>
    }

    if (error) {
        return <div className={`p-6 text-red-500 ${DM_Sans_Font.className}`}>Error: {error}</div>
    }

    return (
    <div className={`${DM_Sans_Font.className} bg-[#0b090a] min-h-screen`}>

      {/* Content Section */}
      <div className="p-8">
        {data.length === 0 ? (
          <p className="text-gray-500">No results found</p>
        ) : (
          <div className="space-y-4">
            {data.map((user, index) => (
              <ProfileCard
                onClick={() => { router.push(`/profile/${user.clerkUserId}`) }} 
                key={user.id || index}
                skillsOffered={user.skillsOffered || []}
                name={user.name || "Unknown"}
                rating={user.averageRating || 0}
                completedSessions={user.completedSessions || 0}
                clerkUserId={user.clerkUserId || ""}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
