import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MoreVertical } from 'lucide-react';
import { messageService } from '../services/messageService';
import { useAuthStore } from '../stores/authStore';

const Conversation = ({ user }) => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { fetchUnreadMessageCount } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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

    fetchConversation();
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
      const response = await messageService.sendMessage(conversationId, content);
      if (response.success) {
        // Add the new message to the local state
        setMessages(prev => [...prev, response.message]);
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

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  const defaultAvatar = "data:image/svg+xml;base64," + btoa(`
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" fill="#6B7280"/>
      <path d="M12 14c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" fill="#6B7280"/>
    </svg>
  `);

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
            <button
              onClick={() => navigate('/messages')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src={participant.avatar || defaultAvatar}
              alt={participant.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">{participant.name}</h1>
              <p className="text-sm text-gray-500 capitalize">{participant.role ? participant.role.replace('_', ' ') : 'User'}</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5" />
            </button>
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
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isCurrentUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}>
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

      {/* Message Input */}
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
    </div>
  );
};

export default Conversation;