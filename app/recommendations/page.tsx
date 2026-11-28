"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DM_Sans } from "next/font/google";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import RecommendationsList from "@/components/recommendations/RecommendationsList";
import { Spinner } from "@/components/ui/spinner";

const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
});

export default function RecommendationsPage() {
    const router = useRouter();
    const { userId, isLoading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && !userId) {
            toast.error("Please sign in to view recommendations");
            router.push("/sign-in");
        }
    }, [userId, authLoading, router]);

    if (authLoading) {
        return (
            <div className={`min-h-screen bg-[#090a08] flex items-center justify-center ${DM_Sans_Font.className}`}>
                <Spinner />
            </div>
        );
    }

    if (!userId) return null;

    return (
        <div className={`min-h-screen bg-[#090a08] text-[#f2f0e8] p-4 sm:p-6 lg:p-8 ${DM_Sans_Font.className}`}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Page Header */}
                {/* <div className="flex items-center gap-3 border-b border-[#1f1f1f] pb-5"> */}
                {/* <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mentor Recommendations</h1>
                        <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                            Personalized matches based on the skills you want to learn and proven mentor performance
                        </p>
                    </div> */}
                {/* </div> */}

                {/* Recommendations Grid */}
                <RecommendationsList
                    limit={12}
                    title="Top Matches For You"
                    subtitle="Sorted by match relevance, bayesian ratings, and student confidence boosts"
                />
            </div>
        </div>
    );
}

