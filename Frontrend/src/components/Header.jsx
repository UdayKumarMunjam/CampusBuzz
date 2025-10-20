import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function Header({ onGetStarted, textColor = 'text-white', bgColor = 'bg-transparent', buttonColor = 'bg-blue-600 hover:bg-blue-700' }) {
  return (
    <nav className={`absolute top-0 left-0 right-0 z-50 ${bgColor}`}>
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className={`text-xl font-bold drop-shadow-lg ${textColor}`}>CampusBuzz</span>
        </div>
        <button
          onClick={onGetStarted}
          className={`${buttonColor} text-white px-6 py-2 rounded-lg transition shadow-lg`}
        >
          Join
        </button>
      </div>
    </nav>
  );
}