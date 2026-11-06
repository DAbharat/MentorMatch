import prisma from "@/lib/prisma";
import { cacheGet, cacheSet } from "../cache";

export const ALL_SKILLS_CACHE_KEY = "cache:v1:skills:all";
const ONE_DAY_IN_SEC = 86400;

export async function getAllSkillsCached() {
    const cached = await cacheGet<Array<{ id: string; name: string }>>(ALL_SKILLS_CACHE_KEY);
    if(cached) return cached;

    const skills = await prisma.skill.findMany({
        select: {
            id: true,
            name: true,
        },
        orderBy: {
            name: "asc",
        },
    })

    if(skills.length > 0) {
        await cacheSet(ALL_SKILLS_CACHE_KEY, skills, ONE_DAY_IN_SEC)
    }

    return skills;
}