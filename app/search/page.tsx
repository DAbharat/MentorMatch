"use client";
import searchService from "@/services/search.service";
import React, { use, useEffect, useState } from "react";

export default function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ name?: string; skill?: string }>;
}) {
    const params = use(searchParams);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        return <div className="p-6">Loading...</div>
    }

    if (error) {
        return <div className="p-6 text-red-500">Error: {error}</div>
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Search Results</h1>
            {data.length === 0 ? (
                <p className="text-gray-500">No results found</p>
            ) : (
                <div className="space-y-4">
                    {data.map((user: any) => (
                        <div key={user.id} className="border p-4 rounded-lg">
                            <h2 className="text-xl font-semibold">{user.name}</h2>
                            <p className="text-gray-600">Skills: {user.skillsOffered.join(", ")}</p>
                            <p className="text-sm text-gray-500">Rating: {user.averageRating || 'N/A'}</p>
                            <p className="text-sm text-gray-500">Completed Sessions: {user.completedSessions}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
