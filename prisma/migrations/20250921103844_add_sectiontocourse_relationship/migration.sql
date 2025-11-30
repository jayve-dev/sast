/*
  Warnings:

  - Added the required column `programId` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Section" ADD COLUMN     "programId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Section" ADD CONSTRAINT "Section_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
