/*
  Warnings:

  - You are about to drop the column `studentId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Section` table. All the data in the column will be lost.
  - Added the required column `courseId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sectionId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Section" DROP CONSTRAINT "Section_studentId_fkey";

-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "studentId";

-- AlterTable
ALTER TABLE "public"."Section" DROP COLUMN "studentId";

-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "sectionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
