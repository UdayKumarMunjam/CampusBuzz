import React, { useState, useRef } from 'react';
import { X, User, Lock, Edit3, Mail, Phone, MapPin, Eye, EyeOff, Camera } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const defaultAvatar = "data:image/svg+xml;base64," + btoa(`
<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="8" r="4" fill="#6B7280"/>
  <path d="M12 14c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" fill="#6B7280"/>
</svg>
`);

export default function ProfileModal({ user, isOpen, onClose }) {
  const { updateProfile, changePassword } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [profileData, setProfileData] = useState({
    name: user.name,
    username: user.username || '',
    avatar: user.avatar || '',
    phone: user.phone || '',
    location: user.location || '',
    bio: user.bio || ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleProfileUpdate = async () => {
    setIsLoading(true);

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('name', profileData.name);
    formData.append('username', profileData.username);
    formData.append('phone', profileData.phone);
    formData.append('location', profileData.location);
    formData.append('bio', profileData.bio);

    // Append avatar file if selected
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const result = await updateProfile(formData);
    setIsLoading(false);
    if (result.success) {
      onClose();
    } else if (result.expired) {
      onClose(); // Close modal if session expired
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
    } else if (result.expired) {
      onClose(); // Close modal if session expired
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setProfileData({...profileData, avatar: imageUrl});
      toast.success('Profile picture selected');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-t-3xl opacity-10"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 blur-xl"></div>

        <div className="relative p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Profile Settings</h2>
                <p className="text-sm text-gray-600 font-medium">Customize your profile information</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-3 hover:bg-white hover:bg-opacity-80 rounded-xl shadow-sm hover:shadow-md">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 relative">
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 transition-all duration-300"
               style={{ width: activeTab === 'profile' ? '50%' : '50%', transform: activeTab === 'password' ? 'translateX(100%)' : 'translateX(0)' }}></div>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-5 px-6 text-center font-bold transition-all duration-300 relative ${
              activeTab === 'profile'
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white hover:bg-opacity-50'
            }`}
          >
            <User className="w-5 h-5 inline mr-3" />
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-5 px-6 text-center font-bold transition-all duration-300 relative ${
              activeTab === 'password'
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white hover:bg-opacity-50'
            }`}
          >
            <Lock className="w-5 h-5 inline mr-3" />
            Change Password
          </button>
        </div>

        <div className="p-10">
          {activeTab === 'profile' ? (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="relative block group mx-auto w-fit">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative">
                    <img
                      src={profileData.avatar || user.avatar || defaultAvatar}
                      alt={user.name}
                      className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-2xl cursor-pointer hover:scale-105 transition-all duration-300"
                      onClick={handleImageClick}
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                      onClick={handleImageClick}
                    >
                      <div className="bg-white/90 rounded-full p-3 shadow-lg">
                        <Camera className="w-6 h-6 text-gray-700" />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 font-medium bg-gray-50 inline-block px-4 py-2 rounded-full">Click to change photo</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2 text-blue-500" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 bg-gradient-to-r from-white to-gray-50 focus:from-white focus:to-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2 text-purple-500" />
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all duration-300 bg-gradient-to-r from-white to-gray-50 focus:from-white focus:to-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-green-500" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50 text-gray-500 cursor-not-allowed shadow-sm"
                      title="Email cannot be changed"
                    />
                    <p className="text-xs text-gray-500 mt-2 font-medium bg-gray-50 inline-block px-3 py-1 rounded-full">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-red-500" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 shadow-sm hover:shadow-lg hover:border-red-300 transition-all duration-300 bg-gradient-to-r from-white to-gray-50 focus:from-white focus:to-white"
                      placeholder="Your location"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <Edit3 className="w-4 h-4 mr-2 text-indigo-500" />
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 h-32 resize-none shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-300 bg-gradient-to-r from-white to-gray-50 focus:from-white focus:to-white"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                <div className="pt-4">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white py-5 px-8 rounded-2xl hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl relative overflow-hidden"
                  >
                    <span className="relative z-10">{isLoading ? 'Updating...' : 'Update Profile'}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'password' ? (
            <div className="space-y-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Change Your Password</h3>
                <p className="text-gray-600">Enter your current password and choose a new one</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-orange-500" />
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full p-4 pr-14 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 shadow-sm hover:shadow-lg hover:border-orange-300 transition-all duration-300 bg-gradient-to-r from-white to-gray-50 focus:from-white focus:to-white"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors p-1"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-green-500" />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full p-4 pr-14 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300 bg-gradient-to-r from-white to-gray-50 focus:from-white focus:to-white"
                        placeholder="Minimum 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-500 transition-colors p-1"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-blue-500" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full p-4 pr-14 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 bg-gradient-to-r from-white to-gray-50 focus:from-white focus:to-white"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 transition-colors p-1"
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
                    className="w-full bg-gradient-to-r from-purple-500 via-pink-600 to-red-600 text-white py-5 px-8 rounded-2xl hover:from-purple-600 hover:via-pink-700 hover:to-red-700 transform hover:scale-105 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl relative overflow-hidden"
                  >
                    <span className="relative z-10">{isLoading ? 'Changing...' : 'Change Password'}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}