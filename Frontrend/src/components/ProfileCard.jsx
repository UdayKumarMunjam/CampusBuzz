import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, MessageSquare, Heart, Share2, Edit, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLetterAvatar } from '../Utils/avatarUtils';
import { useFeedStore } from '../stores/feedStore';

export default function ProfileCard({ user }) {
  const navigate = useNavigate();
  const { posts } = useFeedStore();
  const [userStats, setUserStats] = useState({
    postsCount: 0,
    likesReceived: 0,
    monthlyPosts: 0
  });

  useEffect(() => {
    if (user && posts) {
      // Calculate user statistics from posts
      const userPosts = posts.filter(post => post.userId?._id === user._id);
      const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
      
      // Calculate posts from current month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyPosts = userPosts.filter(post => {
        const postDate = new Date(post.createdAt);
        return postDate.getMonth() === currentMonth && postDate.getFullYear() === currentYear;
      }).length;

      setUserStats({
        postsCount: userPosts.length,
        likesReceived: totalLikes,
        monthlyPosts: monthlyPosts
      });
    }
  }, [user, posts]);

  if (!user) return null;

  const handleEditProfile = () => {
    navigate('/settings');
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'admin': 'Administrator',
      'teacher': 'Teacher',
      'student': 'Student',
      'code_club_head': 'Code Club Head',
      'e_cell_head': 'E-Cell Head',
      'hopehouse_head': 'Hopehouse Head',
      'cultural_club_head': 'Cultural Club Head'
    };
    return roleMap[role] || role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'teacher': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'code_club_head':
      case 'e_cell_head':
      case 'hopehouse_head':
      case 'cultural_club_head':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Profile Header */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <img
            src={user.avatar || getLetterAvatar(user.name)}
            alt={user.name}
            className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-700 shadow-lg mx-auto"
            onError={(e) => {
              e.target.src = getLetterAvatar(user.name);
            }}
          />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-3">{user.name}</h2>
        <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getRoleColor(user.role)}`}>
          {getRoleDisplayName(user.role)}
        </span>
      </div>

      {/* Bio */}
      {user.bio && (
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* User Info */}
      <div className="space-y-3 mb-6">
        {user.location && (
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{user.location}</span>
          </div>
        )}
        
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
          <Mail className="w-4 h-4 mr-2" />
          <span className="truncate">{user.email}</span>
        </div>

        {user.phone && (
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <Phone className="w-4 h-4 mr-2" />
            <span>{user.phone}</span>
          </div>
        )}

        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Users className="w-4 h-4 text-blue-500 mr-1" />
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {user.connections?.filter(conn => conn.status === 'connected').length || 0}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Connections</p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <MessageSquare className="w-4 h-4 text-green-500 mr-1" />
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {userStats.postsCount}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Posts</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleEditProfile}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
        
        <button
          onClick={() => navigate('/connections')}
          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center space-x-2"
        >
          <Users className="w-4 h-4" />
          <span>View Connections</span>
        </button>
      </div>

    </div>
  );
}
