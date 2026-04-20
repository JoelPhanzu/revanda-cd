import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';

type SenderType = 'USER' | 'VENDOR';

interface MessageRecord {
  id: string;
  conversationId: string;
  userId: string;
  vendorId: string;
  senderType: SenderType;
  content: string;
  createdAt: string;
}

const messagesRouter = Router();
const messages: MessageRecord[] = [];

messagesRouter.use(authMiddleware);

messagesRouter.post('/', requireRole(['USER', 'VENDOR', 'ADMIN']), (req, res) => {
  const { conversationId, userId, vendorId, senderType, content } = req.body as {
    conversationId?: string;
    userId?: string;
    vendorId?: string;
    senderType?: SenderType;
    content?: string;
  };

  if (!conversationId || !userId || !vendorId || !senderType || !content) {
    res.status(400).json({ message: 'conversationId, userId, vendorId, senderType and content are required' });
    return;
  }

  const message: MessageRecord = {
    id: `msg_${messages.length + 1}`,
    conversationId,
    userId,
    vendorId,
    senderType,
    content,
    createdAt: new Date().toISOString(),
  };

  messages.push(message);
  res.status(201).json(message);
});

messagesRouter.get('/conversation/:conversationId', requireRole(['USER', 'VENDOR', 'ADMIN']), (req, res) => {
  const { conversationId } = req.params;
  const conversation = messages.filter((item) => item.conversationId === conversationId);

  if (req.authUser?.role !== 'ADMIN') {
    const currentUserId = req.authUser?.id;
    const currentVendorId = req.authUser?.vendorId;
    const isParticipant = conversation.some(
      (message) => message.userId === currentUserId || message.vendorId === currentVendorId,
    );

    if (!isParticipant) {
      res.status(403).json({ message: 'access denied to this conversation' });
      return;
    }
  }

  res.json(conversation);
});

messagesRouter.get('/conversations', requireRole(['USER', 'VENDOR', 'ADMIN']), (req, res) => {
  const role = req.authUser?.role;
  const currentUserId = req.authUser?.id;
  const currentVendorId = req.authUser?.vendorId;

  const scopedMessages = messages.filter((message) => {
    if (role === 'USER') return message.userId === currentUserId;
    if (role === 'VENDOR') return message.vendorId === currentVendorId;
    return true;
  });

  const map = new Map<string, MessageRecord>();
  for (const message of scopedMessages) {
    const existing = map.get(message.conversationId);
    if (!existing || new Date(existing.createdAt) < new Date(message.createdAt)) {
      map.set(message.conversationId, message);
    }
  }

  res.json(Array.from(map.values()));
});

export default messagesRouter;
