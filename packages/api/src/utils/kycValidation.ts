import { DocumentType } from '@prisma/client';
import { KYCDocumentInput, SubmitKYCInput } from '../types';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const REQUIRED_DOCUMENT_TYPES: DocumentType[] = ['RCCM', 'TAX_NUMBER_CERT', 'COMPANY_PRESENTATION', 'LEGAL_REP_ID'];

export const validateRCCMFormat = (value: string): boolean => /^[A-Z]{2}\/\d{4}\/\d{5}$/.test(value.trim());

export const validateTaxNumberFormat = (value: string): boolean => /^[A-Z0-9]{6,20}$/i.test(value.trim());

export const validateEmailFormat = (value: string): boolean => {
  const email = value.trim();
  if (!email || email.includes(' ')) {
    return false;
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domainPart] = parts;
  if (!localPart || !domainPart || domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return false;
  }

  const domainLabels = domainPart.split('.');
  if (domainLabels.length < 2) {
    return false;
  }

  return domainLabels.every((label) => /^[A-Za-z0-9-]+$/.test(label) && !label.startsWith('-') && !label.endsWith('-'));
};

export const validatePhoneNumberFormat = (value: string): boolean => /^\+?[1-9]\d{7,14}$/.test(value.trim());

export const validateDocumentFileType = (mimeType: string): boolean => ALLOWED_MIME_TYPES.includes(mimeType);

export const validateDocumentFileSize = (fileSize: number): boolean => Number.isFinite(fileSize) && fileSize > 0 && fileSize <= MAX_FILE_SIZE_BYTES;

export const validateDocumentPayload = (document: KYCDocumentInput): string[] => {
  const errors: string[] = [];

  if (!validateDocumentFileType(document.mimeType)) {
    errors.push(`Invalid mimeType for ${document.type}. Allowed: PDF, JPG, PNG`);
  }

  if (!validateDocumentFileSize(document.fileSize)) {
    errors.push(`Invalid fileSize for ${document.type}. Max size is 5MB`);
  }

  if (!document.fileUrl?.trim()) {
    errors.push(`Missing fileUrl for ${document.type}`);
  }

  if (!document.fileName?.trim()) {
    errors.push(`Missing fileName for ${document.type}`);
  }

  return errors;
};

export const validateSubmissionStage = (payload: SubmitKYCInput): string[] => {
  const missingFields: string[] = [];

  const requiredTopLevelFields: Array<keyof SubmitKYCInput> = [
    'companyName',
    'rccmNumber',
    'taxNumber',
    'companyAddress',
    'businessPhone',
    'businessEmail',
    'bankAccountHolder',
    'bankAccountNumber',
    'bankCode',
    'legalRepresentative',
    'documents',
  ];

  for (const field of requiredTopLevelFields) {
    const value = payload[field];
    const isMissing = value === undefined || value === null || (typeof value === 'string' && !value.trim());
    if (isMissing) {
      missingFields.push(field);
    }
  }

  const legalRepresentative = payload.legalRepresentative;
  if (legalRepresentative) {
    const requiredLegalRepresentativeFields: Array<keyof typeof legalRepresentative> = [
      'fullName',
      'position',
      'phone',
      'email',
      'address',
      'nationalIdNumber',
    ];

    for (const field of requiredLegalRepresentativeFields) {
      if (!legalRepresentative[field]?.trim()) {
        missingFields.push(`legalRepresentative.${field}`);
      }
    }
  }

  const submittedTypes = new Set((payload.documents || []).map((doc) => doc.type));
  for (const requiredDocumentType of REQUIRED_DOCUMENT_TYPES) {
    if (!submittedTypes.has(requiredDocumentType)) {
      missingFields.push(`documents.${requiredDocumentType}`);
    }
  }

  return missingFields;
};
