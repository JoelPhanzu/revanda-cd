-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RCCM', 'ID_NATIONAL', 'TAX_NUMBER_CERT', 'PROOF_ADDRESS', 'COMPANY_PRESENTATION', 'LEGAL_REP_ID', 'LEGAL_REP_PHOTO', 'LEGAL_REP_MANDATE', 'BANK_CERTIFICATE', 'COMMERCIAL_REGISTRATION');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "VendorKYC" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "rccmNumber" TEXT NOT NULL,
    "taxNumber" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL,
    "businessPhone" TEXT NOT NULL,
    "businessEmail" TEXT NOT NULL,
    "bankAccountHolder" TEXT NOT NULL,
    "bankAccountNumber" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "status" "KYCStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorKYC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYCDocument" (
    "id" TEXT NOT NULL,
    "kycId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "KYCDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYCLegalRepresentative" (
    "id" TEXT NOT NULL,
    "kycId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "nationalIdNumber" TEXT NOT NULL,
    "photoUrl" TEXT,
    "idDocumentUrl" TEXT,
    "mandateDocumentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYCLegalRepresentative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYCVerification" (
    "id" TEXT NOT NULL,
    "kycId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL,
    "notes" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KYCVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorKYC_vendorId_key" ON "VendorKYC"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "KYCDocument_kycId_type_key" ON "KYCDocument"("kycId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "KYCLegalRepresentative_kycId_key" ON "KYCLegalRepresentative"("kycId");

-- AddForeignKey
ALTER TABLE "VendorKYC" ADD CONSTRAINT "VendorKYC_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCDocument" ADD CONSTRAINT "KYCDocument_kycId_fkey" FOREIGN KEY ("kycId") REFERENCES "VendorKYC"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCLegalRepresentative" ADD CONSTRAINT "KYCLegalRepresentative_kycId_fkey" FOREIGN KEY ("kycId") REFERENCES "VendorKYC"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCVerification" ADD CONSTRAINT "KYCVerification_kycId_fkey" FOREIGN KEY ("kycId") REFERENCES "VendorKYC"("id") ON DELETE CASCADE ON UPDATE CASCADE;
