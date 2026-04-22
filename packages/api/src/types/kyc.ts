import { DocumentType, KYCStatus, VerificationStatus } from '@prisma/client';

export interface KYCDocumentInput {
  type: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  expiresAt?: string;
}

export interface KYCLegalRepresentativeInput {
  fullName: string;
  position: string;
  phone: string;
  email: string;
  address: string;
  nationalIdNumber: string;
  photoUrl?: string;
  idDocumentUrl?: string;
  mandateDocumentUrl?: string;
}

export interface SubmitKYCInput {
  companyName: string;
  rccmNumber: string;
  taxNumber: string;
  companyAddress: string;
  businessPhone: string;
  businessEmail: string;
  bankAccountHolder: string;
  bankAccountNumber: string;
  bankCode: string;
  expiresAt?: string;
  legalRepresentative: KYCLegalRepresentativeInput;
  documents: KYCDocumentInput[];
}

export interface VerifyKYCInput {
  status: KYCStatus;
  reason?: string;
}

export interface KYCVerificationInput {
  status: VerificationStatus;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
}
