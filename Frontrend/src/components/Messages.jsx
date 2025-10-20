import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Search, ArrowLeft } from 'lucide-react';
import { messageService } from '../services/messageService';
import { socketService } from '../services/socketService';
import { useAuthStore } from '../stores/authStore';
import { getLetterAvatar } from '../Utils/avatarUtils';

const Messages = ({ user }) => {
  const navigate = useNavigate();
  const { fetchUnreadMessageCount } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch conversations from API
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await messageService.getConversations();
        if (response.success) {
          setConversations(response.conversations);
          console.log(response.conversations);
        } else {
          setError('Failed to load conversations');
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations');
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
  }, [user._id]);

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
          setSearchResults(response.users);
          setShowSearchResults(true);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations or start new chat..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Search Results */}
        {showSearchResults && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 max-h-64 overflow-y-auto">
            {searchLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Searching users...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-gray-500 text-sm">No users found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleStartConversation(user._id)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
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
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {user.name}
                        </h3>
                      </div>
                      <MessageSquare className="w-4 h-4 text-blue-600" />
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading conversations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading conversations</h3>
              <p className="text-gray-500">{error}</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-500">Start a conversation by messaging someone from their profile</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
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
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {conversation.participant.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatTime(conversation.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-600 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                    <div className="flex items-center justify-end mt-2">
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
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