import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MoreVertical, Trash2, X } from 'lucide-react';
import { messageService } from '../services/messageService';
import { socketService } from '../services/socketService';
import { useAuthStore } from '../stores/authStore';
import { getLetterAvatar } from '../Utils/avatarUtils';
import toast from 'react-hot-toast';

const Conversation = ({ user }) => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { fetchUnreadMessageCount } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch conversation messages and participant details
  useEffect(() => {
    const fetchConversation = async () => {
      if (!conversationId) return;

      setLoading(true);
      try {
        // Fetch messages for this conversation
        const messagesResponse = await messageService.getMessages(conversationId);
        if (messagesResponse.success) {
          setMessages(messagesResponse.messages);
          // Refresh unread count after viewing messages (they get marked as read)
          await fetchUnreadMessageCount();
        }

        // Determine participant (the other user in the conversation)
        // Since messages contain sender/receiver info, we can get participant from the first message
        if (messagesResponse.messages && messagesResponse.messages.length > 0) {
          const firstMessage = messagesResponse.messages[0];
          const participantData = firstMessage.sender._id === user._id
            ? firstMessage.receiver
            : firstMessage.sender;
          setParticipant(participantData);
        } else {
          // If no messages yet, we need to fetch user details for the conversationId
          // This happens when starting a new conversation
          try {
            const userResponse = await fetch(`http://localhost:8080/api/user/profile/${conversationId}`, {
              credentials: 'include'
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setParticipant(userData.user);
            }
          } catch (err) {
            console.error('Error fetching participant details:', err);
          }
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchConversationWrapper = () => fetchConversation();

    fetchConversationWrapper();

    // Connect to socket when component mounts
    socketService.connect(user._id);

    // Set up socket listeners
    socketService.onReceiveMessage((message) => {
      // Only add message if it's for this conversation
      if ((message.sender._id === conversationId || message.receiver._id === conversationId)) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg._id === message._id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }
    });

    // Remove the messageSent listener since we're handling it via HTTP response
    // socketService.onMessageSent((message) => {
    //   console.log('Message sent confirmation:', message);
    // });

    socketService.onMessageDeleted((messageId) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    socketService.onMessageError((error) => {
      console.error('Message error:', error);
    });

    socketService.onDeleteError((error) => {
      console.error('Delete error:', error);
      // If there's a delete error, refresh the messages to ensure UI is in sync
      fetchConversationWrapper();
    });

    // Cleanup function
    return () => {
      socketService.removeAllListeners();
    };
  }, [conversationId, user._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Send via HTTP first to get the complete message object
      const response = await messageService.sendMessage(conversationId, content);
      if (response.success) {
        // Add message immediately to UI
        setMessages(prev => [...prev, response.message]);

        // Also send via socket for real-time delivery to other users
        socketService.sendMessage(user._id, conversationId, content);

        console.log('Message sent successfully');
      } else {
        // If sending failed, restore the message
        setNewMessage(content);
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // If sending failed, restore the message
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const handleMessageClick = (messageId) => {
    if (isSelectionMode) {
      setSelectedMessages(prev => {
        const newSet = new Set(prev);
        if (newSet.has(messageId)) {
          newSet.delete(messageId);
          if (newSet.size === 0) {
            setIsSelectionMode(false);
          }
        } else {
          newSet.add(messageId);
        }
        return newSet;
      });
    } else {
      // Enter selection mode on first click
      setIsSelectionMode(true);
      setSelectedMessages(new Set([messageId]));
    }
  };

  const handleDeleteMessages = async () => {
    if (selectedMessages.size === 0) return;

    try {
      // Delete via HTTP first to ensure it works
      for (const messageId of selectedMessages) {
        try {
          const response = await messageService.deleteMessage(messageId);
          if (response.success) {
            // Remove from local state immediately
            setMessages(prev => prev.filter(msg => msg._id !== messageId));

            // Also notify via socket for real-time updates to other users
            socketService.deleteMessage(messageId, user._id);
          } else {
            console.error('Failed to delete message:', messageId, response);
          }
        } catch (messageError) {
          console.error('Error deleting individual message:', messageId, messageError);
          // Continue with other messages even if one fails
        }
      }

      // Reset selection mode
      setSelectedMessages(new Set());
      setIsSelectionMode(false);
      setShowDeleteConfirm(false);

      // Show success toast
      toast.success('Messages deleted successfully');
    } catch (error) {
      console.error('Error deleting messages:', error);
    }
  };

  const cancelSelection = () => {
    setSelectedMessages(new Set());
    setIsSelectionMode(false);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (timestamp) => {
    const today = new Date();
    const messageDate = new Date(timestamp);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString();
  };

// Removed defaultAvatar as we now use getLetterAvatar utility

  if (loading || !participant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            {isSelectionMode ? (
              <>
                <button
                  onClick={cancelSelection}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h1 className="text-lg font-semibold text-gray-900">
                    {selectedMessages.size} selected
                  </h1>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  disabled={selectedMessages.size === 0}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/messages')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img
                  src={participant.avatar || getLetterAvatar(participant.name)}
                  alt={participant.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = getLetterAvatar(participant.name);
                  }}
                />
                <div className="flex-1">
                  <h1 className="text-lg font-semibold text-gray-900">{participant.name}</h1>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser = message.sender._id === user._id;
            const showDate = index === 0 || formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

            return (
              <div key={message._id}>
                {showDate && (
                  <div className="text-center my-4">
                    <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedMessages.has(message._id)
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : ''
                    } ${
                      isCurrentUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                    onClick={() => handleMessageClick(message._id)}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(new Date(message.createdAt))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Messages</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedMessages.size} message{selectedMessages.size > 1 ? 's' : ''}?
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMessages}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      {!isSelectionMode && (
        <div className="bg-white border-t border-gray-200 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{sending ? 'Sending...' : 'Send'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversation;