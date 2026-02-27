-- AlterTable
ALTER TABLE "users"
ADD COLUMN "username" TEXT,
ADD COLUMN "cpf" TEXT;

-- AlterTable
ALTER TABLE "trainers"
ADD COLUMN "cref" TEXT;

-- AlterTable
ALTER TABLE "nutritionists"
ADD COLUMN "crn" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "trainers_cref_key" ON "trainers"("cref");

-- CreateIndex
CREATE UNIQUE INDEX "nutritionists_crn_key" ON "nutritionists"("crn");
