-- CreateTable
CREATE TABLE "FacultyRoleWeightage" (
    "id" TEXT NOT NULL,
    "role" "FacultyRole" NOT NULL,
    "weightage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacultyRoleWeightage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacultyRoleWeightage_role_key" ON "FacultyRoleWeightage"("role");
