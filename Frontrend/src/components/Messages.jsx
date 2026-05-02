import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Search, ArrowLeft, UserPlus, Clock, UserCheck } from 'lucide-react';
import { messageService } from '../services/messageService';
import { socketService } from '../services/socketService';
import { useAuthStore } from '../stores/authStore';
import { getLetterAvatar } from '../Utils/avatarUtils';
import toast from 'react-hot-toast';

const Messages = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUnreadMessageCount } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [connectionStatuses, setConnectionStatuses] = useState({});

  // Handle selectedUserId from navigation state
  useEffect(() => {
    const selectedUserId = location.state?.selectedUserId;
    if (selectedUserId && user?._id) {
      // Find existing conversation or create new one
      const findOrCreateConversation = async () => {
        try {
          const response = await messageService.getConversations();
          if (response.success) {
            const existingConversation = response.conversations?.find(
              conv => conv.participant._id === selectedUserId
            );
            
            if (existingConversation) {
              // Navigate to existing conversation
              navigate(`/messages/${existingConversation.id}`, { replace: true });
            } else {
              // Create new conversation by sending a message
              navigate(`/messages/${selectedUserId}`, { replace: true });
            }
          }
        } catch (error) {
          console.error('Error handling selected user:', error);
          // If there's an error, just stay on messages page
        }
      };
      
      findOrCreateConversation();
    }
  }, [location.state?.selectedUserId, user?._id, navigate]);

  // Fetch conversations from API
  useEffect(() => {
    if (!user?._id) {
      console.log('User not available yet, skipping conversation fetch');
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch conversations for user:', user._id);
        const response = await messageService.getConversations();
        console.log('getConversations response:', response);
        if (response.success) {
          setConversations(response.conversations || []);
          console.log('Conversations loaded:', response.conversations?.length || 0);
        } else {
          setError('Failed to load conversations');
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });
        setError(`Failed to load conversations: ${err.response?.status || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    const fetchConversationsWrapper = () => fetchConversations();

    fetchConversationsWrapper();

    // Connect to socket for real-time updates
    socketService.connect(user._id);

    // Listen for new messages to update conversation list
    socketService.onReceiveMessage((message) => {
      // Update conversation list when receiving new messages
      setConversations(prev => {
        const updatedConversations = [...prev];
        const conversationIndex = updatedConversations.findIndex(conv =>
          conv.participant._id === message.sender._id || conv.participant._id === message.receiver._id
        );

        if (conversationIndex !== -1) {
          // Update existing conversation
          updatedConversations[conversationIndex].lastMessage = message.content;
          updatedConversations[conversationIndex].timestamp = message.createdAt;
          updatedConversations[conversationIndex].unreadCount += 1;
        } else {
          // This shouldn't happen as conversations are created when sending first message
          // But just in case, we could add logic here
        }

        // Sort by timestamp
        return updatedConversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });
    });

    socketService.onMessageDeleted((messageId) => {
      // Refresh conversations when a message is deleted
      fetchConversationsWrapper();
      fetchUnreadMessageCount(); // Refresh unread count
    });

    // Cleanup
    return () => {
      socketService.removeAllListeners();
    };
  }, [user]);

  const filteredConversations = conversations.filter(convo =>
    convo.participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 0) {
      setSearchLoading(true);
      try {
        const response = await messageService.searchUsers(value.trim());
        if (response.success) {
          // Fetch connection statuses for all search results first
          const statuses = {};
          const connectedUsers = [];
          
          for (const user of response.users) {
            try {
              const statusResponse = await messageService.getConnectionStatus(user._id);
              if (statusResponse.success) {
                statuses[user._id] = statusResponse.status;
                // Only include connected users in search results
                if (statusResponse.status === 'connected') {
                  connectedUsers.push(user);
                }
              }
            } catch (statusErr) {
              console.error('Error fetching connection status for user:', user._id, statusErr);
              statuses[user._id] = 'not_connected';
            }
          }
          
          setSearchResults(connectedUsers);
          setShowSearchResults(true);
          setConnectionStatuses(statuses);
        }
      } catch (err) {
        console.error('Error searching users:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
      setConnectionStatuses({});
    }
  };

  // Handle starting a new conversation
  const handleStartConversation = (userId) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(convo => convo.id === userId);
    if (existingConversation) {
      // Navigate to existing conversation
      navigate(`/messages/${userId}`);
    } else {
      // Start new conversation
      navigate(`/messages/${userId}`);
    }
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleConnect = async (userId) => {
    try {
      const response = await messageService.sendConnectionRequest(userId);
      if (response.success) {
        toast.success('Connection request sent!');
        // Update the connection status
        setConnectionStatuses(prev => ({
          ...prev,
          [userId]: 'pending'
        }));
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    if (isNaN(messageDate)) return 'Unknown';
    const diff = now - messageDate;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleConversationClick = (conversationId) => {
    navigate(`/messages/${conversationId}`);
  };

// Removed defaultAvatar as we now use getLetterAvatar utility

  return (
    <div className="p-4 lg:p-8 min-h-screen">
      {/* Banner Section */}
      <div className="mb-10 bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-purple-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-4 bg-purple-500/20 backdrop-blur-sm rounded-2xl">
              <MessageSquare className="w-10 h-10 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">Messages</h1>
              <p className="text-lg text-purple-200">Connect and communicate with your network</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations or start new chat..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-purple-500/30 rounded-xl bg-white/10 backdrop-blur-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Search Results */}
        {showSearchResults && (
          <div className="mb-8 bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl max-h-64 overflow-y-auto">
            {searchLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto mb-2"></div>
                <p className="text-purple-200 text-sm">Searching users...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-purple-200 text-sm">No connected users found</p>
                <p className="text-purple-300 text-xs mt-1">You can only message users you're connected with</p>
              </div>
            ) : (
              <div className="divide-y divide-purple-500/20">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="p-4 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => handleStartConversation(user._id)}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar || getLetterAvatar(user.name)}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = getLetterAvatar(user.name);
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{user.name}</h3>
                        <p className="text-sm text-purple-200 capitalize">
                          {user.role?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conversations List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-purple-200">Loading conversations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="p-4 bg-purple-500/20 backdrop-blur-sm rounded-full w-fit mx-auto mb-4">
                <MessageSquare className="w-16 h-16 text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Error loading conversations</h3>
              <p className="text-purple-200">{error}</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-purple-500/20 backdrop-blur-sm rounded-full w-fit mx-auto mb-4">
                <MessageSquare className="w-16 h-16 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No conversations yet</h3>
              <p className="text-purple-200">Start a conversation by messaging someone from their profile</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className="bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-400/40 transform hover:-translate-y-1 p-6 cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={conversation.participant.avatar || getLetterAvatar(conversation.participant.name)}
                    alt={conversation.participant.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = getLetterAvatar(conversation.participant.name);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {conversation.participant.name}
                      </h3>
                      <span className="text-sm text-purple-300">
                        {formatTime(conversation.timestamp)}
                      </span>
                    </div>
                    <p className="text-purple-100 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                    <div className="flex items-center justify-end mt-2">
                      {conversation.unreadCount > 0 && (
                        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;