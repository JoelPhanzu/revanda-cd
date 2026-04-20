import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authMiddleware, AuthRole, getJwtSecret } from '../middleware/auth';

interface AuthAccount {
  id: string;
  email: string;
  passwordHash: string;
  role: AuthRole;
  vendorId?: string;
}

const authRouter = Router();

const accounts: AuthAccount[] = [];
const DUMMY_PASSWORD_HASH_PROMISE = bcrypt.hash('dummy-password', 10);
authRouter.post('/register', async (req, res) => {
  const { email, password, role = 'USER' } = req.body as {
    email?: string;
    password?: string;
    role?: AuthRole;
  };

  if (!email || !password) {
    res.status(400).json({ message: 'email and password are required' });
    return;
  }

  if (accounts.some((account) => account.email === email)) {
    res.status(409).json({ message: 'account already exists' });
    return;
  }

  const id = `usr_${accounts.length + 1}`;
  const normalizedRole: AuthRole = role === 'ADMIN' || role === 'VENDOR' ? role : 'USER';
  const vendorId = normalizedRole === 'VENDOR' ? `vnd_${id}` : undefined;
  const passwordHash = await bcrypt.hash(password, 10);

  const account: AuthAccount = { id, email, passwordHash, role: normalizedRole, vendorId };
  accounts.push(account);

  res.status(201).json({
    id: account.id,
    email: account.email,
    role: account.role,
    vendorId: account.vendorId,
  });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  const account = accounts.find((item) => item.email === email);
  const passwordHash = account?.passwordHash ?? (await DUMMY_PASSWORD_HASH_PROMISE);
  const isValidPassword = await bcrypt.compare(password ?? '', passwordHash);

  if (!account || !password || !isValidPassword) {
    res.status(401).json({ message: 'invalid credentials' });
    return;
  }

  const token = jwt.sign(
    {
      sub: account.id,
      role: account.role,
      vendorId: account.vendorId,
    },
    getJwtSecret(),
    { expiresIn: '1h' },
  );

  res.json({
    token,
    user: {
      id: account.id,
      email: account.email,
      role: account.role,
      vendorId: account.vendorId,
    },
  });
});

authRouter.post('/logout', (_req, res) => {
  res.status(200).json({ message: 'logged out' });
});

authRouter.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.authUser });
});

export default authRouter;
