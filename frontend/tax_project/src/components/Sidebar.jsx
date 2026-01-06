import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  MessageSquare, 
  Calculator, 
  Settings, 
  ChevronRight 
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Sidebar({ isOpen, className = "" }) {
  const navigate = useNavigate();
  
  // Note: We are keeping the sidebar Brand Green regardless of the theme
  // so we don't strictly need to listen to darkMode for background colors here.

  const ChatClick = (e) => {
    navigate("/chat");
  }

  const profileClick = (e) => {
    navigate("/settings");
  }

  const [user, setUser] = useState({
    fullName: "Jane Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
  });

  const fetchUserData = async () => {
    const token = localStorage.getItem("authToken");
    
    // If no token, we just keep the mock data
    if (!token) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/get/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.log("Error fetching user data. Using mock data.");
        if (response.status === 401) {
           localStorage.removeItem("authToken");
           navigate("/");
        }
        return;
      }

      const data = await response.json();
      setUser({
        fullName: data.name || "User",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name || "User"}`
      });
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []); // Run once on mount

  return (
    // Fixed: bg-[#003b22] ensures the sidebar is always Green
    <aside className={`w-72 bg-[#003b22] text-white flex flex-col shrink-0 h-full transition-transform duration-300 ${className}`}>
      
      {/* Brand */}
      <div className="p-6 flex items-center gap-3 font-bold text-xl tracking-tight">
        <ShieldCheck className="w-8 h-8 text-white" />
        <span>TaxWise NG</span>
      </div>

      {/* New Chat Button */}
      <div className="px-4 mb-6">
        <button 
          className="w-full flex items-center justify-center gap-2 bg-[#003b22] border border-green-700 hover:bg-green-900 text-white py-3 rounded-lg transition-all font-medium shadow-sm hover:shadow-md active:scale-95 group" 
          onClick={ChatClick}
        >
          <Plus size={18} className="group-hover:text-green-400 transition-colors" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Scrollable Nav Area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-thin scrollbar-thumb-green-800">
        
        {/* Recent Conversations */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-green-200/60 uppercase tracking-wider mb-3 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400/50"></span>
            Recent Conversations
          </div>
          
          <div className="space-y-1">
            {/* Active Item Example */}
            {/* <div className="flex items-center gap-3 px-3 py-3 bg-[#008751] text-white rounded-lg cursor-pointer shadow-sm">
              <MessageSquare size={18} />
              <span className="text-sm font-medium truncate">New Conversation</span>
            </div> */}

            {/* Inactive Item Example */}
            {/* <div className="flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
              <MessageSquare size={18} />
              <span className="text-sm font-medium truncate">Initial Welcome Chat</span>
            </div> */}
          </div>
        </div>

        {/* Tools Section */}
        <div className="border-t border-green-900/40 pt-4">
            <div className="space-y-1">
                <NavLink to="/calculator">
                  {({ isActive }) => (
                    <NavItem 
                      icon={<Calculator size={18} />} 
                      label="Tax Calculator" 
                      isActive={isActive} 
                    />
                  )}
              </NavLink>
                
                <NavLink to="/settings">
                    {({ isActive }) => (
                    <NavItem 
                        icon={<Settings size={18} />} 
                        label="Settings" 
                        isActive={isActive} 
                    />
                    )}
                </NavLink>
            </div>
        </div>
      </div>

      {/* Sidebar Footer (User) */}
      <div className="p-4 bg-[#002f1b]">
       <button  className='w-full' onClick={profileClick}>
         <div className="flex items-center gap-3 p-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-orange-100 overflow-hidden border border-white/10">
              <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#002f1b] rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0 ">
            <p className="text-sm font-medium truncate text-green-50">{user.fullName}</p>
          </div>
          <ChevronRight size={16} className="text-green-600 group-hover:text-green-400" />
        </div>
       </button>
      </div>
    </aside>
  );
}

// Helper for Sidebar Items
function NavItem({ icon, label, isActive }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
      isActive 
        ? "bg-[#008751] text-white shadow-sm" // Active Style (Green)
        : "text-gray-400 hover:text-white hover:bg-white/5" // Inactive Style (Gray)
    }`}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}