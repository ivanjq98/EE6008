-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ProjectAppeal" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "currentProjectId" TEXT NOT NULL,
    "requestedProjectId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "AppealStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectAppeal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectAppeal" ADD CONSTRAINT "ProjectAppeal_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAppeal" ADD CONSTRAINT "ProjectAppeal_currentProjectId_fkey" FOREIGN KEY ("currentProjectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAppeal" ADD CONSTRAINT "ProjectAppeal_requestedProjectId_fkey" FOREIGN KEY ("requestedProjectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
