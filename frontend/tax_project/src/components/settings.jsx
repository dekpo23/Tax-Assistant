import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MessageSquare, 
  Calculator, 
  Settings, 
  FileText, 
  TrendingUp, 
  Moon, 
  Sun, 
  Camera, 
  CheckCircle, 
  LogOut,
  ChevronRight,
  User,
  AlertTriangle
} from 'lucide-react';

export default function TaxWiseSettings() {
  const [darkMode, setDarkMode] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(false);
  
  // Mock User Data
  const [user, setUser] = useState({
    fullName: "Ngozi GoogleUser",
    email: "ngozi.bakare@gmail.com",
    bio: ""
  });

  return (
    <div className={`flex min-h-screen font-sans ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-slate-800'}`}>
      
      {/* --- Sidebar --- */}
      <aside className="w-64 bg-[#003b22] text-white flex flex-col shrink-0 fixed h-full z-10">
        {/* Brand */}
        <div className="p-6 flex items-center gap-3 font-bold text-xl">
          <ShieldCheck className="w-8 h-8 text-white" />
          <span>TaxWise NG</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <NavItem icon={<MessageSquare size={20} />} label="AI Assistant" />
          <NavItem icon={<Calculator size={20} />} label="Tax Calculator" />
          
          {/* Active Settings Tab */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#008751] text-white rounded-lg shadow-sm font-medium cursor-pointer border border-[#00a865]">
            <Settings size={20} />
            <span>Settings</span>
          </div>

          <div className="pt-6 pb-2 px-4 text-xs font-semibold text-green-200/50 uppercase tracking-wider">
            Policies
          </div>
          <NavItem icon={<FileText size={20} />} label="VAT Reform" />
          <NavItem icon={<TrendingUp size={20} />} label="SME Incentives" />
        </nav>

        {/* Sidebar Footer (User) */}
        <div className="p-4 border-t border-green-900/30">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-orange-200 overflow-hidden border border-white/20">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ngozi" alt="User" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Ngozi GoogleUser</p>
            </div>
            <ChevronRight size={16} className="text-green-300" />
          </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 ml-64 p-8">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-lg font-semibold text-gray-700">Settings Interface</h2>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-50 text-[#008751] px-3 py-1.5 rounded-full text-xs font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#008751]"></span>
              SECURE SESSION
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <Moon size={20} />
            </button>
          </div>
        </header>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 mt-1">Manage your profile and preferences</p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Profile & Prefs) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="relative mb-4 group cursor-pointer">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-green-50 shadow-inner bg-orange-50">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ngozi" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-gray-100 text-gray-600 hover:text-[#008751] transition-colors">
                  <Camera size={16} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{user.fullName}</h3>
              <p className="text-gray-400 text-sm mt-1">{user.email}</p>
            </div>

            {/* Preferences Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Preferences</h4>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-700 font-medium">
                    <Sun size={18} className="text-orange-400" />
                    Dark Mode
                  </div>
                  <ToggleSwitch checked={darkMode} onChange={setDarkMode} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-700 font-medium">
                    <div className="w-4 h-4 rounded-sm border-2 border-blue-400/50"></div>
                    Email Alerts
                  </div>
                  <ToggleSwitch checked={emailAlerts} onChange={setEmailAlerts} />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Forms) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Personal Info Form */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    value={user.fullName}
                    onChange={(e) => setUser({...user, fullName: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50/50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#008751] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                  <input 
                    type="email" 
                    value={user.email}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio</label>
                <textarea 
                  rows="4"
                  placeholder="Tell us about your professional background..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50/50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#008751] transition-all resize-none placeholder:text-gray-400"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button className="flex items-center gap-2 bg-[#008751] hover:bg-[#007043] text-white px-6 py-3 rounded-lg font-semibold shadow-sm shadow-green-200 transition-all active:scale-95">
                  <CheckCircle size={18} />
                  Save Changes
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/50 p-8 rounded-2xl border border-red-100 border-dashed">
              <h3 className="text-red-600 font-bold mb-2">Danger Zone</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-lg">
                Once you delete your account, all your tax simulations and chat history will be permanently removed.
              </p>
              <button className="px-5 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg text-sm transition-colors border border-red-200/50">
                Delete Account
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// Helper Components

function NavItem({ icon, label }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg cursor-pointer transition-colors">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button 
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#008751]' : 'bg-gray-200'}`}
    >
      <span 
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-1'}`} 
      />
    </button>
  );
}