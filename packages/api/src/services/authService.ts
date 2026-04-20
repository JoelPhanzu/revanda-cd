import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { LoginInput, RegisterCustomerInput, RegisterVendorInput, Role } from '../types';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

type StoredUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  companyName?: string;
};

const generateToken = (id: string, role: Role): string => {
  return jwt.sign({ userId: id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

const toPrismaRole = (role: Role): Role => role;

const toSafeUser = (user: {
  id: string;
  email: string;
  fullName: string;
  role: string;
  vendorProfile?: { companyName: string } | null;
}): StoredUser => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  role: user.role as Role,
  companyName: user.vendorProfile?.companyName,
});

const register = async (
  payload: RegisterCustomerInput | RegisterVendorInput,
  role: Role,
  companyName?: string,
): Promise<{ user: StoredUser; token: string }> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new Error('Email already exists');
  }

  if (role === 'VENDOR' && !companyName) {
    throw new Error('Company name is required for vendor registration');
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const newUser = await prisma.user.create({
    data: {
      email: payload.email,
      fullName: payload.fullName,
      passwordHash,
      role: toPrismaRole(role),
      ...(role === 'VENDOR' && companyName
        ? {
            vendorProfile: {
              create: {
                companyName,
              },
            },
          }
        : {}),
    },
    include: {
      vendorProfile: {
        select: {
          companyName: true,
        },
      },
    },
  });

  const safeUser = toSafeUser(newUser);
  return { user: safeUser, token: generateToken(newUser.id, safeUser.role) };
};

export const authService = {
  register: async (payload: RegisterCustomerInput & { role?: string; companyName?: string }) => {
    const role = (payload.role || 'CUSTOMER').toUpperCase();
    if (role === 'VENDOR') {
      return register(payload, 'VENDOR', payload.companyName);
    }
    return register(payload, 'CUSTOMER');
  },
  registerVendor: async (payload: RegisterVendorInput) => register(payload, 'VENDOR', payload.companyName),
  registerCustomer: async (payload: RegisterCustomerInput) => register(payload, 'CUSTOMER'),
  login: async (payload: LoginInput): Promise<{ user: StoredUser; token: string }> => {
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      include: {
        vendorProfile: {
          select: {
            companyName: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const safeUser = toSafeUser(user);
    return { user: safeUser, token: generateToken(user.id, safeUser.role) };
  },
  getCurrentUser: async (userId: string): Promise<StoredUser | null> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        vendorProfile: {
          select: {
            companyName: true,
          },
        },
      },
    });

    return user ? toSafeUser(user) : null;
  },
  refreshToken: (userId: string, role: Role): string => generateToken(userId, role),
};
