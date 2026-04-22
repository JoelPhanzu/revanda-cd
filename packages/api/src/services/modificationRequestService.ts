import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { auditLogService } from './auditLogService';

type ModifiableEntityType = 'Product' | 'Vendor' | 'User';

const normalizeEntityType = (entityType: string): ModifiableEntityType => {
  const normalized = entityType.trim().toLowerCase();
  switch (normalized) {
    case 'product':
      return 'Product';
    case 'vendor':
      return 'Vendor';
    case 'user':
      return 'User';
    default:
      throw new AppError('Unsupported entity type for modification request', 400);
  }
};

const ensureSuperAdmin = async (userId: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new AppError('Only SUPER_ADMIN can approve or reject modification requests', 403);
  }
};

const getEntity = async (entityType: ModifiableEntityType, entityId: string) => {
  switch (entityType) {
    case 'Product':
      return prisma.product.findUnique({ where: { id: entityId } });
    case 'Vendor':
      return prisma.vendor.findUnique({ where: { id: entityId } });
    case 'User':
      return prisma.user.findUnique({ where: { id: entityId } });
  }
};

const applyModification = async (entityType: ModifiableEntityType, entityId: string, fieldName: string, value: unknown) => {
  const data = { [fieldName]: value } as Record<string, unknown>;

  switch (entityType) {
    case 'Product':
      return prisma.product.update({ where: { id: entityId }, data });
    case 'Vendor':
      return prisma.vendor.update({ where: { id: entityId }, data });
    case 'User':
      return prisma.user.update({ where: { id: entityId }, data });
  }
};

const parseValue = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const modificationRequestService = {
  submitModificationRequest: async (
    entityType: string,
    entityId: string,
    fieldName: string,
    providedOldValue: string,
    newValue: string,
    userId: string,
  ) => {
    if (['id', 'createdAt', 'updatedAt', 'deletedAt', 'deletedBy'].includes(fieldName)) {
      throw new AppError('This field cannot be modified through the approval workflow', 400);
    }

    const resolvedEntityType = normalizeEntityType(entityType);
    const entity = await getEntity(resolvedEntityType, entityId);

    if (!entity) {
      throw new AppError(`${resolvedEntityType} not found`, 404);
    }

    if (!(fieldName in entity)) {
      throw new AppError(`Field ${fieldName} does not exist on ${resolvedEntityType}`, 400);
    }

    const oldFieldValue = providedOldValue ?? JSON.stringify((entity as Record<string, unknown>)[fieldName] ?? null);

    const request = await prisma.modificationRequest.create({
      data: {
        entityType: resolvedEntityType,
        entityId,
        fieldName,
        oldValue: oldFieldValue,
        newValue,
        requestedBy: userId,
      },
    });

    await auditLogService.log(
      'REQUEST_MODIFICATION',
      resolvedEntityType,
      entityId,
      userId,
      { [fieldName]: parseValue(oldFieldValue) },
      { [fieldName]: parseValue(newValue) },
      { requestId: request.id },
    );

    return request;
  },

  approveModificationRequest: async (requestId: string, superAdminId: string) => {
    await ensureSuperAdmin(superAdminId);

    const request = await prisma.modificationRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new AppError('Modification request not found', 404);
    }

    if (request.status !== 'PENDING') {
      throw new AppError('Only pending modification requests can be approved', 400);
    }

    const resolvedEntityType = normalizeEntityType(request.entityType);
    const before = await getEntity(resolvedEntityType, request.entityId);
    if (!before) {
      throw new AppError(`${resolvedEntityType} not found`, 404);
    }

    const parsedNewValue = parseValue(request.newValue);
    await applyModification(resolvedEntityType, request.entityId, request.fieldName, parsedNewValue);

    const updatedRequest = await prisma.modificationRequest.update({
      where: { id: request.id },
      data: {
        status: 'APPROVED',
        approvedBy: superAdminId,
        approvedAt: new Date(),
        rejectionReason: null,
      },
    });

    await auditLogService.log(
      'APPROVE_MODIFICATION',
      resolvedEntityType,
      request.entityId,
      superAdminId,
      { [request.fieldName]: parseValue(request.oldValue || 'null') },
      { [request.fieldName]: parsedNewValue },
      { requestId },
    );

    return updatedRequest;
  },

  rejectModificationRequest: async (requestId: string, superAdminId: string, reason: string) => {
    await ensureSuperAdmin(superAdminId);

    const request = await prisma.modificationRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new AppError('Modification request not found', 404);
    }

    if (request.status !== 'PENDING') {
      throw new AppError('Only pending modification requests can be rejected', 400);
    }

    const updatedRequest = await prisma.modificationRequest.update({
      where: { id: request.id },
      data: {
        status: 'REJECTED',
        approvedBy: null,
        rejectionReason: reason,
      },
    });

    await auditLogService.log(
      'REJECT_MODIFICATION',
      request.entityType,
      request.entityId,
      superAdminId,
      { [request.fieldName]: parseValue(request.oldValue || 'null') },
      { [request.fieldName]: parseValue(request.newValue) },
      { requestId, reason },
    );

    return updatedRequest;
  },

  getPendingModifications: async (superAdminId: string) => {
    await ensureSuperAdmin(superAdminId);

    return prisma.modificationRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  },
};
