import prisma from "./prisma";

function normalize(skillName: string) {
    return skillName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "")
}

export async function resolveSkills(skillNames: string[]) {

    const normalizeSkillNames = skillNames.map(
        name => name.trim().toLowerCase()
    )

    const existingSkills = await prisma.skill.findMany({
        where: {
            name: {
                in: normalizeSkillNames
            }
        }
    })

    const existingSkillNames = new Set(
        existingSkills.map(skill => skill.name)
    )

    const missingSkillNames = normalizeSkillNames.filter(
        name => !existingSkillNames.has(name)
    )

    const createdSkills = await Promise.all(
        missingSkillNames.map(
            name => prisma.skill.create({
                data: {
                    name,
                    normalizedSkillName: normalize(name)
                }
            })
        )
    )

    return [...existingSkills, ...createdSkills].map(skill => skill.id)
}