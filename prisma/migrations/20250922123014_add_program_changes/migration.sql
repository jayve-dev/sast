/*
  Warnings:

  - You are about to drop the `YearLevel` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `programId` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."TeachersAssigned" DROP CONSTRAINT "TeachersAssigned_yearLevelId_fkey";

-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "programId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Program" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "public"."YearLevel";

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
