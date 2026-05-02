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
  Home,
  Sun,
  Moon,
  UserPlus
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { getLetterAvatar } from '../Utils/avatarUtils';

// Removed defaultAvatar as we now use getLetterAvatar utility

export default function Sidebar({ user, onLogout, isOpen, onClose, onProfileClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadMessageCount } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();


  const menuItems = [
    { icon: Home, label: 'Feed', path: '/feed' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: UserPlus, label: 'Connections', path: '/connections' },
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
    <div className={`fixed left-0 top-0 h-screen w-64 bg-black/20 dark:bg-black/40 backdrop-blur-xl border-r border-purple-500/20 shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0`}>

      {/* Logo Section */}
      <div className="flex-shrink-0 p-4 border-b border-purple-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">CampusBuzz</h1>
            <p className="text-sm text-purple-300">Campus Network</p>
          </div>
        </div>
      </div>

      {/* Scrollable Navigation Section */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 mt-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const showBadge = item.path === '/messages' && unreadMessageCount > 0;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg w-full text-left text-sm transition-colors relative ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg'
                    : 'text-purple-200 hover:bg-purple-500/20 hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-purple-300'}`} />
                  {showBadge && (
                    <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center"></div>
                  )}
                </div>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Fixed Logout Section at Bottom */}
      <div className="flex-shrink-0 border-t border-purple-500/20 p-2">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3 py-2.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg w-full text-sm transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="truncate">Logout</span>
        </button>
      </div>

    </div>
  );
}
