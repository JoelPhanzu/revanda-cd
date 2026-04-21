import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role, LoginInput, RegisterCustomerInput, RegisterVendorInput } from '../types';
import { prisma } from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  name: string;
  role: Role;
  companyName?: string;
};

const generateToken = (id: string, role: Role): string =>
  jwt.sign({ userId: id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

const toAuthUser = (user: {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  vendorProfile?: { companyName: string } | null;
}): AuthUser => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  name: user.fullName,
  role: user.role,
  companyName: user.vendorProfile?.companyName,
});

const register = async (
  payload: RegisterCustomerInput | RegisterVendorInput,
  role: Role,
  companyName?: string,
): Promise<{ user: AuthUser; token: string }> => {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new Error('Email already exists');
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);

  const safeUserRecord = await prisma.user.create({
    data: {
      email: payload.email,
      passwordHash,
      fullName: payload.fullName,
      role,
      vendorProfile: role === 'VENDOR' && companyName
        ? {
            create: {
              companyName,
            },
          }
        : undefined,
    },
    include: { vendorProfile: true },
  });

  const safeUser = toAuthUser(safeUserRecord);
  return { user: safeUser, token: generateToken(safeUser.id, safeUser.role) };
};

export const authService = {
  registerVendor: async (payload: RegisterVendorInput) => register(payload, 'VENDOR', payload.companyName),
  registerCustomer: async (payload: RegisterCustomerInput) => register(payload, 'CUSTOMER'),
  login: async (payload: LoginInput): Promise<{ user: AuthUser; token: string }> => {
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      include: { vendorProfile: true },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const safeUser = toAuthUser(user);
    return { user: safeUser, token: generateToken(user.id, user.role as Role) };
  },
  refreshToken: (userId: string, role: Role): string => generateToken(userId, role),
};
