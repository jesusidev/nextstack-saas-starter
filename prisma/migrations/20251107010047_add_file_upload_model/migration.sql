-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'DELETED');

-- CreateTable
CREATE TABLE "FileUpload" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "status" "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "productId" TEXT,

    CONSTRAINT "FileUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileUpload_key_key" ON "FileUpload"("key");

-- CreateIndex
CREATE INDEX "FileUpload_userId_idx" ON "FileUpload"("userId");

-- CreateIndex
CREATE INDEX "FileUpload_status_idx" ON "FileUpload"("status");

-- CreateIndex
CREATE INDEX "FileUpload_createdAt_idx" ON "FileUpload"("createdAt");

-- AddForeignKey
ALTER TABLE "FileUpload" ADD CONSTRAINT "FileUpload_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
