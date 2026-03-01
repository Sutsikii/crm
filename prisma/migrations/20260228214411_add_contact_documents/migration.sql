-- CreateEnum
CREATE TYPE "contact_type" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "contact_event_type" AS ENUM ('NOTE', 'STATUS_CHANGE', 'CREATED');

-- AlterTable
ALTER TABLE "contact" ADD COLUMN     "address" TEXT,
ADD COLUMN     "type" "contact_type" NOT NULL DEFAULT 'INDIVIDUAL',
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;

-- CreateTable
CREATE TABLE "contact_event" (
    "id" TEXT NOT NULL,
    "type" "contact_event_type" NOT NULL,
    "content" TEXT,
    "fromStatus" "contact_status",
    "toStatus" "contact_status",
    "contactId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_event_contactId_idx" ON "contact_event"("contactId");

-- CreateIndex
CREATE INDEX "contact_document_contactId_idx" ON "contact_document"("contactId");

-- AddForeignKey
ALTER TABLE "contact_event" ADD CONSTRAINT "contact_event_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_event" ADD CONSTRAINT "contact_event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_document" ADD CONSTRAINT "contact_document_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_document" ADD CONSTRAINT "contact_document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
