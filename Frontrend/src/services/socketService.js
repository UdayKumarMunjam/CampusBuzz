import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8080';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.isConnected = true;
      this.socket.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Send a message via socket
  sendMessage(senderId, receiverId, content) {
    if (this.socket && this.isConnected) {
      this.socket.emit('sendMessage', {
        senderId,
        receiverId,
        content
      });
    }
  }

  // Delete a message via socket
  deleteMessage(messageId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('deleteMessage', {
        messageId,
        userId
      });
    }
  }

  // Listen for incoming messages
  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receiveMessage', callback);
    }
  }

  // Listen for message sent confirmation
  onMessageSent(callback) {
    if (this.socket) {
      this.socket.on('messageSent', callback);
    }
  }

  // Listen for message deletion
  onMessageDeleted(callback) {
    if (this.socket) {
      this.socket.on('messageDeleted', callback);
    }
  }

  // Listen for errors
  onMessageError(callback) {
    if (this.socket) {
      this.socket.on('messageError', callback);
    }
  }

  onDeleteError(callback) {
    if (this.socket) {
      this.socket.on('deleteError', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketService = new SocketService();