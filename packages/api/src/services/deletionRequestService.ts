import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { auditLogService } from './auditLogService';

type DeletableEntityType = 'User' | 'Product' | 'Order' | 'Vendor';

const normalizeEntityType = (entityType: string): DeletableEntityType => {
  const normalized = entityType.trim().toLowerCase();
  switch (normalized) {
    case 'user':
      return 'User';
    case 'product':
      return 'Product';
    case 'order':
      return 'Order';
    case 'vendor':
      return 'Vendor';
    default:
      throw new AppError('Unsupported entity type for deletion request', 400);
  }
};

const ensureSuperAdmin = async (userId: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new AppError('Only SUPER_ADMIN can approve or reject deletion requests', 403);
  }
};

type PrismaExecutor = Prisma.TransactionClient | typeof prisma;

const getEntity = async (client: PrismaExecutor, entityType: DeletableEntityType, entityId: string) => {
  switch (entityType) {
    case 'User':
      return client.user.findUnique({ where: { id: entityId } });
    case 'Product':
      return client.product.findUnique({ where: { id: entityId } });
    case 'Order':
      return client.order.findUnique({ where: { id: entityId } });
    case 'Vendor':
      return client.vendor.findUnique({ where: { id: entityId } });
  }
};

const softDeleteEntity = async (client: PrismaExecutor, entityType: DeletableEntityType, entityId: string, deletedBy: string) => {
  const now = new Date();
  const data = {
    isDeleted: true,
    deletedAt: now,
    deletedBy,
  };

  switch (entityType) {
    case 'User':
      return client.user.update({ where: { id: entityId }, data });
    case 'Product':
      return client.product.update({ where: { id: entityId }, data });
    case 'Order':
      return client.order.update({ where: { id: entityId }, data });
    case 'Vendor':
      return client.vendor.update({ where: { id: entityId }, data });
  }
};

export const deletionRequestService = {
  submitDeletionRequest: async (entityType: string, entityId: string, userId: string, reason?: string) => {
    const resolvedEntityType = normalizeEntityType(entityType);
    const entity = await getEntity(prisma, resolvedEntityType, entityId);

    if (!entity) {
      throw new AppError(`${resolvedEntityType} not found`, 404);
    }

    if ('isDeleted' in entity && entity.isDeleted) {
      throw new AppError(`${resolvedEntityType} is already deleted`, 400);
    }

    const existingPending = await prisma.deletionRequest.findFirst({
      where: {
        entityType: resolvedEntityType,
        entityId,
        status: 'PENDING',
      },
    });

    if (existingPending) {
      throw new AppError('A pending deletion request already exists for this entity', 409);
    }

    const request = await prisma.deletionRequest.create({
      data: {
        entityType: resolvedEntityType,
        entityId,
        requestedBy: userId,
        requestReason: reason,
      },
    });

    await auditLogService.log('REQUEST_DELETION', resolvedEntityType, entityId, userId, undefined, { reason });

    return request;
  },

  approveDeletionRequest: async (requestId: string, superAdminId: string) => {
    await ensureSuperAdmin(superAdminId);

    const request = await prisma.deletionRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new AppError('Deletion request not found', 404);
    }

    if (request.status !== 'PENDING') {
      throw new AppError('Only pending deletion requests can be approved', 400);
    }

    const resolvedEntityType = normalizeEntityType(request.entityType);
    const previousEntity = await getEntity(prisma, resolvedEntityType, request.entityId);

    if (!previousEntity) {
      throw new AppError(`${resolvedEntityType} not found`, 404);
    }

    await prisma.$transaction(async (tx) => {
      await softDeleteEntity(tx, resolvedEntityType, request.entityId, superAdminId);

      await tx.deletionRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          approvedBy: superAdminId,
          approvedAt: new Date(),
          rejectionReason: null,
          rejectedAt: null,
        },
      });
    });

    await auditLogService.log(
      'APPROVE_DELETION',
      resolvedEntityType,
      request.entityId,
      superAdminId,
      { previousEntity },
      { isDeleted: true, deletedBy: superAdminId },
      { requestId },
    );

    return prisma.deletionRequest.findUnique({ where: { id: requestId } });
  },

  rejectDeletionRequest: async (requestId: string, superAdminId: string, reason: string) => {
    await ensureSuperAdmin(superAdminId);

    const request = await prisma.deletionRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new AppError('Deletion request not found', 404);
    }

    if (request.status !== 'PENDING') {
      throw new AppError('Only pending deletion requests can be rejected', 400);
    }

    const updatedRequest = await prisma.deletionRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        approvedBy: null,
        rejectionReason: reason,
        rejectedAt: new Date(),
      },
    });

    await auditLogService.log(
      'REJECT_DELETION',
      request.entityType,
      request.entityId,
      superAdminId,
      undefined,
      { reason },
      { requestId },
    );

    return updatedRequest;
  },

  getPendingDeletionRequests: async (superAdminId: string) => {
    await ensureSuperAdmin(superAdminId);

    return prisma.deletionRequest.findMany({
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

  getDeletionHistory: async (entityType: string, entityId: string) => {
    const resolvedEntityType = normalizeEntityType(entityType);

    return prisma.deletionRequest.findMany({
      where: {
        entityType: resolvedEntityType,
        entityId,
      },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
        approver: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
