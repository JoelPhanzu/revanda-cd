import { Request, Response } from 'express';
import { AuthRequest } from '../types';

type MessageRecord = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
};

const messages: MessageRecord[] = [];

export const messageController = {
  send: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const newMessage: MessageRecord = {
      id: `msg_${Date.now()}`,
      conversationId: req.body.conversationId,
      senderId: req.user.userId,
      receiverId: req.body.receiverId,
      content: req.body.content,
      createdAt: new Date().toISOString(),
    };

    messages.push(newMessage);
    res.status(201).json(newMessage);
  },
  history: (req: Request, res: Response): void => {
    const result = messages.filter((message) => message.conversationId === req.params.conversationId);
    res.status(200).json(result);
  },
};
