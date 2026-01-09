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
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: 'bot', 
      text: "Hello! I'm your TaxWise assistant. How can I help you understand the Nigerian Tax reforms today?" 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-scroll ref
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // --- Fetch User Data ---
  useEffect(() => {
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

        if (response.ok) {
          const data = await response.json();
          let fetchedName = "User";
          if (data.name) fetchedName = data.name;
          else if (data.full_name) fetchedName = data.full_name.split(' ')[0];
          
          setUserName(fetchedName);
          
          setMessages(prev => prev.map(msg => 
            msg.id === 1 ? { ...msg, text: `Hello ${fetchedName}! How can I help you understand the Nigerian Tax reforms today?` } : msg
          ));
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserData();
  }, []);

  // --- Handle Chat Submission (FIXED STREAMING LOGIC) ---
  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");
    setIsLoading(true); 

    // 1. Add User Message
    const userMessage = { id: Date.now(), role: 'user', text: userText };
    
    // 2. Add an EMPTY Bot Message immediately
    const botMessageId = Date.now() + 1;
    const initialBotMessage = { id: botMessageId, role: 'bot', text: "" };
    
    setMessages(prev => [...prev, userMessage, initialBotMessage]);

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch("https://fashionable-demeter-ajeessolutions-c2d97d4a.koyeb.app/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ question: userText }) 
      });

      if (!response.ok) throw new Error("Stream failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let botTextAccumulator = "";
      let buffer = ""; // Buffer to hold incomplete JSON chunks

      setIsLoading(false); 

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunkValue = decoder.decode(value, { stream: true });
          buffer += chunkValue;
          
          // ✅ FIX: Split by newline (\n) instead of double newline
          // Your backend sends NDJSON (Newline Delimited JSON)
          const lines = buffer.split("\n");
          
          // Keep the last piece in buffer (it might be incomplete)
          buffer = lines.pop(); 

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              // ✅ FIX: Parse directly (no 'data:' prefix check needed for NDJSON)
              const data = JSON.parse(line);

              // Handle "token" type updates
              if (data.type === "token" && data.content) {
                botTextAccumulator += data.content;
                
                setMessages(prevMessages => 
                  prevMessages.map(msg => 
                    msg.id === botMessageId 
                      ? { ...msg, text: botTextAccumulator } 
                      : msg
                  )
                );
              }
              // Handle "done" or "error" if needed
              else if (data.type === "error") {
                 throw new Error(data.message);
              }

            } catch (e) {
              console.error("Error parsing JSON line:", e, line);
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
              {/* Markdown Rendering */}
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