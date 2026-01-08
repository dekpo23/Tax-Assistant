// // sidebar.jsx
// import React, { useState, useEffect } from 'react';
// import { 
//   ShieldCheck, 
//   Plus, 
//   MessageSquare, 
//   Calculator, 
//   Settings, 
//   ChevronRight 
// } from 'lucide-react';
// import { NavLink, useNavigate, useLocation } from 'react-router-dom';

// export default function Sidebar({ isOpen, className = "" }) {
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   const [user, setUser] = useState({
//     fullName: "Jane Doe",
//     avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
//   });

//   const [recentConversations, setRecentConversations] = useState([]);
//   const [activeConversation, setActiveConversation] = useState(null);

//   const profileClick = (e) => {
//     navigate("/settings");
//   };

//   const fetchUserData = async () => {
//     const token = localStorage.getItem("authToken");
    
//     if (!token) {
//       navigate("/");
//       return;
//     }

//     try {
//       const response = await fetch("http://127.0.0.1:8000/get/user", {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         }
//       });

//       if (!response.ok) {
//         console.log("Error fetching user data.");
//         if (response.status === 401) {
//           localStorage.removeItem("authToken");
//           navigate("/");
//         }
//         return;
//       }

//       const data = await response.json();
//       setUser({
//         fullName: data.name || "User",
//         avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name || "User"}`
//       });
//     } catch (error) {
//       console.error("Network error:", error);
//     }
//   };

//   // Create a new conversation without API call for now
//   const createNewConversation = () => {
//     const token = localStorage.getItem("authToken");
//     if (!token) {
//       navigate("/");
//       return;
//     }

//     // Generate a simple session ID
//     const sessionId = `session_${Date.now()}`;
    
//     // Store the new session in localStorage for recent conversations
//     const sessions = JSON.parse(localStorage.getItem("recentSessions") || "[]");
//     const newSession = {
//       session_id: sessionId,
//       created_at: new Date().toISOString(),
//       preview: "New conversation"
//     };
    
//     // Add to beginning and keep only last 5
//     sessions.unshift(newSession);
//     if (sessions.length > 5) sessions.pop();
    
//     localStorage.setItem("recentSessions", JSON.stringify(sessions));
    
//     // Navigate to chat with the new session_id
//     navigate(`/chat?session=${sessionId}`);
    
//     // Update recent conversations
//     setRecentConversations(sessions);
//     setActiveConversation(sessionId);
//   };

//   const loadRecentConversations = () => {
//     try {
//       const sessions = JSON.parse(localStorage.getItem("recentSessions") || "[]");
//       setRecentConversations(sessions);
      
//       // Check if we're in a chat session from URL
//       const urlParams = new URLSearchParams(location.search);
//       const currentSession = urlParams.get('session');
//       if (currentSession) {
//         setActiveConversation(currentSession);
        
//         // Add to recent if not already there
//         if (!sessions.find(s => s.session_id === currentSession)) {
//           const updatedSessions = [
//             { session_id: currentSession, created_at: new Date().toISOString(), preview: "New conversation" },
//             ...sessions.slice(0, 4)
//           ];
//           localStorage.setItem("recentSessions", JSON.stringify(updatedSessions));
//           setRecentConversations(updatedSessions);
//         }
//       }
//     } catch (error) {
//       console.error("Error loading recent conversations:", error);
//     }
//   };

//   const handleConversationClick = (sessionId) => {
//     setActiveConversation(sessionId);
//     navigate(`/chat?session=${sessionId}`);
//   };

//   // Function to update conversation preview (to be called from chat component)
//   const updateConversationPreview = (sessionId, previewText) => {
//     const sessions = JSON.parse(localStorage.getItem("recentSessions") || "[]");
//     const sessionIndex = sessions.findIndex(s => s.session_id === sessionId);
    
//     if (sessionIndex !== -1) {
//       // Only update if it's still "New conversation" or we want to force update
//       if (sessions[sessionIndex].preview === "New conversation" || sessions[sessionIndex].preview === "Current conversation") {
//         const newPreview = previewText.length > 30 ? previewText.substring(0, 30) + "..." : previewText;
//         sessions[sessionIndex].preview = newPreview;
//         localStorage.setItem("recentSessions", JSON.stringify(sessions));
//         setRecentConversations([...sessions]);
//       }
//     }
//   };

//   // Listen for preview updates from chat component
//   useEffect(() => {
//     const handlePreviewUpdate = (e) => {
//       if (e.detail && e.detail.sessionId && e.detail.previewText) {
//         updateConversationPreview(e.detail.sessionId, e.detail.previewText);
//       }
//     };

//     window.addEventListener('updateConversationPreview', handlePreviewUpdate);
    
//     return () => {
//       window.removeEventListener('updateConversationPreview', handlePreviewUpdate);
//     };
//   }, []);

//   useEffect(() => {
//     fetchUserData();
//     loadRecentConversations();
//   }, [location.search]); // Reload when URL changes

//   return (
//     <aside className={`w-72 bg-[#003b22] text-white flex flex-col shrink-0 h-full transition-transform duration-300 ${className}`}>
      
//       {/* Brand */}
//       <div className="p-6 flex items-center gap-3 font-bold text-xl tracking-tight">
//         <ShieldCheck className="w-8 h-8 text-white" />
//         <span>TaxWise NG</span>
//       </div>

//       {/* New Chat Button */}
//       <div className="px-4 mb-6">
//         <button 
//           className="w-full flex items-center justify-center gap-2 bg-[#003b22] border border-green-700 hover:bg-green-900 text-white py-3 rounded-lg transition-all font-medium shadow-sm hover:shadow-md active:scale-95 group" 
//           onClick={createNewConversation}
//         >
//           <Plus size={18} className="group-hover:text-green-400 transition-colors" />
//           <span>New Chat</span>
//         </button>
//       </div>

//       {/* Scrollable Nav Area */}
//       <div className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-thin scrollbar-thumb-green-800">
        
//         {/* Recent Conversations */}
//         <div>
//           <div className="flex items-center gap-2 text-xs font-bold text-green-200/60 uppercase tracking-wider mb-3 px-2">
//             <span className="w-1.5 h-1.5 rounded-full bg-green-400/50"></span>
//             Recent Conversations
//           </div>
          
//           <div className="space-y-1">
//             {recentConversations.length > 0 ? (
//               recentConversations.map((conv) => (
//                 <div 
//                   key={conv.session_id}
//                   className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
//                     activeConversation === conv.session_id
//                       ? "bg-[#008751] text-white shadow-sm"
//                       : "text-gray-400 hover:text-white hover:bg-white/5"
//                   }`}
//                   onClick={() => handleConversationClick(conv.session_id)}
//                 >
//                   <MessageSquare size={18} />
//                   <span className="text-sm font-medium truncate">
//                     {conv.preview || `Session ${conv.session_id.slice(0, 8)}...`}
//                   </span>
//                 </div>
//               ))
//             ) : (
//               <div className="px-3 py-3 text-gray-400 text-sm italic text-center">
//                 No recent conversations
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Tools Section */}
//         <div className="border-t border-green-900/40 pt-4">
//             <div className="space-y-1">
//                 <NavLink to="/calculator">
//                   {({ isActive }) => (
//                     <NavItem 
//                       icon={<Calculator size={18} />} 
//                       label="Tax Calculator" 
//                       isActive={isActive} 
//                     />
//                   )}
//               </NavLink>
                
//                 <NavLink to="/settings">
//                     {({ isActive }) => (
//                     <NavItem 
//                         icon={<Settings size={18} />} 
//                         label="Settings" 
//                         isActive={isActive} 
//                     />
//                     )}
//                 </NavLink>
//             </div>
//         </div>
//       </div>

//       {/* Sidebar Footer (User) */}
//       <div className="p-4 bg-[#002f1b]">
//        <button className='w-full' onClick={profileClick}>
//          <div className="flex items-center gap-3 p-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
//           <div className="relative">
//             <div className="w-9 h-9 rounded-full bg-orange-100 overflow-hidden border border-white/10">
//               <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
//             </div>
//             <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#002f1b] rounded-full"></div>
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-medium truncate text-green-50">{user.fullName}</p>
//             <p className="text-xs text-green-300/60 truncate">TaxWise User</p>
//           </div>
//           <ChevronRight size={16} className="text-green-600 group-hover:text-green-400" />
//         </div>
//        </button>
//       </div>
//     </aside>
//   );
// }

// // Helper for Sidebar Items
// function NavItem({ icon, label, isActive }) {
//   return (
//     <div className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
//       isActive 
//         ? "bg-[#008751] text-white shadow-sm"
//         : "text-gray-400 hover:text-white hover:bg-white/5"
//     }`}>
//       {icon}
//       <span className="text-sm font-medium">{label}</span>
//     </div>
//   );
// }





import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  MessageSquare, 
  Calculator, 
  Settings, 
  ChevronRight 
} from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ isOpen, className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState({
    fullName: "Jane Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    userId: null
  });

  const [recentConversations, setRecentConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  const profileClick = (e) => {
    navigate("/settings");
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/get/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.log("Error fetching user data.");
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/");
        }
        return;
      }

      const data = await response.json();
      const userData = {
        fullName: data.name || "User",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name || "User"}`,
        userId: data.user_id || data.id || null
      };
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Network error:", error);
      return null;
    }
  };

  // Create a new conversation using backend endpoint
  const createNewConversation = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/conversation/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const sessionId = data.session_id;
        
        // Navigate to the new chat session
        navigate(`/chat?session=${sessionId}`);
        
        // Reload conversations to include the new one
        await loadUserConversations();
      } else {
        console.error("Failed to create new conversation:", response.status);
        // Fallback: create a local session ID
        const localSessionId = `local_${Date.now()}`;
        navigate(`/chat?session=${localSessionId}`);
      }
    } catch (error) {
      console.error("Error creating new conversation:", error);
      const localSessionId = `local_${Date.now()}`;
      navigate(`/chat?session=${localSessionId}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load a single conversation's history to get preview
  const loadConversationPreview = async (sessionId) => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    try {
      const response = await fetch(`http://127.0.0.1:8000/conversation/history/${sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.history && data.history.length > 0) {
          // Find the first human message for preview
          const firstHumanMessage = data.history.find(msg => msg.role === "human");
          if (firstHumanMessage) {
            return {
              session_id: sessionId,
              preview: firstHumanMessage.content.length > 30 
                ? firstHumanMessage.content.substring(0, 30) + "..." 
                : firstHumanMessage.content,
              last_updated: data.history[data.history.length - 1].timestamp
            };
          }
        }
      }
    } catch (error) {
      console.error("Error fetching conversation preview:", error);
    }
    
    return null;
  };

  // Since we don't have a /conversation/sessions endpoint,
  // we'll store session IDs locally but keyed by user
  const loadUserConversations = async () => {
    const userData = await fetchUserData();
    if (!userData || !userData.userId) return;

    setIsLoadingConversations(true);
    
    try {
      // Get stored sessions for this user
      const userKey = `user_sessions_${userData.userId}`;
      const storedSessions = JSON.parse(localStorage.getItem(userKey) || "[]");
      
      // Check each stored session against backend
      const validSessions = [];
      
      for (const storedSession of storedSessions) {
        const sessionPreview = await loadConversationPreview(storedSession.session_id);
        if (sessionPreview) {
          validSessions.push(sessionPreview);
        }
      }
      
      // Sort by last updated (newest first)
      validSessions.sort((a, b) => {
        const timeA = a.last_updated ? new Date(a.last_updated).getTime() : 0;
        const timeB = b.last_updated ? new Date(b.last_updated).getTime() : 0;
        return timeB - timeA;
      });
      
      // Keep only last 5 conversations
      const recentSessions = validSessions.slice(0, 5);
      
      // Update localStorage with valid sessions
      localStorage.setItem(userKey, JSON.stringify(recentSessions.map(s => ({
        session_id: s.session_id,
        last_updated: s.last_updated
      }))));
      
      setRecentConversations(recentSessions);
    } catch (error) {
      console.error("Error loading user conversations:", error);
      setRecentConversations([]);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const handleConversationClick = (sessionId) => {
    setActiveConversation(sessionId);
    navigate(`/chat?session=${sessionId}`);
  };

  // Add a session to user's recent conversations
  const addToRecentSessions = async (sessionId) => {
    const userData = await fetchUserData();
    if (!userData || !userData.userId) return;

    const userKey = `user_sessions_${userData.userId}`;
    const storedSessions = JSON.parse(localStorage.getItem(userKey) || "[]");
    
    // Check if session already exists
    if (!storedSessions.find(s => s.session_id === sessionId)) {
      const updatedSessions = [
        { session_id: sessionId, last_updated: new Date().toISOString() },
        ...storedSessions.slice(0, 4) // Keep only 5 total
      ];
      
      localStorage.setItem(userKey, JSON.stringify(updatedSessions));
      
      // Reload conversations to update the list
      await loadUserConversations();
    }
  };

  // Listen for new conversations from chat component
  useEffect(() => {
    const handleNewConversation = (e) => {
      if (e.detail && e.detail.sessionId) {
        addToRecentSessions(e.detail.sessionId);
      }
    };

    window.addEventListener('newConversationStarted', handleNewConversation);
    
    return () => {
      window.removeEventListener('newConversationStarted', handleNewConversation);
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchUserData();
      await loadUserConversations();
      
      // Check current session from URL
      const urlParams = new URLSearchParams(location.search);
      const currentSession = urlParams.get('session');
      if (currentSession) {
        setActiveConversation(currentSession);
        addToRecentSessions(currentSession);
      }
    };
    
    init();
  }, [location.search]);

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
          className="w-full flex items-center justify-center gap-2 bg-[#003b22] border border-green-700 hover:bg-green-900 text-white py-3 rounded-lg transition-all font-medium shadow-sm hover:shadow-md active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={createNewConversation}
          disabled={isLoading || isLoadingConversations}
        >
          <Plus size={18} className="group-hover:text-green-400 transition-colors" />
          <span>{isLoading ? "Creating..." : "New Chat"}</span>
        </button>
      </div>

      {/* Scrollable Nav Area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-thin scrollbar-thumb-green-800">
        
        {/* Recent Conversations */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-green-200/60 uppercase tracking-wider mb-3 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400/50"></span>
            Recent Conversations
            {isLoadingConversations && (
              <span className="text-xs text-green-300/50"> (loading...)</span>
            )}
          </div>
          
          <div className="space-y-1">
            {recentConversations.length > 0 ? (
              recentConversations.map((conv) => (
                <div 
                  key={conv.session_id}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                    activeConversation === conv.session_id
                      ? "bg-[#008751] text-white shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => handleConversationClick(conv.session_id)}
                >
                  <MessageSquare size={18} />
                  <span className="text-sm font-medium truncate">
                    {conv.preview || `Session ${conv.session_id.slice(0, 8)}...`}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-gray-400 text-sm italic text-center">
                {isLoadingConversations ? "Loading conversations..." : "No recent conversations"}
              </div>
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
       <button className='w-full' onClick={profileClick}>
         <div className="flex items-center gap-3 p-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-orange-100 overflow-hidden border border-white/10">
              <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#002f1b] rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-green-50">{user.fullName}</p>
            <p className="text-xs text-green-300/60 truncate">TaxWise User</p>
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
        ? "bg-[#008751] text-white shadow-sm"
        : "text-gray-400 hover:text-white hover:bg-white/5"
    }`}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}