import { Router } from 'express';
import { authMiddleware, AuthRole } from '../middleware/auth';

interface AuthAccount {
  id: string;
  email: string;
  password: string;
  role: AuthRole;
  vendorId?: string;
}

const authRouter = Router();

const accounts: AuthAccount[] = [];

authRouter.post('/register', (req, res) => {
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

  const account: AuthAccount = { id, email, password, role: normalizedRole, vendorId };
  accounts.push(account);

  res.status(201).json({
    id: account.id,
    email: account.email,
    role: account.role,
    vendorId: account.vendorId,
  });
});

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  const account = accounts.find((item) => item.email === email && item.password === password);
  if (!account) {
    res.status(401).json({ message: 'invalid credentials' });
    return;
  }

  res.json({
    token: `token-${account.id}`,
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
