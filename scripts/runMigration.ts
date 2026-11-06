import "dotenv/config";
import { migrateSkills } from "@/lib/helpers/skillMigration";

async function runMigration() {
    await migrateSkills()
    console.log("Migration completed successfully");
    process.exit(0);
}

runMigration().catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
});