import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ searchTerm, onSearchChange, onReset, placeholder = "Search..." }) {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={onSearchChange}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      />
      {searchTerm && (
        <button
          onClick={onReset}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      )}
    </div>
  );
}
