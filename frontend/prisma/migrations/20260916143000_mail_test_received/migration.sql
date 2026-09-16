-- AlterEnum
ALTER TYPE "MailTestSessionStatus" ADD VALUE IF NOT EXISTS 'received';

-- AlterTable
ALTER TABLE "MailTestSession" ADD COLUMN "rawMessageBase64" TEXT,
ADD COLUMN "receivedAt" TIMESTAMP(3);
