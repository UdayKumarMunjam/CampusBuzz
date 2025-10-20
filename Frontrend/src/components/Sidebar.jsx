import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  Trophy,
  Bell,
  Search,
  LogOut,
  GraduationCap,
  MessageSquare,
  Shield,
  Home
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const defaultAvatar = "data:image/svg+xml;base64," + btoa(`
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="8" r="4" fill="#6B7280"/>
  <path d="M12 14c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" fill="#6B7280"/>
</svg>
`);

export default function Sidebar({ user, onLogout, isOpen, onClose, onProfileClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadMessageCount } = useAuthStore();

  const handleProfileClick = () => {
    navigate(`/profile/${user._id}`);
    onClose && onClose();
  };

  const menuItems = [
    { icon: Home, label: 'Feed', path: '/feed' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: Users, label: 'Clubs', path: '/clubs' },
    { icon: Trophy, label: 'Achievements', path: '/achievements' },
    { icon: Bell, label: 'E-Notice', path: '/e-notice' },
    { icon: Search, label: 'Lost & Found', path: '/lost-found' },
  ];

  if (user.role === 'admin') {
    menuItems.unshift({ icon: Shield, label: 'Admin Dashboard', path: '/' });
  }

  const handleLogout = () => {
    localStorage.removeItem('campusBuzzUser');
    onLogout();
    onClose && onClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose && onClose();

    // If navigating to messages, refresh unread count
    if (path === '/messages') {
      // The unread count will be cleared when messages are viewed
      // This is handled in the Conversation component when messages are fetched
    }
  };

  return (
    <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0`}>

      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">CampusBuzz</h1>
            <p className="text-sm text-gray-500">Campus Network</p>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-2 border-b border-gray-200">
        <button
          onClick={handleProfileClick}
          className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 w-full transition-colors"
        >
          <img
            src={user.avatar || defaultAvatar}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
          />
          <div>
            <p className="font-medium text-gray-800 text-sm">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
          </div>
        </button>
      </div>

      {/* Menu and Logout */}
      <div className="flex-1 flex flex-col justify-between overflow-y-hidden">

        {/* Menu Items with increased margin below profile */}
        <nav className="p-2 mt-4 space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const showBadge = item.path === '/messages' && unreadMessageCount > 0;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-left text-base transition-colors relative ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {showBadge && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center"></div>
                  )}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="border-t border-gray-200 p-2">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full text-base transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

      </div>

    </div>
  );
}
