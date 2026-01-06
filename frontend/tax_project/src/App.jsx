import React, { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import TaxWiseChat from './components/Chat';
import TaxWiseSettings from './components/Settings';
import TaxCalculator from './components/Calculator';
import Login from './components/Login';
import SignUp from './components/SignUp';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // 1. Sidebar Logic: Hide ONLY on Login and Signup
  // (Sidebar remains visible on Settings)
  const hideSidebarPaths = ['/', '/signup'];
  const shouldShowSidebar = !hideSidebarPaths.includes(location.pathname);

  // 2. Navbar Logic: Hide on Login, Signup, AND Settings
  // (This prevents the double-header issue on the Settings page)
  const hideNavbarPaths = ['/', '/signup', '/settings'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <div className="flex h-screen bg-white font-sans text-slate-800 overflow-hidden">
      
      {/* --- SIDEBAR SECTION --- */}
      {shouldShowSidebar && (
        <>
          {/* Desktop Sidebar */}
          <div className="hidden lg:block h-full">
            <Sidebar />
          </div>

          {/* Mobile Sidebar (Drawer) */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
              <Sidebar className="relative z-10" />
            </div>
          )}
        </>
      )}

      {/* --- MAIN LAYOUT SECTION --- */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* --- NAVBAR SECTION --- */}
        {/* {shouldShowNavbar && (
          <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        )}
         */}
        {/* --- CONTENT AREA --- */}
        {/* We generally use gray background for dashboard pages (when sidebar is present), 
            and white for auth pages. */}
        <main className={`flex-1 overflow-y-auto ${shouldShowSidebar ? ' bg-gray-50' : 'bg-white'}`}>
           <Routes>
              <Route path="/" element={<Login/>} /> 
              <Route path="/signup" element={<SignUp/>} />
              <Route path="/settings" element={<TaxWiseSettings />} />
              <Route path="/chat" element={<TaxWiseChat />} />
              <Route path="/calculator" element={<TaxCalculator/>} />
           </Routes>
        </main>
      </div>

    </div>
  );
}