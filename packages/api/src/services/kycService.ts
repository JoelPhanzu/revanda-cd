import { KYCStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { KYCVerificationInput, KYCDocumentInput, SubmitKYCInput } from '../types';
import {
  validateDocumentPayload,
  validateEmailFormat,
  validatePhoneNumberFormat,
  validateRCCMFormat,
  validateSubmissionStage,
  validateTaxNumberFormat,
} from '../utils/kycValidation';

const getVendorIdByUserId = async (userId: string): Promise<string> => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }

  return vendor.id;
};

const parseOptionalDate = (value?: string): Date | null => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError('Invalid date format', 400);
  }

  return parsedDate;
};

export const kycService = {
  submitKYC: async (vendorUserId: string, payload: SubmitKYCInput) => {
    const vendorId = await getVendorIdByUserId(vendorUserId);

    const missingFields = validateSubmissionStage(payload);
    if (missingFields.length > 0) {
      throw new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400);
    }

    if (!validateRCCMFormat(payload.rccmNumber)) {
      throw new AppError('Invalid RCCM format. Expected format: XX/XXXX/XXXXX', 400);
    }

    if (!validateTaxNumberFormat(payload.taxNumber)) {
      throw new AppError('Invalid tax number format', 400);
    }

    if (!validateEmailFormat(payload.businessEmail) || !validateEmailFormat(payload.legalRepresentative.email)) {
      throw new AppError('Invalid email format', 400);
    }

    if (!validatePhoneNumberFormat(payload.businessPhone) || !validatePhoneNumberFormat(payload.legalRepresentative.phone)) {
      throw new AppError('Invalid phone number format', 400);
    }

    const documentValidationErrors = payload.documents.flatMap((document) => validateDocumentPayload(document));
    if (documentValidationErrors.length > 0) {
      throw new AppError(documentValidationErrors.join('; '), 400);
    }

    const expiresAt = parseOptionalDate(payload.expiresAt);

    const kyc = await prisma.$transaction(async (tx) => {
      const currentDate = new Date();
      const createdOrUpdated = await tx.vendorKYC.upsert({
        where: { vendorId },
        create: {
          vendorId,
          companyName: payload.companyName,
          rccmNumber: payload.rccmNumber,
          taxNumber: payload.taxNumber,
          companyAddress: payload.companyAddress,
          businessPhone: payload.businessPhone,
          businessEmail: payload.businessEmail,
          bankAccountHolder: payload.bankAccountHolder,
          bankAccountNumber: payload.bankAccountNumber,
          bankCode: payload.bankCode,
          status: 'SUBMITTED',
          submittedAt: currentDate,
          expiresAt,
          legalRepresentative: {
            create: {
              ...payload.legalRepresentative,
            },
          },
          documents: {
            create: payload.documents.map((document) => ({
              type: document.type,
              fileUrl: document.fileUrl,
              fileName: document.fileName,
              fileSize: document.fileSize,
              mimeType: document.mimeType,
              expiresAt: parseOptionalDate(document.expiresAt),
            })),
          },
        },
        update: {
          companyName: payload.companyName,
          rccmNumber: payload.rccmNumber,
          taxNumber: payload.taxNumber,
          companyAddress: payload.companyAddress,
          businessPhone: payload.businessPhone,
          businessEmail: payload.businessEmail,
          bankAccountHolder: payload.bankAccountHolder,
          bankAccountNumber: payload.bankAccountNumber,
          bankCode: payload.bankCode,
          status: 'SUBMITTED',
          submittedAt: currentDate,
          approvedAt: null,
          rejectionReason: null,
          expiresAt,
          legalRepresentative: {
            upsert: {
              create: {
                ...payload.legalRepresentative,
              },
              update: {
                ...payload.legalRepresentative,
              },
            },
          },
          documents: {
            deleteMany: {},
            create: payload.documents.map((document) => ({
              type: document.type,
              fileUrl: document.fileUrl,
              fileName: document.fileName,
              fileSize: document.fileSize,
              mimeType: document.mimeType,
              expiresAt: parseOptionalDate(document.expiresAt),
            })),
          },
        },
        include: {
          documents: true,
          legalRepresentative: true,
          verifications: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      await tx.kYCVerification.create({
        data: {
          kycId: createdOrUpdated.id,
          status: 'PENDING',
          notes: 'KYC submitted by vendor',
          verifiedBy: vendorUserId,
          verifiedAt: currentDate,
        },
      });

      return createdOrUpdated;
    });

    return kyc;
  },

  uploadDocument: async (vendorUserId: string, document: KYCDocumentInput) => {
    const vendorId = await getVendorIdByUserId(vendorUserId);
    const kyc = await prisma.vendorKYC.findUnique({ where: { vendorId } });

    if (!kyc) {
      throw new AppError('KYC profile not found', 404);
    }

    const documentValidationErrors = validateDocumentPayload(document);
    if (documentValidationErrors.length > 0) {
      throw new AppError(documentValidationErrors.join('; '), 400);
    }

    const uploadedDocument = await prisma.kYCDocument.upsert({
      where: {
        kycId_type: {
          kycId: kyc.id,
          type: document.type,
        },
      },
      create: {
        kycId: kyc.id,
        type: document.type,
        fileUrl: document.fileUrl,
        fileName: document.fileName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        expiresAt: parseOptionalDate(document.expiresAt),
      },
      update: {
        fileUrl: document.fileUrl,
        fileName: document.fileName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        expiresAt: parseOptionalDate(document.expiresAt),
        uploadedAt: new Date(),
        verificationStatus: 'PENDING',
      },
    });

    return uploadedDocument;
  },

  verifyKYC: async (kycId: string, status: KYCStatus, adminUserId: string, reason?: string) => {
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new AppError('Invalid KYC verification status. Allowed: APPROVED or REJECTED', 400);
    }

    const kyc = await prisma.vendorKYC.findUnique({ where: { id: kycId } });
    if (!kyc) {
      throw new AppError('KYC profile not found', 404);
    }

    const now = new Date();
    const updatedKYC = await prisma.$transaction(async (tx) => {
      const updated = await tx.vendorKYC.update({
        where: { id: kycId },
        data: {
          status,
          approvedAt: status === 'APPROVED' ? now : null,
          rejectionReason: status === 'REJECTED' ? reason || 'KYC rejected by admin' : null,
        },
        include: {
          vendor: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  fullName: true,
                },
              },
            },
          },
          documents: true,
          legalRepresentative: true,
          verifications: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      await tx.vendor.update({
        where: { id: updated.vendorId },
        data: {
          isVerified: status === 'APPROVED',
        },
      });

      await tx.kYCVerification.create({
        data: {
          kycId,
          status: status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
          notes: reason,
          verifiedBy: adminUserId,
          verifiedAt: now,
        },
      });

      return updated;
    });

    return updatedKYC;
  },

  getVendorKYC: async (vendorUserId: string) => {
    const vendorId = await getVendorIdByUserId(vendorUserId);

    return prisma.vendorKYC.findUnique({
      where: { vendorId },
      include: {
        documents: true,
        legalRepresentative: true,
        verifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  },

  getPendingKYCs: async () => {
    return prisma.vendorKYC.findMany({
      where: {
        status: {
          in: ['SUBMITTED', 'UNDER_REVIEW'],
        },
      },
      include: {
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
        documents: true,
        legalRepresentative: true,
      },
      orderBy: {
        submittedAt: 'asc',
      },
    });
  },

  getKYCByVendorId: async (vendorId: string) => {
    return prisma.vendorKYC.findUnique({
      where: { vendorId },
      include: {
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
        documents: true,
        legalRepresentative: true,
        verifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  },

  addVerificationRecord: async (kycId: string, input: KYCVerificationInput) => {
    return prisma.kYCVerification.create({
      data: {
        kycId,
        status: input.status,
        notes: input.notes,
        verifiedBy: input.verifiedBy,
        verifiedAt: input.verifiedAt,
      },
    });
  },
};
