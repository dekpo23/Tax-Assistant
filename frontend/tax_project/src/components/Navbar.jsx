import React from 'react';
import { Menu, Moon } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  return (
    <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 shrink-0 bg-white/80 backdrop-blur-sm z-10 sticky top-0">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <h2 className="font-semibold text-gray-800">New Conversation</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-green-50 text-[#008751] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border border-green-100">
          AGENTIC RAG ACTIVE
        </div>
        
        {/* Theme Toggle */}
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
          <Moon size={20} />
        </button>
      </div>
    </header>
  );
}