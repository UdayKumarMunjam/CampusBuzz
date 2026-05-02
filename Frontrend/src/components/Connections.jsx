import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserCheck, UserPlus, Clock, X, Check, MessageCircle } from 'lucide-react';
import { getLetterAvatar } from '../Utils/avatarUtils';
import { useAuthStore } from '../stores/authStore';
import { messageService } from '../services/messageService';
import { useNavigate } from 'react-router-dom';

export default function Connections() {
  const { user, refreshUserData } = useAuthStore();
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
      const connectionIds = connectionsList
        .filter(conn => conn && conn.user && conn.user._id)
        .map(conn => conn.user._id);
      
      if (connectionIds.length === 0) return;
      
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
        // Refresh user data to update connection count in ProfileCard
        await refreshUserData();
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
    if (!userId) {
      toast.error('Unable to send message - user information not available');
      return;
    }
    // Navigate directly to messages without any alerts
    navigate('/messages', { state: { selectedUserId: userId } });
  };

  const handleDisconnect = async (userId, userName) => {
    if (!userId) {
      toast.error('Unable to disconnect - user information not available');
      return;
    }
    if (window.confirm(`Are you sure you want to disconnect from ${userName || 'this user'}?`)) {
      try {
        const response = await axios.post(
          `http://localhost:8080/api/user/connect/${userId}/disconnect`,
          {},
          { withCredentials: true }
        );

        if (response.data.success) {
          toast.success('Connection removed successfully');
          fetchConnections();
          // Refresh user data to update connection count in ProfileCard
          await refreshUserData();
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen">
      {/* Banner Section */}
      <div className="mb-10 bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-4 bg-purple-500/20 backdrop-blur-sm rounded-2xl">
            <UserCheck className="w-10 h-10 text-purple-400" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">Connections</h1>
            <p className="text-lg text-purple-200">Manage your professional network and build meaningful relationships</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">

      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('connections')}
          className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            activeTab === 'connections'
              ? 'bg-purple-600 text-white shadow-lg hover:bg-purple-700'
              : 'bg-white/10 backdrop-blur-xl text-purple-200 border border-purple-500/20 hover:border-purple-400/40 hover:shadow-md hover:bg-white/20'
          }`}
        >
          My Connections ({connections.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            activeTab === 'requests'
              ? 'bg-purple-600 text-white shadow-lg hover:bg-purple-700'
              : 'bg-white/10 backdrop-blur-xl text-purple-200 border border-purple-500/20 hover:border-purple-400/40 hover:shadow-md hover:bg-white/20'
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
              <div className="p-4 bg-purple-500/20 backdrop-blur-sm rounded-full w-fit mx-auto mb-4">
                <UserPlus className="w-16 h-16 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No connections yet</h3>
              <p className="text-purple-200">Start building your network by connecting with others</p>
            </div>
          ) : (
            <div className="space-y-3">
              {connections
                .filter(connection => connection && connection.user)
                .map((connection) => (
                <div
                  key={connection._id}
                  className="bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-400/40 transform hover:-translate-y-1 p-6"
                >
                  <div className="flex items-center justify-between">
                    {/* Left side - User info */}
                    <div className="flex items-center space-x-4 flex-1">
                      <img
                        src={connection.user?.avatar || getLetterAvatar(connection.user?.name || 'Unknown User')}
                        alt={connection.user?.name || 'Unknown User'}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        onError={(e) => {
                          e.target.src = getLetterAvatar(connection.user?.name || 'Unknown User');
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-white truncate">
                          {connection.user?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-purple-200 capitalize">
                          {connection.user?.role?.replace('_', ' ') || 'Unknown Role'}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          <UserCheck size={14} className="text-green-500" />
                          <span className="text-xs text-green-400 font-medium">
                            Connected {connection.connectedAt ? new Date(connection.connectedAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Action badges */}
                    <div className="flex items-center space-x-3">
                      {/* Message Badge */}
                      <button
                        onClick={() => handleMessageClick(connection.user?._id)}
                        className="relative flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-colors font-medium shadow-md"
                        title="Send message"
                        disabled={!connection.user?._id}
                      >
                        <MessageCircle size={18} />
                        <span className="text-sm">Message</span>
                        {connection.user?._id && unreadCounts[connection.user._id] > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                            {unreadCounts[connection.user._id] > 99 ? '99+' : unreadCounts[connection.user._id]}
                          </span>
                        )}
                      </button>

                      {/* Disconnect Badge */}
                      <button
                        onClick={() => handleDisconnect(connection.user?._id, connection.user?.name)}
                        className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors font-medium shadow-md"
                        title="Disconnect"
                        disabled={!connection.user?._id}
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
              <div className="p-4 bg-purple-500/20 backdrop-blur-sm rounded-full w-fit mx-auto mb-4">
                <Clock className="w-16 h-16 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No pending requests</h3>
              <p className="text-purple-200">Connection requests from others will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests
                .filter(request => request && request.user)
                .map((request) => (
                <div
                  key={request._id}
                  className="bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-400/40 transform hover:-translate-y-1 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={request.user?.avatar || getLetterAvatar(request.user?.name || 'Unknown User')}
                        alt={request.user?.name || 'Unknown User'}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        onError={(e) => {
                          e.target.src = getLetterAvatar(request.user?.name || 'Unknown User');
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-white">
                          {request.user?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-purple-200 capitalize">
                          {request.user?.role?.replace('_', ' ') || 'Unknown Role'}
                        </p>
                        <p className="text-xs text-purple-300 mt-1">
                          Requested {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(request.user?._id)}
                        className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
                        disabled={!request.user?._id}
                      >
                        <Check size={16} />
                        <span className="text-sm font-medium">Accept</span>
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.user?._id)}
                        className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
                        disabled={!request.user?._id}
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
    </div>
  );
}