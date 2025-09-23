/*
  Warnings:

  - A unique constraint covering the columns `[facultyId]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `facultyId` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Teacher" ADD COLUMN     "facultyId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_facultyId_key" ON "public"."Teacher"("facultyId");
