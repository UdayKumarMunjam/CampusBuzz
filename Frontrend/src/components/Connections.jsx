import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserCheck, UserPlus, Clock, X, Check, MessageCircle } from 'lucide-react';
import { getLetterAvatar } from '../Utils/avatarUtils';
import { useAuthStore } from '../stores/authStore';
import { messageService } from '../services/messageService';
import { useNavigate } from 'react-router-dom';

export default function Connections() {
  const { user } = useAuthStore();
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('connections');
  const [unreadCounts, setUnreadCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchConnections();
    fetchRequests();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/user/${user._id}/connections`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setConnections(response.data.connections);
        // Fetch unread counts for connections
        if (response.data.connections.length > 0) {
          fetchUnreadCounts(response.data.connections);
        }
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    }
  };

  const fetchUnreadCounts = async (connectionsList) => {
    try {
      const connectionIds = connectionsList.map(conn => conn.user._id);
      const response = await messageService.getUnreadCountsForConnections(connectionIds);
      if (response.success) {
        setUnreadCounts(response.unreadCounts);
      }
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      // Don't show toast error for unread counts as it's not critical
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/user/connections/requests',
        { withCredentials: true }
      );
      if (response.data.success) {
        setRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load connection requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/user/connect/${userId}/accept`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Connection request accepted!');
        fetchConnections();
        fetchRequests();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept connection request');
    }
  };

  const handleDeclineRequest = async (userId) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/user/connect/${userId}/decline`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Connection request declined');
        fetchRequests();
      }
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline connection request');
    }
  };

  const handleMessageClick = (userId) => {
    // Navigate directly to messages without any alerts
    navigate('/messages', { state: { selectedUserId: userId } });
  };

  const handleDisconnect = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to disconnect from ${userName}?`)) {
      try {
        const response = await axios.post(
          `http://localhost:8080/api/user/connect/${userId}/disconnect`,
          {},
          { withCredentials: true }
        );

        if (response.data.success) {
          toast.success('Connection removed successfully');
          fetchConnections();
        }
      } catch (error) {
        console.error('Error disconnecting:', error);
        toast.error('Failed to disconnect');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Connections</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your professional network</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('connections')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'connections'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          My Connections ({connections.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'requests'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Requests ({requests.length})
        </button>
      </div>

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div>
          {connections.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No connections yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Start building your network by connecting with others</p>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map((connection) => (
                <div
                  key={connection._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    {/* Left side - User info */}
                    <div className="flex items-center space-x-4 flex-1">
                      <img
                        src={connection.user.avatar || getLetterAvatar(connection.user.name)}
                        alt={connection.user.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        onError={(e) => {
                          e.target.src = getLetterAvatar(connection.user.name);
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                          {connection.user.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {connection.user.role.replace('_', ' ')}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          <UserCheck size={14} className="text-green-500" />
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Connected {connection.connectedAt ? new Date(connection.connectedAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Action badges */}
                    <div className="flex items-center space-x-3">
                      {/* Message Badge */}
                      <button
                        onClick={() => handleMessageClick(connection.user._id)}
                        className="relative flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium"
                        title="Send message"
                      >
                        <MessageCircle size={18} />
                        <span className="text-sm">Message</span>
                        {unreadCounts[connection.user._id] > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                            {unreadCounts[connection.user._id] > 99 ? '99+' : unreadCounts[connection.user._id]}
                          </span>
                        )}
                      </button>

                      {/* Disconnect Badge */}
                      <button
                        onClick={() => handleDisconnect(connection.user._id, connection.user.name)}
                        className="flex items-center bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
                        title="Disconnect"
                      >
                        <span className="text-sm">Disconnect</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending requests</h3>
              <p className="text-gray-600 dark:text-gray-400">Connection requests from others will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={request.user.avatar || getLetterAvatar(request.user.name)}
                        alt={request.user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        onError={(e) => {
                          e.target.src = getLetterAvatar(request.user.name);
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {request.user.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {request.user.role.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Requested {new Date(request.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(request.user._id)}
                        className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-2 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        <Check size={16} />
                        <span className="text-sm font-medium">Accept</span>
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.user._id)}
                        className="flex items-center space-x-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <X size={16} />
                        <span className="text-sm font-medium">Decline</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}