-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "projectFacultyId" TEXT;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_projectFacultyId_fkey" FOREIGN KEY ("projectFacultyId") REFERENCES "ProjectFaculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
