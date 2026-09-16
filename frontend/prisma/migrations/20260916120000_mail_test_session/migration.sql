-- CreateEnum
CREATE TYPE "MailTestSessionStatus" AS ENUM ('pending', 'scoring', 'scored', 'expired', 'failed');

-- CreateTable
CREATE TABLE "MailTestSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT,
    "status" "MailTestSessionStatus" NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "score" DOUBLE PRECISION,
    "resultJson" TEXT NOT NULL DEFAULT '{}',
    "clientIpHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MailTestSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MailTestSession_token_key" ON "MailTestSession"("token");

-- CreateIndex
CREATE INDEX "MailTestSession_expiresAt_idx" ON "MailTestSession"("expiresAt");

-- CreateIndex
CREATE INDEX "MailTestSession_userId_idx" ON "MailTestSession"("userId");

-- CreateIndex
CREATE INDEX "MailTestSession_clientIpHash_createdAt_idx" ON "MailTestSession"("clientIpHash", "createdAt");

-- AddForeignKey
ALTER TABLE "MailTestSession" ADD CONSTRAINT "MailTestSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
