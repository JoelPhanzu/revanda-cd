import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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
  passwordHash: string;
  companyName?: string;
};

const users: StoredUser[] = [];

const generateToken = (id: string, role: Role): string => {
  return jwt.sign({ userId: id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

const register = async (
  payload: RegisterCustomerInput | RegisterVendorInput,
  role: Role,
  companyName?: string,
): Promise<{ user: Omit<StoredUser, 'passwordHash'>; token: string }> => {
  if (users.some((user) => user.email === payload.email)) {
    throw new Error('Email already exists');
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const newUser: StoredUser = {
    id: `usr_${Date.now()}`,
    email: payload.email,
    fullName: payload.fullName,
    role,
    passwordHash,
    companyName,
  };

  users.push(newUser);

  const { passwordHash: _, ...safeUser } = newUser;
  return { user: safeUser, token: generateToken(newUser.id, newUser.role) };
};

export const authService = {
  registerVendor: async (payload: RegisterVendorInput) => register(payload, 'VENDOR', payload.companyName),
  registerCustomer: async (payload: RegisterCustomerInput) => register(payload, 'CUSTOMER'),
  login: async (payload: LoginInput): Promise<{ user: Omit<StoredUser, 'passwordHash'>; token: string }> => {
    const user = users.find((entry) => entry.email === payload.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token: generateToken(user.id, user.role) };
  },
  refreshToken: (userId: string, role: Role): string => generateToken(userId, role),
};
