import React, { useState, useEffect } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';

export default function Navbar({ onMenuClick, config }) {
  // --- Theme Logic (Global) ---
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("app_preferences");
      return saved ? JSON.parse(saved).darkMode : false;
    } catch (e) { return false; }
  });

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    const savedPrefs = localStorage.getItem("app_preferences");
    const prefs = savedPrefs ? JSON.parse(savedPrefs) : {};
    prefs.darkMode = newMode;
    localStorage.setItem("app_preferences", JSON.stringify(prefs));
    window.dispatchEvent(new Event("storage"));
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("app_preferences");
      if (saved) setDarkMode(JSON.parse(saved).darkMode);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- Dynamic Styles ---
  const navBg = darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  const iconColor = darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50';
  
  // Badge Styles (Green vs Standard)
  const badgeStyle = darkMode 
    ? 'bg-green-900/30 text-green-400 border-green-900/50' 
    : 'bg-[#e6f4ea] text-[#008751] border-green-100';

  return (
    <header className={`h-16 border-b flex items-center justify-between px-6 shrink-0 backdrop-blur-sm z-30 sticky top-0 transition-colors duration-300 ${navBg}`}>
      
      {/* LEFT: Menu & Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className={`p-2 -ml-2 rounded-lg lg:hidden transition-colors ${iconColor}`}
        >
          <Menu size={20} />
        </button>
        {/* Dynamic Title */}
        <h2 className={`font-semibold ${textColor}`}>{config.title}</h2>
      </div>

      {/* RIGHT: Dynamic Actions */}
      <div className="flex items-center gap-4">
        
        {/* Optional Badge */}
        {config.badge && (
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border ${badgeStyle}`}>
            {config.badge}
          </div>
        )}
        
        {/* Optional Theme Toggle */}
        {config.showThemeToggle && (
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors ${darkMode ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}

        {/* Optional User Avatar (for Calculator) */}
        {config.showUserAvatar && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
            ME
          </div>
        )}
      </div>
    </header>
  );
}