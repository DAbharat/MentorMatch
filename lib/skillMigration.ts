import prisma from "./prisma";

function normalize(skillName: string) {
    return skillName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "")
}

export async function migrateSkills() {
    try {
        const skills = await prisma.skill.findMany()

            const updateSkill = await Promise.all(
                skills.map((skill) => {
                    return prisma.skill.update({
                        where: {
                            id: skill.id
                        },
                        data: {
                            normalizedSkillName: normalize(skill.name)
                        }
                    })
                })
            )
        
        console.log("Migration successfully completed")
    } catch (error: any) {
        console.error("Migration error: ", error.message)
    }
}