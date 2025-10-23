import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const messageService = {
  // Get all conversations for the current user
  getConversations: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/conversations`, {
        withCredentials: true
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Get messages for a specific conversation
  getMessages: async (conversationId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/${conversationId}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (receiverId, content, images = null, sharedPost = null) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/messages/send`, {
        receiverId,
        content,
        images,
        sharedPost
      }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get unread message count
  getUnreadCount: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/unread-count`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Search users for starting new conversations
  searchUsers: async (query) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/search?query=${encodeURIComponent(query)}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/messages/${messageId}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  // Get connection status with another user
  getConnectionStatus: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/connect/${userId}/status`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching connection status:', error);
      throw error;
    }
  },

  // Send connection request
  sendConnectionRequest: async (userId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/connect/${userId}`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  },

  // Get connection statuses for multiple users
  getConnectionStatuses: async (userIds) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/connect/statuses`, {
        userIds
      }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching connection statuses:', error);
      throw error;
    }
  },

  // Get unread message counts for connections
  getUnreadCountsForConnections: async (connectionIds) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/messages/unread-counts-for-connections`, {
        connectionIds
      }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread counts for connections:', error);
      throw error;
    }
  }
};