-- CreateEnum
CREATE TYPE "billing_type" AS ENUM ('ONE_TIME', 'RECURRING');

-- CreateEnum
CREATE TYPE "recurring_interval" AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL');

-- CreateEnum
CREATE TYPE "deposit_type" AS ENUM ('FIXED', 'PERCENTAGE');

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "billingType" "billing_type" NOT NULL DEFAULT 'ONE_TIME',
    "recurringInterval" "recurring_interval",
    "depositEnabled" BOOLEAN NOT NULL DEFAULT false,
    "depositType" "deposit_type",
    "depositValue" DECIMAL(10,2),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_userId_idx" ON "product"("userId");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
