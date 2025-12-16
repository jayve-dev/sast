-- CreateTable
CREATE TABLE "SurveyStatus" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "SurveyStatus_pkey" PRIMARY KEY ("id")
);
