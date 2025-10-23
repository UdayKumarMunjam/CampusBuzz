import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Eye, EyeOff, Camera, X } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { getLetterAvatar } from '../Utils/avatarUtils';
import toast from 'react-hot-toast';

// Removed defaultAvatar as we now use getLetterAvatar utility

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    avatar: user?.avatar || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        username: user.username || '',
        avatar: user.avatar || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', profileData.name);
    formData.append('username', profileData.username);
    formData.append('phone', profileData.phone);
    formData.append('location', profileData.location);
    formData.append('bio', profileData.bio);

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const result = await updateProfile(formData);
    setIsLoading(false);
    if (result.success) {
      toast.success('Profile updated successfully!');
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword.trim()) {
      toast.error('Please enter a new password');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    const result = await changePassword(passwordData);
    setIsLoading(false);

    if (result.success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const imageUrl = URL.createObjectURL(file);
      setProfileData({...profileData, avatar: imageUrl});
      toast.success('Profile picture selected');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
        </div>

        {/* Settings Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-800'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <User className="w-5 h-5 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
                activeTab === 'password'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-800'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Lock className="w-5 h-5 inline mr-2" />
              Password
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 lg:p-8">
            {activeTab === 'profile' ? (
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="text-center">
                  <div className="relative inline-block group">
                    <img
                      src={profileData.avatar || user?.avatar || getLetterAvatar(user?.name)}
                      alt={user?.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                      onError={(e) => {
                        e.target.src = getLetterAvatar(user?.name);
                      }}
                    />
                    <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                      <Camera className="w-6 h-6 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Click to change photo</p>
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Your username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Your phone number"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Your location"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Password Change Section */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Change Password</h3>
                  <p className="text-gray-600">Enter your current password and choose a new one</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Minimum 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handlePasswordChange}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}