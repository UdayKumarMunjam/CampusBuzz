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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">
            Settings
          </h1>
          <p className="text-purple-200">Manage your account and preferences</p>
        </div>

        {/* Settings Content */}
        <div className="bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-purple-500/20 bg-white/5 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'text-white border-b-2 border-purple-400 bg-white/10'
                  : 'text-purple-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-5 h-5 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
                activeTab === 'password'
                  ? 'text-white border-b-2 border-purple-400 bg-white/10'
                  : 'text-purple-200 hover:text-white hover:bg-white/5'
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
                      className="w-24 h-24 rounded-full object-cover border-4 border-purple-400/50 shadow-2xl"
                      onError={(e) => {
                        e.target.src = getLetterAvatar(user?.name);
                      }}
                    />
                    <label className="absolute inset-0 bg-purple-600/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                      <Camera className="w-6 h-6 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-purple-200 mt-2">Click to change photo</p>
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-purple-500/30 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/10 backdrop-blur-sm text-white placeholder-purple-300 transition-all"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-purple-500/30 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/10 backdrop-blur-sm text-white placeholder-purple-300 transition-all"
                      placeholder="Your username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-purple-500/20 bg-white/5 text-purple-300 cursor-not-allowed"
                    />
                    <p className="text-xs text-purple-400 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-purple-500/30 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/10 backdrop-blur-sm text-white placeholder-purple-300 transition-all"
                      placeholder="Your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-purple-500/30 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/10 backdrop-blur-sm text-white placeholder-purple-300 transition-all"
                      placeholder="Your location"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-purple-500/30 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/10 backdrop-blur-sm text-white placeholder-purple-300 resize-none transition-all"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 px-6 rounded-xl font-medium hover:from-purple-700 hover:to-purple-900 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Profile</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Password Change Section */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full mb-4 shadow-lg">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Change Password</h3>
                  <p className="text-purple-200">Enter your current password and choose a new one</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-purple-500/30 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/10 backdrop-blur-sm text-white placeholder-purple-300 transition-all"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-purple-500/30 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/10 backdrop-blur-sm text-white placeholder-purple-300 transition-all"
                        placeholder="Minimum 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-purple-500/30 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/10 backdrop-blur-sm text-white placeholder-purple-300 transition-all"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
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
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 px-6 rounded-xl font-medium hover:from-purple-700 hover:to-purple-900 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Changing...</span>
                      </>
                    ) : (
                      <span>Change Password</span>
                    )}
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