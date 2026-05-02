import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function Header({ onGetStarted, textColor = 'text-white', bgColor = 'bg-transparent', buttonColor = 'bg-purple-600 hover:bg-purple-700' }) {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-4xl">
      {/* Dynamic Island with Glassmorphism */}
      <div className="bg-black/20 dark:bg-black/40 backdrop-blur-xl border border-white/10 dark:border-purple-500/20 rounded-full px-6 py-3 shadow-2xl shadow-black/20 dark:shadow-purple-900/30">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-purple-100 dark:from-purple-100 dark:to-white bg-clip-text text-transparent">
              CampusBuzz
            </span>
          </div>

          {/* Join Button */}
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105 font-medium"
          >
            Join
          </button>
        </div>
      </div>
    </nav>
  );
}