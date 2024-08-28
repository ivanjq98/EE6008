-- CreateTable
CREATE TABLE "Remark" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "remarks" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Remark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Remark_milestoneId_facultyId_key" ON "Remark"("milestoneId", "facultyId");

-- AddForeignKey
ALTER TABLE "Remark" ADD CONSTRAINT "Remark_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remark" ADD CONSTRAINT "Remark_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
