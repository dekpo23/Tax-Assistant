import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  MessageSquare, 
  Calculator, 
  Settings, 
  ChevronRight,
  Loader2 
} from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ isOpen, className = "" }) {
  const navigate = useNavigate();
  const location = useLocation(); // To track active route
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  
  // ✅ 1. State to store the list of conversation sessions
  const [recentSessions, setRecentSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(localStorage.getItem("current_session_id"));

  // ✅ 2. Load sessions from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("chat_sessions");
      if (saved) {
        setRecentSessions(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error parsing saved sessions:", e);
    }
    fetchUserData();
  }, []);

  // Listen for session updates (in case Chat component changes it)
  useEffect(() => {
    const handleSessionChange = () => {
        setActiveSessionId(localStorage.getItem("current_session_id"));
    };
    window.addEventListener('new_chat_session', handleSessionChange);
    return () => window.removeEventListener('new_chat_session', handleSessionChange);
  }, []);

  // --- NEW CHAT LOGIC ---
  const ChatClick = async (e) => {
    e.preventDefault();
    setIsCreatingChat(true);
    const token = localStorage.getItem("authToken");

    try {
        const response = await fetch("https://fashionable-demeter-ajeessolutions-c2d97d4a.koyeb.app/conversation/new", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.session_id) {
                // ✅ 3. Create new session object
                const newSession = {
                    id: data.session_id,
                    label: `Conversation ${recentSessions.length + 1}`, // Default Name
                    date: new Date().toLocaleDateString()
                };

                // ✅ 4. Add to list and Save to LocalStorage
                const updatedList = [newSession, ...recentSessions];
                setRecentSessions(updatedList);
                localStorage.setItem("chat_sessions", JSON.stringify(updatedList));

                // ✅ 5. Set as Active and Navigate
                localStorage.setItem("current_session_id", data.session_id);
                setActiveSessionId(data.session_id);
                
                navigate("/chat");
                
                // Notify Chat component to refresh
                window.dispatchEvent(new Event("new_chat_session"));
            }
        } else {
            console.error("Failed to create new conversation");
        }
    } catch (error) {
        console.error("Network error creating chat:", error);
    } finally {
        setIsCreatingChat(false);
    }
  }

  // ✅ 6. Handle clicking an old chat
  const handleHistoryClick = (sessionId) => {
      localStorage.setItem("current_session_id", sessionId);
      setActiveSessionId(sessionId);
      navigate("/chat");
      // This event tells Chat.jsx to reload the history for this ID
      window.dispatchEvent(new Event("new_chat_session"));
  };

  const profileClick = (e) => {
    navigate("/settings");
  }

  const [user, setUser] = useState({
    fullName: "Jane Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
  });

  const fetchUserData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const response = await fetch("https://fashionable-demeter-ajeessolutions-c2d97d4a.koyeb.app/get/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
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

  return (
    <aside className={`w-72 bg-[#003b22] text-white flex flex-col shrink-0 h-full transition-transform duration-300 ${className}`}>
      
      {/* Brand */}
      <div className="p-6 flex items-center gap-3 font-bold text-xl tracking-tight">
        <ShieldCheck className="w-8 h-8 text-white" />
        <span>TaxWise NG</span>
      </div>

      {/* New Chat Button */}
      <div className="px-4 mb-6">
        <button 
          className="w-full flex items-center justify-center gap-2 bg-[#003b22] border border-green-700 hover:bg-green-900 text-white py-3 rounded-lg transition-all font-medium shadow-sm hover:shadow-md active:scale-95 group disabled:opacity-70 disabled:cursor-not-allowed" 
          onClick={ChatClick}
          disabled={isCreatingChat}
        >
          {isCreatingChat ? (
             <Loader2 size={18} className="animate-spin text-green-400" />
          ) : (
             <Plus size={18} className="group-hover:text-green-400 transition-colors" />
          )}
          <span>{isCreatingChat ? "Creating..." : "New Chat"}</span>
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
            {recentSessions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-green-200/40 italic">
                    No history yet
                </div>
            ) : (
                recentSessions.map((session) => {
                    // Check if this session is the currently active one
                    const isActive = activeSessionId === session.id && location.pathname === '/chat';
                    
                    return (
                        <div 
                            key={session.id}
                            onClick={() => handleHistoryClick(session.id)}
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors group ${
                                isActive 
                                ? "bg-[#008751] text-white shadow-sm" 
                                : "text-green-100/80 hover:text-white hover:bg-white/10"
                            }`}
                        >
                            <MessageSquare size={18} className={`shrink-0 ${isActive ? 'text-white' : 'group-hover:text-green-300'}`} />
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium truncate">{session.label}</span>
                                <span className={`text-[10px] ${isActive ? 'text-green-100' : 'text-green-400/60'}`}>{session.date}</span>
                            </div>
                        </div>
                    );
                })
            )}
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