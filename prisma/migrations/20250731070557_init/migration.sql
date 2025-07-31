-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."Course" AS ENUM ('BSIT', 'BSHM', 'BTLED', 'BEED', 'BSIE');

-- CreateEnum
CREATE TYPE "public"."Section" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "idNumber" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'STUDENT',
    "course" "public"."Course",
    "section" "public"."Section",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_idNumber_key" ON "public"."User"("idNumber");
