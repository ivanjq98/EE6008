-- CreateEnum
CREATE TYPE "FacultyRole" AS ENUM ('SUPERVISOR', 'MODERATOR', 'NO_ROLE');

-- AlterTable
ALTER TABLE "Faculty" ADD COLUMN     "role" "FacultyRole" NOT NULL DEFAULT 'NO_ROLE';

-- CreateTable
CREATE TABLE "ProjectFaculty" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "role" "FacultyRole" NOT NULL,

    CONSTRAINT "ProjectFaculty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFaculty_projectId_facultyId_key" ON "ProjectFaculty"("projectId", "facultyId");

-- AddForeignKey
ALTER TABLE "ProjectFaculty" ADD CONSTRAINT "ProjectFaculty_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFaculty" ADD CONSTRAINT "ProjectFaculty_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
