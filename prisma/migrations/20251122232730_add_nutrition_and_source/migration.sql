-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "calories" INTEGER,
ADD COLUMN     "carbs" INTEGER,
ADD COLUMN     "fat" INTEGER,
ADD COLUMN     "fiber" INTEGER,
ADD COLUMN     "protein" INTEGER,
ADD COLUMN     "sodium" INTEGER,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "sugar" INTEGER;
