import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  Sun, 
  Camera, 
  CheckCircle,
  LogOut, 
} from 'lucide-react';

export default function TaxWiseSettings() {
  const navigate = useNavigate();

  // --- Theme State Management ---
  const [darkMode, setDarkMode] = useState(() => {
    const savedPrefs = localStorage.getItem("app_preferences");
    return savedPrefs ? JSON.parse(savedPrefs).darkMode : false;
  });

  const [emailAlerts, setEmailAlerts] = useState(() => {
    const savedPrefs = localStorage.getItem("app_preferences");
    return savedPrefs ? JSON.parse(savedPrefs).emailAlerts : false;
  });
  
  const [user, setUser] = useState({
    fullName: "Jane Doe",
    email: "JaneDoe@gmail.com",
    bio: ""
  });

  // --- Effects ---
  useEffect(() => {
    const preferences = { darkMode, emailAlerts };
    localStorage.setItem("app_preferences", JSON.stringify(preferences));
    
    // Dispatch event so the Global Navbar (in App.js) knows the theme changed
    window.dispatchEvent(new Event("storage"));

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, emailAlerts]);

  // Sync with Global Navbar theme changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("app_preferences");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.darkMode !== darkMode) setDarkMode(parsed.darkMode);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [darkMode]);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/get/user", {
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
        email: data.email || "",
        bio: data.bio || ""
      });
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token || token.trim() === "") {
      navigate("/");
      return; 
    }
    fetchUserData(token);
  }, [navigate]);

  const Logout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    // Note: App.js handles the scrolling (overflow-y-auto) and the main background color.
    // We just provide the container and content here.
    <div className={`w-full font-sans transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
      
      {/* ❌ REMOVED: Local Navbar. The Global Navbar in App.js now handles the menu. */}

      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        
        {/* Page Title & Logout */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account Settings</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Manage your profile and preferences</p>
          </div>

          <button 
            className='flex items-center gap-2 text-red-500 font-bold hover:bg-red-50/10 px-4 py-2 rounded-lg transition-colors' 
            onClick={Logout}
          >
            <LogOut size={20} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Profile & Prefs) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Profile Card */}
            <div className={`p-8 rounded-2xl shadow-sm border flex flex-col items-center text-center transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="relative mb-4 group cursor-pointer">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-green-50 shadow-inner bg-orange-50">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className={`absolute bottom-0 right-0 p-1.5 rounded-full shadow-md border transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-100 text-gray-600'}`}>
                  <Camera size={16} />
                </div>
              </div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.fullName}</h3>
              <p className="text-gray-400 text-sm mt-1">{user.email}</p>
            </div>

            {/* Preferences Card */}
            <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Preferences</h4>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-3 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Sun size={18} className="text-orange-400" />
                    Dark Mode
                  </div>
                  <ToggleSwitch checked={darkMode} onChange={setDarkMode} />
                </div>

                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-3 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
            <div className={`p-8 rounded-2xl shadow-sm border transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    value={user.fullName}
                    onChange={(e) => setUser({...user, fullName: e.target.value})}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#008751] transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50/50 border-gray-200 text-gray-700'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                  <input 
                    type="email" 
                    value={user.email}
                    readOnly
                    className={`w-full px-4 py-3 rounded-lg border cursor-not-allowed ${darkMode ? 'bg-gray-900 border-gray-700 text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio</label>
                <textarea 
                  rows="4"
                  placeholder="Tell us about your professional background..."
                  value={user.bio}
                  onChange={(e) => setUser({...user, bio: e.target.value})}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#008751] transition-all resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-gray-50/50 border-gray-200 text-gray-700 placeholder:text-gray-400'}`}
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
            <div className={`p-8 rounded-2xl border border-dashed transition-colors ${darkMode ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50/50 border-red-100'}`}>
              <h3 className="text-red-600 font-bold mb-2">Danger Zone</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-lg">
                Once you delete your account, all your tax simulations and chat history will be permanently removed.
              </p>
              <button className={`px-5 py-2.5 font-semibold rounded-lg text-sm transition-colors border ${darkMode ? 'bg-red-900/20 hover:bg-red-900/30 text-red-500 border-red-900/30' : 'bg-red-100 hover:bg-red-200 text-red-700 border-red-200/50'}`}>
                Delete Account
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
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