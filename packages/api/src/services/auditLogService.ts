import { prisma } from '../config/prisma';

type Serializable = Record<string, unknown> | undefined;

const serialize = (value?: Serializable): string | undefined => {
  if (!value) {
    return undefined;
  }

  return JSON.stringify(value);
};

export const auditLogService = {
  log: async (
    action: string,
    entityType: string,
    entityId: string,
    performedBy: string,
    oldValues?: Serializable,
    newValues?: Serializable,
    metadata?: Serializable,
    result = 'SUCCESS',
    failureReason?: string,
  ) => {
    return prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        performedBy,
        oldValues: serialize(oldValues),
        newValues: serialize(newValues),
        metadata: serialize(metadata),
        result,
        failureReason,
      },
    });
  },

  getEntityHistory: async (entityType: string, entityId: string, limit = 50) => {
    return prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  getUserActions: async (userId: string, limit = 50) => {
    return prisma.auditLog.findMany({
      where: { performedBy: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  exportAuditTrail: async (filters: {
    startDate?: Date;
    endDate?: Date;
    entityType?: string;
    performedBy?: string;
  }) => {
    return prisma.auditLog.findMany({
      where: {
        entityType: filters.entityType,
        performedBy: filters.performedBy,
        createdAt:
          filters.startDate || filters.endDate
            ? {
                gte: filters.startDate,
                lte: filters.endDate,
              }
            : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
