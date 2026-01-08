// import React, { useState, useEffect, useRef } from 'react';
// import ReactMarkdown from 'react-markdown'; 
// import { 
//   ShieldCheck, 
//   Menu, 
//   Moon, 
//   Sun,
//   Send, 
//   Lock, 
//   CheckCircle2, 
//   Sparkles,
//   Command,
//   User as UserIcon,
//   Loader2
// } from 'lucide-react';

// export default function TaxWiseChat() {
//   // --- Theme State ---
//   const [darkMode, setDarkMode] = useState(() => {
//     const saved = localStorage.getItem("app_preferences");
//     return saved ? JSON.parse(saved).darkMode : false;
//   });

//   // --- Chat & User State ---
//   const [input, setInput] = useState("");
//   const [userName, setUserName] = useState("User");
//   const [messages, setMessages] = useState([
//     { 
//       id: 1, 
//       role: 'bot', 
//       text: "Hello! I'm your TaxWise assistant. How can I help you understand the Nigerian Tax reforms today?" 
//     }
//   ]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [sessionId, setSessionId] = useState(null);
  
//   // Auto-scroll ref
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, isLoading]);

//   // --- Get session from URL ---
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const session = urlParams.get('session');
//     setSessionId(session);
//   }, []);

//   // --- Fetch User Data ---
//   useEffect(() => {
//     const fetchUserData = async () => {
//       const token = localStorage.getItem("authToken");
//       if (!token) return;

//       try {
//         const response = await fetch("http://127.0.0.1:8000/get/user", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`
//           }
//         });

//         if (response.ok) {
//           const data = await response.json();
//           let fetchedName = "User";
//           if (data.name) fetchedName = data.name;
//           else if (data.full_name) fetchedName = data.full_name.split(' ')[0];
          
//           setUserName(fetchedName);
          
//           setMessages(prev => prev.map(msg => 
//             msg.id === 1 ? { ...msg, text: `Hello ${fetchedName}! How can I help you understand the Nigerian Tax reforms today?` } : msg
//           ));
//         }
//       } catch (error) {
//         console.error("Failed to fetch user data", error);
//       }
//     };

//     fetchUserData();
//   }, []);

//   // --- Handle Chat Submission (STREAMING + MARKDOWN) ---
//   const handleSend = async () => {
//     if (!input.trim()) return;

//     const userText = input;
    
//     // If this is the first user message, update the sidebar preview
//     if (sessionId && messages.length <= 1) { // Only initial bot message exists
//       // Dispatch custom event to update sidebar preview
//       window.dispatchEvent(new CustomEvent('updateConversationPreview', {
//         detail: {
//           sessionId: sessionId,
//           previewText: userText
//         }
//       }));
//     }
    
//     setInput("");
//     setIsLoading(true); // Show thinking spinner

//     // 1. Add User Message
//     const userMessage = { id: Date.now(), role: 'user', text: userText };
    
//     // 2. Add an EMPTY Bot Message immediately (placeholder for streaming)
//     const botMessageId = Date.now() + 1;
//     const initialBotMessage = { id: botMessageId, role: 'bot', text: "" };
    
//     setMessages(prev => [...prev, userMessage, initialBotMessage]);

//     const token = localStorage.getItem("authToken");

//     try {
//       // ✅ CHANGED: Point to the streaming endpoint
//       const response = await fetch("http://127.0.0.1:8000/ask/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify({ 
//           question: userText,
//           session_id: sessionId || "default" 
//         }) 
//       });

//       if (!response.ok) throw new Error("Stream failed");

//       // ✅ FIXED STREAMING LOGIC: Backend is sending NDJSON (plain JSON lines)
//       const reader = response.body.getReader();
//       const decoder = new TextDecoder();
//       let done = false;
//       let botTextAccumulator = "";

//       setIsLoading(false); // Hide spinner, start showing text

//       while (!done) {
//         const { value, done: doneReading } = await reader.read();
//         done = doneReading;
        
//         if (value) {
//           const chunkValue = decoder.decode(value, { stream: true });
          
//           // ✅ FIXED: Backend sends NDJSON, not Server-Sent Events
//           // Split by newlines and process each JSON line
//           const lines = chunkValue.split('\n').filter(line => line.trim() !== '');
          
//           for (let line of lines) {
//             try {
//               const data = JSON.parse(line);
              
//               // Check for token chunks
//               if (data.type === 'token') {
//                 botTextAccumulator += data.content;
                
//                 // Update State: This triggers re-render, creating the typing effect
//                 setMessages(prevMessages => 
//                   prevMessages.map(msg => 
//                     msg.id === botMessageId 
//                       ? { ...msg, text: botTextAccumulator } 
//                       : msg
//                   )
//                 );
//               }
//               // Check for done message (optional - stream ends anyway)
//               else if (data.type === 'done') {
//                 // Stream is complete
//                 done = true;
//                 break;
//               }
//             } catch (e) {
//               console.error("Error parsing stream chunk", e, line);
//             }
//           }
//         }
//       }

//     } catch (error) {
//       console.error("Error fetching chat data:", error);
//       // Remove the empty bot message and show error
//       setMessages(prev => prev.filter(msg => msg.id !== botMessageId));
//       setMessages(prev => [...prev, { 
//         id: Date.now() + 1, 
//         role: 'bot', 
//         text: "Sorry, I'm having trouble connecting to the server right now. Please try again later." 
//       }]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   // --- Theme Logic ---
//   const toggleTheme = () => {
//     const newMode = !darkMode;
//     setDarkMode(newMode);
//     const savedPrefs = localStorage.getItem("app_preferences");
//     const prefs = savedPrefs ? JSON.parse(savedPrefs) : {};
//     prefs.darkMode = newMode;
//     localStorage.setItem("app_preferences", JSON.stringify(prefs));
//   };

//   useEffect(() => {
//     const handleStorageChange = () => {
//       const saved = localStorage.getItem("app_preferences");
//       if (saved) setDarkMode(JSON.parse(saved).darkMode);
//     };
//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   // --- Dynamic Styles ---
//   const mainBg = darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-slate-800';
//   const headerBg = darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-100';
//   const footerBg = darkMode ? 'bg-gray-900/90' : 'bg-white/90';
//   const inputBg = darkMode ? 'bg-gray-800 border-gray-700 text-white focus:bg-gray-700' : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white';
//   const botBubbleBg = darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700';
//   const userBubbleBg = 'bg-[#008751] text-white';

//   return (
//     <main className={`flex flex-col relative w-full h-full font-sans transition-colors duration-300 ${mainBg}`}>
      
//       {/* --- Chat Header --- */}
//       {/* <header className={`h-16 border-b flex items-center justify-between px-6 shrink-0 backdrop-blur-sm z-10 transition-colors ${headerBg}`}>
//         <div className="flex items-center gap-4">
//           <button className={`p-2 -ml-2 rounded-lg lg:hidden transition-colors ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
//             <Menu size={20} />
//           </button>
//           <h2 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>New Conversation</h2>
//         </div>

//         <div className="flex items-center gap-4">
//           <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border ${darkMode ? 'bg-green-900/30 text-green-400 border-green-900/50' : 'bg-green-50 text-[#008751] border-green-100'}`}>
//             AGENTIC RAG ACTIVE
//           </div>
//           <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
//             {darkMode ? <Sun size={20} /> : <Moon size={20} />}
//           </button>
//         </div>
//       </header> */}

//       {/* --- Chat Messages Area --- */}
//       <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
        
//         {messages.map((msg) => (
//           <div key={msg.id} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
            
//             {/* Bot Avatar */}
//             {msg.role === 'bot' && (
//               <div className="w-8 h-8 rounded-lg bg-[#008751] flex items-center justify-center shrink-0 shadow-sm text-white mt-1">
//                  <ShieldCheck size={18} />
//               </div>
//             )}

//             {/* Message Bubble */}
//             <div className={`px-6 py-4 shadow-sm leading-relaxed max-w-xl text-sm md:text-base ${
//               msg.role === 'user' 
//                 ? `${userBubbleBg} rounded-2xl rounded-tr-none` 
//                 : `${botBubbleBg} border rounded-2xl rounded-tl-none`
//             }`}>
//               {/* ✅ MARKDOWN RENDERING */}
//               {msg.role === 'bot' ? (
//                 <ReactMarkdown 
//                   components={{
//                     p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
//                     ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
//                     ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
//                     li: ({node, ...props}) => <li className="mb-1" {...props} />,
//                     strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
//                     a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
//                     h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 mt-4" {...props} />,
//                     h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 mt-3" {...props} />,
//                     code: ({node, inline, ...props}) => (
//                       inline 
//                         ? <code className={`px-1 py-0.5 rounded text-xs font-mono ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-red-500'}`} {...props} />
//                         : <code className={`block p-2 rounded text-xs font-mono overflow-x-auto ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`} {...props} />
//                     ),
//                   }}
//                 >
//                   {msg.text}
//                 </ReactMarkdown>
//               ) : (
//                 <p className="whitespace-pre-wrap">{msg.text}</p>
//               )}
//             </div>

//             {/* User Avatar */}
//             {msg.role === 'user' && (
//               <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm mt-1 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-500'}`}>
//                  <UserIcon size={18} />
//               </div>
//             )}
//           </div>
//         ))}

//         {/* Loading Indicator */}
//         {isLoading && (
//           <div className="flex gap-4 max-w-3xl mr-auto justify-start animate-pulse">
//             <div className="w-8 h-8 rounded-lg bg-[#008751]/50 flex items-center justify-center shrink-0 shadow-sm text-white mt-1">
//                <ShieldCheck size={18} />
//             </div>
//             <div className={`px-6 py-4 border rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 ${botBubbleBg}`}>
//               <Loader2 size={16} className="animate-spin text-[#008751]" />
//               <span className="text-sm opacity-70">Thinking...</span>
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* --- Chat Input Area --- */}
//       <div className={`p-6 pb-8 backdrop-blur top-shadow z-20 transition-colors ${footerBg}`}>
//         <div className="max-w-3xl mx-auto space-y-4">
//           <div className="relative group">
//             <input 
//               type="text" 
//               placeholder="Ask about the tax bills..." 
//               className={`w-full pl-6 pr-14 py-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#008751] transition-all shadow-sm ${inputBg} ${darkMode ? 'placeholder:text-gray-500' : 'placeholder:text-gray-400'}`}
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKeyDown}
//               disabled={isLoading}
//             />
//             <button 
//               onClick={handleSend}
//               disabled={!input || isLoading}
//               className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${input && !isLoading ? 'bg-[#008751] text-white hover:bg-[#007043]' : 'bg-transparent text-gray-400 cursor-not-allowed'}`}
//             >
//               <Send size={18} />
//             </button>
//           </div>

//           <div className={`flex justify-center items-center gap-6 text-xs font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
//             <div className={`flex items-center gap-1.5 cursor-pointer transition-colors ${darkMode ? 'hover:text-gray-300' : 'hover:text-gray-600'}`}>
//               <Lock size={12} />
//               <span>End-to-end encryption</span>
//             </div>
//             <div className={`flex items-center gap-1.5 cursor-pointer transition-colors ${darkMode ? 'hover:text-gray-300' : 'hover:text-gray-600'}`}>
//               <CheckCircle2 size={12} className="text-[#008751]" />
//               <span>RAG-verified sources</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* FAB */}
//       <div className="absolute bottom-8 right-8 z-30">
//         <button className={`w-12 h-12 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all group ${darkMode ? 'bg-gray-700' : 'bg-black'}`}>
//            <div className="relative">
//               <Sparkles size={20} className="group-hover:opacity-0 transition-opacity duration-300 absolute inset-0" />
//               <Command size={20} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//            </div>
//         </button>
//       </div>
//     </main>
//   );
// }




import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown'; 
import { 
  ShieldCheck, 
  Menu, 
  Moon, 
  Sun,
  Send, 
  Lock, 
  CheckCircle2, 
  Sparkles,
  Command,
  User as UserIcon,
  Loader2
} from 'lucide-react';

export default function TaxWiseChat() {
  // --- Theme State ---
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("app_preferences");
    return saved ? JSON.parse(saved).darkMode : false;
  });

  // --- Chat & User State ---
  const [input, setInput] = useState("");
  const [userName, setUserName] = useState("User");
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Auto-scroll ref
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // --- Get session from URL ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const session = urlParams.get('session');
    setSessionId(session);
  }, []);

  // --- Fetch User Data ---
  const fetchUserData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    try {
      const response = await fetch("http://127.0.0.1:8000/get/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        let fetchedName = "User";
        if (data.name) fetchedName = data.name;
        else if (data.full_name) fetchedName = data.full_name.split(' ')[0];
        
        setUserName(fetchedName);
        setUserId(data.user_id || data.id || null);
        
        return { name: fetchedName, userId: data.user_id || data.id || null };
      }
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
    return null;
  };

  useEffect(() => {
    const init = async () => {
      const userData = await fetchUserData();
      
      // Only set welcome message if we don't have any messages yet
      if (userData && messages.length === 0) {
        setMessages([
          { 
            id: 1, 
            role: 'bot', 
            text: `Hello ${userData.name}! I'm your TaxWise assistant. How can I help you understand the Nigerian Tax reforms today?` 
          }
        ]);
      }
    };

    init();
  }, []);

  // --- Load conversation history from backend ---
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!sessionId || sessionId === "default" || sessionId === "null") {
        // No session or default session, reset to welcome message
        const userData = await fetchUserData();
        if (userData) {
          setMessages([
            { 
              id: 1, 
              role: 'bot', 
              text: `Hello ${userData.name}! I'm your TaxWise assistant. How can I help you understand the Nigerian Tax reforms today?` 
            }
          ]);
        }
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) return;

      setIsLoadingHistory(true);
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
            // Convert backend history to frontend message format
            const historyMessages = data.history.map((msg, index) => ({
              id: index + 1,
              role: msg.role === 'human' ? 'user' : 'bot',
              text: msg.content
            }));
            setMessages(historyMessages);
          } else {
            // No history, show welcome message
            const userData = await fetchUserData();
            if (userData) {
              setMessages([
                { 
                  id: 1, 
                  role: 'bot', 
                  text: `Hello ${userData.name}! I'm your TaxWise assistant. How can I help you understand the Nigerian Tax reforms today?` 
                }
              ]);
            }
          }
        }
      } catch (error) {
        console.error("Error loading conversation history:", error);
        // On error, show welcome message
        const userData = await fetchUserData();
        if (userData) {
          setMessages([
            { 
              id: 1, 
              role: 'bot', 
              text: `Hello ${userData.name}! I'm your TaxWise assistant. How can I help you understand the Nigerian Tax reforms today?` 
            }
          ]);
        }
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (sessionId !== null) {
      loadConversationHistory();
    }
  }, [sessionId]);

  // --- Handle Chat Submission (STREAMING + MARKDOWN) ---
  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    
    // Notify sidebar about this new conversation if it's a valid session
    if (sessionId && sessionId !== "default") {
      // Dispatch event to let sidebar know about this conversation
      window.dispatchEvent(new CustomEvent('newConversationStarted', {
        detail: { sessionId }
      }));
    }
    
    // If this is the first user message in this session, update the sidebar preview
    const hasUserMessages = messages.some(msg => msg.role === 'user');
    if (sessionId && !hasUserMessages) {
      // Dispatch custom event to update sidebar preview
      window.dispatchEvent(new CustomEvent('updateConversationPreview', {
        detail: {
          sessionId: sessionId,
          firstMessage: userText
        }
      }));
    }
    
    setInput("");
    setIsLoading(true); // Show thinking spinner

    // 1. Add User Message
    const userMessage = { 
      id: Date.now(), 
      role: 'user', 
      text: userText 
    };
    
    // 2. Add an EMPTY Bot Message immediately (placeholder for streaming)
    const botMessageId = Date.now() + 1;
    const initialBotMessage = { 
      id: botMessageId, 
      role: 'bot', 
      text: "" 
    };
    
    setMessages(prev => [...prev, userMessage, initialBotMessage]);

    const token = localStorage.getItem("authToken");

    try {
      // Use the backend endpoint with proper session_id
      const response = await fetch("http://127.0.0.1:8000/ask/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          question: userText,
          session_id: sessionId || "default"
        }) 
      });

      if (!response.ok) throw new Error("Stream failed");

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let botTextAccumulator = "";

      setIsLoading(false); // Hide spinner, start showing text

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunkValue = decoder.decode(value, { stream: true });
          
          // Backend sends NDJSON, not Server-Sent Events
          const lines = chunkValue.split('\n').filter(line => line.trim() !== '');
          
          for (let line of lines) {
            try {
              const data = JSON.parse(line);
              
              // Check for token chunks
              if (data.type === 'token') {
                botTextAccumulator += data.content;
                
                // Update State: This triggers re-render, creating the typing effect
                setMessages(prevMessages => 
                  prevMessages.map(msg => 
                    msg.id === botMessageId 
                      ? { ...msg, text: botTextAccumulator } 
                      : msg
                  )
                );
              }
              // Check for done message
              else if (data.type === 'done') {
                done = true;
                break;
              }
            } catch (e) {
              console.error("Error parsing stream chunk", e, line);
            }
          }
        }
      }

    } catch (error) {
      console.error("Error fetching chat data:", error);
      // Remove the empty bot message and show error
      setMessages(prev => prev.filter(msg => msg.id !== botMessageId));
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'bot', 
        text: "Sorry, I'm having trouble connecting to the server right now. Please try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Theme Logic ---
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    const savedPrefs = localStorage.getItem("app_preferences");
    const prefs = savedPrefs ? JSON.parse(savedPrefs) : {};
    prefs.darkMode = newMode;
    localStorage.setItem("app_preferences", JSON.stringify(prefs));
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
  const mainBg = darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-slate-800';
  const headerBg = darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-100';
  const footerBg = darkMode ? 'bg-gray-900/90' : 'bg-white/90';
  const inputBg = darkMode ? 'bg-gray-800 border-gray-700 text-white focus:bg-gray-700' : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white';
  const botBubbleBg = darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700';
  const userBubbleBg = 'bg-[#008751] text-white';

  return (
    <main className={`flex flex-col relative w-full h-full font-sans transition-colors duration-300 ${mainBg}`}>
      
      {/* Loading history indicator */}
      {isLoadingHistory && (
        <div className="absolute inset-0 bg-gray-900/50 dark:bg-gray-900/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#008751]" />
            <span className="text-gray-700 dark:text-gray-300">Loading conversation...</span>
          </div>
        </div>
      )}

      {/* --- Chat Messages Area --- */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
            
            {/* Bot Avatar */}
            {msg.role === 'bot' && (
              <div className="w-8 h-8 rounded-lg bg-[#008751] flex items-center justify-center shrink-0 shadow-sm text-white mt-1">
                 <ShieldCheck size={18} />
              </div>
            )}

            {/* Message Bubble */}
            <div className={`px-6 py-4 shadow-sm leading-relaxed max-w-xl text-sm md:text-base ${
              msg.role === 'user' 
                ? `${userBubbleBg} rounded-2xl rounded-tr-none` 
                : `${botBubbleBg} border rounded-2xl rounded-tl-none`
            }`}>
              {/* ✅ MARKDOWN RENDERING */}
              {msg.role === 'bot' ? (
                <ReactMarkdown 
                  components={{
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 mt-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 mt-3" {...props} />,
                    code: ({node, inline, ...props}) => (
                      inline 
                        ? <code className={`px-1 py-0.5 rounded text-xs font-mono ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-red-500'}`} {...props} />
                        : <code className={`block p-2 rounded text-xs font-mono overflow-x-auto ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`} {...props} />
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>

            {/* User Avatar */}
            {msg.role === 'user' && (
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm mt-1 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-500'}`}>
                 <UserIcon size={18} />
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator for thinking */}
        {isLoading && (
          <div className="flex gap-4 max-w-3xl mr-auto justify-start animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-[#008751]/50 flex items-center justify-center shrink-0 shadow-sm text-white mt-1">
               <ShieldCheck size={18} />
            </div>
            <div className={`px-6 py-4 border rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 ${botBubbleBg}`}>
              <Loader2 size={16} className="animate-spin text-[#008751]" />
              <span className="text-sm opacity-70">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* --- Chat Input Area --- */}
      <div className={`p-6 pb-8 backdrop-blur top-shadow z-20 transition-colors ${footerBg}`}>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Ask about the tax bills..." 
              className={`w-full pl-6 pr-14 py-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#008751] transition-all shadow-sm ${inputBg} ${darkMode ? 'placeholder:text-gray-500' : 'placeholder:text-gray-400'}`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || isLoadingHistory}
            />
            <button 
              onClick={handleSend}
              disabled={!input || isLoading || isLoadingHistory}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${input && !isLoading && !isLoadingHistory ? 'bg-[#008751] text-white hover:bg-[#007043]' : 'bg-transparent text-gray-400 cursor-not-allowed'}`}
            >
              <Send size={18} />
            </button>
          </div>

          <div className={`flex justify-center items-center gap-6 text-xs font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <div className={`flex items-center gap-1.5 cursor-pointer transition-colors ${darkMode ? 'hover:text-gray-300' : 'hover:text-gray-600'}`}>
              <Lock size={12} />
              <span>End-to-end encryption</span>
            </div>
            <div className={`flex items-center gap-1.5 cursor-pointer transition-colors ${darkMode ? 'hover:text-gray-300' : 'hover:text-gray-600'}`}>
              <CheckCircle2 size={12} className="text-[#008751]" />
              <span>RAG-verified sources</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <div className="absolute bottom-8 right-8 z-30">
        <button className={`w-12 h-12 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all group ${darkMode ? 'bg-gray-700' : 'bg-black'}`}>
           <div className="relative">
              <Sparkles size={20} className="group-hover:opacity-0 transition-opacity duration-300 absolute inset-0" />
              <Command size={20} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
           </div>
        </button>
      </div>
    </main>
  );
}