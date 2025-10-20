import express from 'express';
import { getConversations, getMessages, sendMessage, getUnreadCount } from '../controller/messageController.js';
import isAuthenticated from '../config/auth.js';

const router = express.Router();

// All message routes require authentication
router.get('/conversations', isAuthenticated, getConversations);
router.get('/unread-count', isAuthenticated, getUnreadCount);
router.get('/:conversationId', isAuthenticated, getMessages);
router.post('/send', isAuthenticated, sendMessage);

export default router;