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
  const [messages, setMessages] = useState([]); // Start empty, load history later
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(localStorage.getItem("current_session_id"));
  
  // Auto-scroll ref
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // --- 1. Listen for Session Changes (from Sidebar) ---
  useEffect(() => {
    const handleSessionChange = () => {
        const newId = localStorage.getItem("current_session_id");
        setSessionId(newId);
    };

    window.addEventListener('new_chat_session', handleSessionChange);
    return () => window.removeEventListener('new_chat_session', handleSessionChange);
  }, []);

  // --- 2. Fetch User Data & Chat History ---
  useEffect(() => {
    const initializeChat = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      // A. Fetch User Name
      try {
        const userRes = await fetch("https://fashionable-demeter-ajeessolutions-c2d97d4a.koyeb.app/get/user", {
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserName(userData.name || "User");
        }
      } catch (e) { console.error("User fetch error", e); }

      // B. Fetch History or Set Default
      if (sessionId) {
          try {
              const historyRes = await fetch(`https://fashionable-demeter-ajeessolutions-c2d97d4a.koyeb.app/conversation/history/${sessionId}`, {
                  headers: { "Authorization": `Bearer ${token}` }
              });
              
              if (historyRes.ok) {
                  const data = await historyRes.json();
                  if (data.history && data.history.length > 0) {
                      // Format Backend History to Frontend State
                      const formattedMessages = data.history.map((msg, index) => ({
                          id: index, // Simple index ID
                          role: msg.role === 'human' ? 'user' : 'bot', // Map 'human' -> 'user', 'ai' -> 'bot'
                          text: msg.content
                      }));
                      setMessages(formattedMessages);
                  } else {
                      // Session exists but is empty? Show default.
                      setMessages([{ id: 'init', role: 'bot', text: `Welcome to TaxWise AI Assitant! How can I be of help?` }]);
                  }
              }
          } catch (e) {
              console.error("History fetch error", e);
          }
      } else {
          // No Session ID? It's a brand new (local) chat.
          setMessages([{ 
              id: 'init', 
              role: 'bot', 
              text: "Hello! I'm your TaxWise assistant. How can I help you understand the Nigerian Tax reforms today?" 
          }]);
      }
    };

    initializeChat();
  }, [sessionId]); // Re-run when session ID changes


  // --- Handle Chat Submission (Streaming) ---
  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");
    setIsLoading(true); 

    // 1. Add User Message
    const userMessage = { id: Date.now(), role: 'user', text: userText };
    
    // 2. Add an EMPTY Bot Message
    const botMessageId = Date.now() + 1;
    const initialBotMessage = { id: botMessageId, role: 'bot', text: "" };
    
    setMessages(prev => [...prev, userMessage, initialBotMessage]);

    const token = localStorage.getItem("authToken");
    // Use current session ID or empty (backend will handle default)
    const currentSession = localStorage.getItem("current_session_id");

    try {
      const response = await fetch("https://fashionable-demeter-ajeessolutions-c2d97d4a.koyeb.app/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
            question: userText,
            session_id: currentSession // Pass the session ID to backend
        }) 
      });

      if (!response.ok) throw new Error("Stream failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let botTextAccumulator = "";
      let buffer = ""; 

      setIsLoading(false); 

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunkValue = decoder.decode(value, { stream: true });
          buffer += chunkValue;
          
          const lines = buffer.split("\n");
          buffer = lines.pop(); 

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const data = JSON.parse(line);

              // 1. Capture Session ID if it's new (Metadata event)
              if (data.type === "meta" && data.session_id) {
                  // If we didn't have a session ID before, save it now!
                  if (!currentSession) {
                      localStorage.setItem("current_session_id", data.session_id);
                      setSessionId(data.session_id); // Update state to trigger re-renders if needed
                      
                      // Optional: Add to sidebar "Recents" locally if needed
                      // window.dispatchEvent(new Event("new_chat_session")); 
                  }
              }

              // 2. Handle Content Token
              if (data.type === "token" && data.content) {
                botTextAccumulator += data.content;
                setMessages(prevMessages => 
                  prevMessages.map(msg => 
                    msg.id === botMessageId ? { ...msg, text: botTextAccumulator } : msg
                  )
                );
              }
            } catch (e) {
              console.error("Error parsing JSON line:", e);
            }
          }
        }
      }

    } catch (error) {
      console.error("Error fetching chat data:", error);
      setMessages(prev => prev.filter(msg => msg.id !== botMessageId));
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'bot', 
        text: "Sorry, I'm having trouble connecting to the server right now." 
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

  // --- Dynamic Styles ---
  const mainBg = darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-slate-800';
  const footerBg = darkMode ? 'bg-gray-900/90' : 'bg-white/90';
  const inputBg = darkMode ? 'bg-gray-800 border-gray-700 text-white focus:bg-gray-700' : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white';
  const botBubbleBg = darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700';
  const userBubbleBg = 'bg-[#008751] text-white';

  return (
    <main className={`flex flex-col relative w-full h-full font-sans transition-colors duration-300 ${mainBg}`}>
      
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
              {msg.role === 'bot' ? (
                <ReactMarkdown 
                  components={{
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
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

        {/* Loading Indicator */}
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
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={!input || isLoading}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${input && !isLoading ? 'bg-[#008751] text-white hover:bg-[#007043]' : 'bg-transparent text-gray-400 cursor-not-allowed'}`}
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