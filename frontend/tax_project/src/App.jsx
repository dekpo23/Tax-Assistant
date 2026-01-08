// import React, { useState } from 'react';
// import { Route, Routes, useLocation } from 'react-router-dom';
// import Sidebar from './components/Sidebar';
// import Navbar from './components/Navbar';
// import TaxWiseChat from './components/Chat';
// import TaxWiseSettings from './components/Settings';
// import TaxCalculator from './components/Calculator';
// import Login from './components/Login';
// import SignUp from './components/SignUp';

// export default function App() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const location = useLocation();

//   // 1. Sidebar Logic: Hide ONLY on Login and Signup
//   const hideSidebarPaths = ['/', '/signup'];
//   const shouldShowSidebar = !hideSidebarPaths.includes(location.pathname);

//   // 2. Navbar Logic: Hide ONLY on Login and Signup (Show on all app pages)
//   const hideNavbarPaths = ['/', '/signup'];
//   const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

//   // 3. Dynamic Navbar Configuration
//   const getNavbarConfig = () => {
//     switch (location.pathname) {
//       case '/calculator':
//         return {
//           title: "Calculator Interface",
//           badge: "Problem 1: Tax Reform",
//           showUserAvatar: true,
//           showThemeToggle: false
//         };
//       case '/settings':
//         return {
//           title: "Settings",
//           badge: null,
//           showUserAvatar: false,
//           showThemeToggle: false // Settings page has its own toggle
//         };
//       case '/chat':
//       default:
//         return {
//           title: "New Conversation",
//           badge: "AGENTIC RAG ACTIVE",
//           showThemeToggle: true,
//           showUserAvatar: false
//         };
//     }
//   };

//   return (
//     <div className="flex h-screen bg-white font-sans text-slate-800 overflow-hidden">
      
//       {/* --- SIDEBAR SECTION --- */}
//       {shouldShowSidebar && (
//         <>
//           {/* Desktop Sidebar */}
//           <div className="hidden lg:block h-full border-r border-gray-200 dark:border-gray-800">
//             <Sidebar />
//           </div>

//           {/* Mobile Sidebar (Drawer) */}
//           {isSidebarOpen && (
//             <div className="fixed inset-0 z-50 lg:hidden flex">
//               <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
//               <Sidebar className="relative z-10 h-full shadow-2xl transform transition-transform" />
//             </div>
//           )}
//         </>
//       )}

//       {/* --- MAIN LAYOUT SECTION --- */}
//       <div className="flex-1 flex flex-col h-full relative">
        
//         {/* --- DYNAMIC NAVBAR SECTION --- */}
//         {shouldShowNavbar && (
//           <Navbar 
//             onMenuClick={() => setIsSidebarOpen(true)} 
//             config={getNavbarConfig()} 
//           />
//         )}
        
//         {/* --- CONTENT AREA --- */}
//         <main className={`flex-1 overflow-y-auto ${shouldShowSidebar ? 'dark:bg-gray-900 bg-gray-50' : 'bg-white'}`}>
//            <Routes>
//               <Route path="/" element={<Login/>} /> 
//               <Route path="/signup" element={<SignUp/>} />
//               <Route path="/settings" element={<TaxWiseSettings />} />
//               <Route path="/chat" element={<TaxWiseChat />} />
//               <Route path="/calculator" element={<TaxCalculator/>} />
//            </Routes>
//         </main>
//       </div>

//     </div>
//   );
// }



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
  const hideSidebarPaths = ['/', '/signup'];
  const shouldShowSidebar = !hideSidebarPaths.includes(location.pathname);

  // 2. Navbar Logic: Hide ONLY on Login and Signup (Show on all app pages)
  const hideNavbarPaths = ['/', '/signup'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  // 3. Get session from URL for chat component key
  const urlParams = new URLSearchParams(location.search);
  const sessionId = urlParams.get('session');

  // 4. Dynamic Navbar Configuration
  const getNavbarConfig = () => {
    // Check if it's a valid UUID (from backend) or local session
    const isNewConversation = !sessionId || sessionId === "default" || sessionId === "null";
    
    switch (location.pathname) {
      case '/calculator':
        return {
          title: "Calculator Interface",
          badge: "Problem 1: Tax Reform",
          showUserAvatar: true,
          showThemeToggle: false
        };
      case '/settings':
        return {
          title: "Settings",
          badge: null,
          showUserAvatar: false,
          showThemeToggle: false
        };
      case '/chat':
      default:
        return {
          title: isNewConversation ? "New Conversation" : `Chat Session`,
          badge: "AGENTIC RAG ACTIVE",
          showThemeToggle: true,
          showUserAvatar: false
        };
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans text-slate-800 overflow-hidden">
      
      {/* --- SIDEBAR SECTION --- */}
      {shouldShowSidebar && (
        <>
          {/* Desktop Sidebar */}
          <div className="hidden lg:block h-full border-r border-gray-200 dark:border-gray-800">
            <Sidebar />
          </div>

          {/* Mobile Sidebar (Drawer) */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
              <Sidebar className="relative z-10 h-full shadow-2xl transform transition-transform" />
            </div>
          )}
        </>
      )}

      {/* --- MAIN LAYOUT SECTION --- */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* --- DYNAMIC NAVBAR SECTION --- */}
        {shouldShowNavbar && (
          <Navbar 
            onMenuClick={() => setIsSidebarOpen(true)} 
            config={getNavbarConfig()} 
          />
        )}
        
        {/* --- CONTENT AREA --- */}
        <main className={`flex-1 overflow-y-auto ${shouldShowSidebar ? 'dark:bg-gray-900 bg-gray-50' : 'bg-white'}`}>
           <Routes>
              <Route path="/" element={<Login/>} /> 
              <Route path="/signup" element={<SignUp/>} />
              <Route path="/settings" element={<TaxWiseSettings />} />
              <Route path="/chat" element={
                // Key forces React to remount component when session changes
                <TaxWiseChat key={sessionId || "default"} />
              } />
              <Route path="/calculator" element={<TaxCalculator/>} />
           </Routes>
        </main>
      </div>

    </div>
  );
}