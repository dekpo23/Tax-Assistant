import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom'; // Imports first
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import TaxWiseChat from './components/Chat';
import TaxWiseSettings from './components/Settings';
import TaxCalculator from './components/Calculator';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white font-sans text-slate-800 overflow-hidden">
      
      {/* Desktop Sidebar (Visible on LG screens) */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        {/* Your Main Page Content Here */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
           {/* Routes go HERE so they render inside the main area */}
           <Routes>
              <Route path="/settings" element={<TaxWiseSettings />} />
              <Route path="/chat" element={<TaxWiseChat />} />
              
              {/* Add a default route (e.g., redirect to chat or show home) */}
              <Route path="/" element={<TaxWiseChat />} /> 
              <Route path="/calculator" element={<TaxCalculator/>} />
           </Routes>
        </main>
      </div>

    </div>
  );
}