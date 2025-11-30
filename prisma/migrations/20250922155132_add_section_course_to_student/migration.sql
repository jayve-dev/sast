-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "studentId" TEXT;

-- AlterTable
ALTER TABLE "public"."Section" ADD COLUMN     "studentId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Section" ADD CONSTRAINT "Section_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
