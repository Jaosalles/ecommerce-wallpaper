-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER';

-- Ensure existing admin account has ADMIN role
UPDATE "User"
SET "role" = 'ADMIN'
WHERE LOWER("email") = 'admin@example.com';
