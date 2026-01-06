import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Menu, 
  Moon, 
  Send, 
  Lock, 
  CheckCircle2, 
  Sparkles,
  Command
} from 'lucide-react';

export default function TaxWiseChat() {
  const [input, setInput] = useState("");
  
  return (
    // Main container set to fill available space (width & height)
    <main className="flex flex-col relative bg-white w-full h-full font-sans text-slate-800">
      
      {/* --- Chat Header --- */}
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 shrink-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Trigger (Optional: keep if you need mobile sidebar toggle) */}
          <button className="p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 lg:hidden">
            <Menu size={20} />
          </button>
          <h2 className="font-semibold text-gray-800">New Conversation</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Agentic RAG Badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-green-50 text-[#008751] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border border-green-100">
            AGENTIC RAG ACTIVE
          </div>
          {/* Theme Toggle */}
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
            <Moon size={20} />
          </button>
        </div>
      </header>


      {/* --- Chat Messages Area --- */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
        
        {/* Bot Message Bubble */}
        <div className="flex gap-4 max-w-3xl mx-auto">
          {/* Bot Avatar */}
          <div className="w-8 h-8 rounded-lg bg-[#008751] flex items-center justify-center shrink-0 shadow-sm text-white">
             <ShieldCheck size={18} />
          </div>
          {/* Message Content */}
          <div className="border border-gray-200 rounded-2xl rounded-tl-none px-6 py-4 bg-white shadow-sm text-gray-700 leading-relaxed max-w-xl">
            <p>Hello Ngozi! How can I help you understand the Nigerian Tax reforms today?</p>
          </div>
        </div>

      </div>


      {/* --- Chat Input Area (Footer) --- */}
      <div className="p-6 pb-8 bg-white/90 backdrop-blur top-shadow z-20">
        <div className="max-w-3xl mx-auto space-y-4">
          
          {/* Input Wrapper */}
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Ask about the tax bills..." 
              className="w-full pl-6 pr-14 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#008751] transition-all shadow-sm placeholder:text-gray-400 text-gray-700"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            {/* Send Button */}
            <button 
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${input ? 'bg-[#008751] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              disabled={!input}
            >
              <Send size={18} />
            </button>
          </div>

          {/* Footer Meta Links */}
          <div className="flex justify-center items-center gap-6 text-xs text-gray-400 font-medium">
            <div className="flex items-center gap-1.5 hover:text-gray-600 cursor-pointer transition-colors">
              <Lock size={12} />
              <span>End-to-end encryption</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-gray-600 cursor-pointer transition-colors">
              <CheckCircle2 size={12} className="text-[#008751]" />
              <span>RAG-verified sources</span>
            </div>
          </div>

        </div>
      </div>

      {/* --- Floating Action Button (FAB) --- */}
      <div className="absolute bottom-8 right-8 z-30">
        <button className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all group">
           <div className="relative">
              <Sparkles size={20} className="group-hover:opacity-0 transition-opacity duration-300 absolute inset-0" />
              <Command size={20} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
           </div>
        </button>
      </div>

    </main>
  );
}