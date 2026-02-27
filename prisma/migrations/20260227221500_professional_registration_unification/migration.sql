-- Rename old registration columns to unified name
ALTER TABLE "trainers" RENAME COLUMN "cref" TO "professional_registration";
ALTER TABLE "nutritionists" RENAME COLUMN "crn" TO "professional_registration";

-- Recreate unique indexes with new names
DROP INDEX IF EXISTS "trainers_cref_key";
DROP INDEX IF EXISTS "nutritionists_crn_key";

CREATE UNIQUE INDEX "trainers_professional_registration_key" ON "trainers"("professional_registration");
CREATE UNIQUE INDEX "nutritionists_professional_registration_key" ON "nutritionists"("professional_registration");
