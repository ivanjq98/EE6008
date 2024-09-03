/*
  Warnings:

  - The values [NOT_COMPLETED] on the enum `MilestoneStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MilestoneStatus_new" AS ENUM ('NOT_STARTED', 'STARTED', 'NEARLY_HALF', 'HALF_WAY_THERE', 'ALMOST_DONE', 'COMPLETED');
ALTER TABLE "Milestone" ALTER COLUMN "status" TYPE "MilestoneStatus_new" USING ("status"::text::"MilestoneStatus_new");
ALTER TYPE "MilestoneStatus" RENAME TO "MilestoneStatus_old";
ALTER TYPE "MilestoneStatus_new" RENAME TO "MilestoneStatus";
DROP TYPE "MilestoneStatus_old";
COMMIT;
