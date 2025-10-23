import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MapPin,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Loader,
  Settings,
  UserCheck,
  Clock,
  UserPlus,
} from "lucide-react";
import BackButton from "../common/BackButton";
import { useFeedStore } from "../../stores/feedStore";
import { useAuthStore } from "../../stores/authStore";
import { getLetterAvatar } from "../../Utils/avatarUtils";
import { messageService } from "../../services/messageService";
import PostCard from "../PostCard";

// Removed defaultAvatar as we now use getLetterAvatar utility

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { fetchUserProfile, fetchUserPosts, likePost } = useFeedStore();
  const { user: currentUser } = useAuthStore();

  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('not_connected');
  const [loadingConnection, setLoadingConnection] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;

      setLoading(true);
      setPostsLoading(true);

      try {
        // Fetch user profile and posts in parallel
        const [profileData, postsData] = await Promise.all([
          fetchUserProfile(userId),
          fetchUserPosts(userId),
        ]);

        if (profileData) {
          setUser(profileData);
        }

        if (postsData) {
          setUserPosts(postsData);
        }

        // Fetch connection status if viewing another user's profile
        if (userId !== currentUser._id) {
          try {
            const response = await axios.get(
              `http://localhost:8080/api/user/connect/${userId}/status`,
              { withCredentials: true }
            );
            if (response.data.success) {
              setConnectionStatus(response.data.status);
            }
          } catch (statusError) {
            console.error("Error fetching connection status:", statusError);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
        setPostsLoading(false);
      }
    };

    loadUserData();
  }, [userId, fetchUserProfile, fetchUserPosts]);

  const handleLikePost = async (postId) => {
    await likePost(postId);
    // Refresh user posts to get updated like status
    const updatedPosts = await fetchUserPosts(userId);
    if (updatedPosts) {
      setUserPosts(updatedPosts);
    }
  };

  const handleConnect = async () => {
    if (!userId || loadingConnection) return;

    setLoadingConnection(true);
    try {
      const response = await axios.post(
        `http://localhost:8080/api/user/connect/${userId}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setConnectionStatus('pending');
        toast.success("Connection request sent!");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast.error("Failed to send connection request");
    } finally {
      setLoadingConnection(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!userId || loadingConnection) return;

    setLoadingConnection(true);
    try {
      const response = await axios.post(
        `http://localhost:8080/api/user/connect/${userId}/accept`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setConnectionStatus('connected');
        toast.success("Connection request accepted!");
      }
    } catch (error) {
      console.error("Error accepting connection request:", error);
      toast.error("Failed to accept connection request");
    } finally {
      setLoadingConnection(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (!userId || loadingConnection) return;

    setLoadingConnection(true);
    try {
      const response = await axios.post(
        `http://localhost:8080/api/user/connect/${userId}/decline`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setConnectionStatus('not_connected');
        toast.success("Connection request declined");
      }
    } catch (error) {
      console.error("Error declining connection request:", error);
      toast.error("Failed to decline connection request");
    } finally {
      setLoadingConnection(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <BackButton className="mb-6" />
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 lg:p-8">
        <BackButton className="mb-6" />
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <BackButton />
        </div>
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-8 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="flex flex-col items-center lg:items-start relative">
              <div className="relative">
                <img
                  src={user.avatar || getLetterAvatar(user.name)}
                  alt={user.name}
                  className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-gradient-to-r from-blue-400 to-purple-500 shadow-lg"
                  onError={(e) => {
                    e.target.src = getLetterAvatar(user.name);
                  }}
                />
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {user.name}
                  </h1>
                  <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
                    <span className="text-blue-700 font-semibold capitalize text-sm">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {userId === currentUser._id && (
                  <button
                    onClick={() => navigate('/settings')}
                    className="flex items-center space-x-2 text-black px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col items-center lg:items-start gap-3 mb-6">
                  <div className="flex space-x-8">
                    <div className="text-center">
                      <p className="text-xl lg:text-2xl font-bold text-gray-800 mb-1">
                        {userPosts.length}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">Posts</p>
                    </div>
                    <div
                      className="text-center cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                      onClick={() => navigate(`/profile/${userId}/followers`)}
                    >
                      <p className="text-xl lg:text-2xl font-bold text-gray-800 mb-1">
                        {user.followers?.length || 0}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">Followers</p>
                    </div>
                    <div
                      className="text-center cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                      onClick={() => navigate(`/profile/${userId}/following`)}
                    >
                      <p className="text-xl lg:text-2xl font-bold text-gray-800 mb-1">
                        {user.following?.length || 0}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">Following</p>
                    </div>
                  </div>
                  {userId !== currentUser._id && (
                    <div className="flex flex-col items-center lg:items-start space-y-3 mt-4">
                      {/* Connection Status Display */}
                      <div className="flex items-center space-x-2">
                        {connectionStatus === 'connected' && (
                          <>
                            <UserCheck size={16} className="text-green-500" />
                            <span className="text-sm text-green-600 font-medium">Connected</span>
                          </>
                        )}
                        {connectionStatus === 'pending' && (
                          <>
                            <Clock size={16} className="text-yellow-500" />
                            <span className="text-sm text-yellow-600 font-medium">Connection Pending</span>
                          </>
                        )}
                        {connectionStatus === 'request_received' && (
                          <>
                            <UserPlus size={16} className="text-blue-500" />
                            <span className="text-sm text-blue-600 font-medium">Connection Request Received</span>
                          </>
                        )}
                        {connectionStatus === 'not_connected' && (
                          <span className="text-sm text-gray-500">Not Connected</span>
                        )}
                      </div>

                      {/* Connection Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {connectionStatus === 'not_connected' && (
                          <button
                            onClick={handleConnect}
                            disabled={loadingConnection}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
                          >
                            {loadingConnection ? 'Connecting...' : 'Connect'}
                          </button>
                        )}
                        {connectionStatus === 'pending' && (
                          <div className="flex items-center space-x-2 text-yellow-600">
                            <Clock size={16} />
                            <span className="text-sm font-medium">Request Sent</span>
                          </div>
                        )}
                        {connectionStatus === 'connected' && (
                          <div className="flex items-center space-x-2 text-green-600">
                            <UserCheck size={16} />
                            <span className="text-sm font-medium">Connected</span>
                          </div>
                        )}
                        {connectionStatus === 'request_received' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleAcceptRequest}
                              disabled={loadingConnection}
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
                            >
                              Accept
                            </button>
                            <button
                              onClick={handleDeclineRequest}
                              disabled={loadingConnection}
                              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              {user.bio && (
                <div className="mb-4">
                  <p className="text-gray-700 italic">"{user.bio}"</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <p className="text-gray-800 font-medium text-sm">{user.email}</p>
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-green-600" />
                    <p className="text-gray-800 font-medium text-sm">{user.phone}</p>
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <p className="text-gray-800 font-medium text-sm">{user.location}</p>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <p className="text-gray-800 font-medium text-sm">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Posts */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Posts by {user.name}
            </h2>
          </div>

          {postsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : userPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {userPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
