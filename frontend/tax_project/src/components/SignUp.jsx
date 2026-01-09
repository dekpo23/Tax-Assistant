import React, { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { NavLink, useNavigate } from "react-router-dom"; // Added useNavigate
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2
} from "lucide-react";

function SignUp() {
  const navigate = useNavigate(); // Hook for redirection after success

  // --- Theme State Management ---
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("app_preferences");
    return saved ? JSON.parse(saved).darkMode : false;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("app_preferences");
      if (saved) {
        setDarkMode(JSON.parse(saved).darkMode);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- FIX 1: State keys must match FastAPI Pydantic model (UserCreate) ---
  const [user_info, setUser_info] = useState({
    name: "",      // Changed from full_name
    email: "",
    password: "",  // Changed from password_hash (Frontend sends raw password, Backend hashes it)
    usertype: "user" // Optional: Explicitly sending default type
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Logic: Validation function
  function validate() {
    const newErrors = {};

    // Updated validation to use 'name' instead of 'full_name'
    if (!user_info.name.trim()) {
      newErrors.name = "Name is required";
    } else if (user_info.name.length < 2) {
      newErrors.name = "Name must have at least 2 characters";
    }

    if (!user_info.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(user_info.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Updated validation to use 'password'
    if (!user_info.password) {
      newErrors.password = 'Password is required';
    } else if (user_info.password.length < 6) {
      newErrors.password = "Password must have at least 6 characters";
    }
    
    return newErrors;
  }

  // Logic: Handle input change
  function handleChange(e) {
    const { name, value } = e.target;
    setUser_info({
      ...user_info,
      [name]: value
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    setApiError("");
  }

  // Logic: Form Submission
  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setSuccess("");
      setApiError("");

      const response = await fetch("https://fashionable-demeter-ajeessolutions-c2d97d4a.koyeb.app/auth/signup", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user_info),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific FastAPI error structure if available
        throw new Error(data.detail || "Signup failed. Please try again!");
      }

      setSuccess("Registration successful! Redirecting...");
      
      // Reset form
      setUser_info({ name: "", email: "", password: "", usertype: "user" });

      // Optional: Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // --- Styles (kept original) ---
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-slate-50';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700 shadow-black/20' : 'bg-white border-slate-100 shadow-green-900/5';
  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-slate-500';
  
  const inputBase = `w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none transition-all focus:ring-2`;
  const inputNormal = darkMode 
    ? "bg-gray-700 border-gray-600 text-white focus:bg-gray-700 focus:ring-green-500/20 focus:border-[#008751] placeholder:text-gray-500"
    : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-green-100 focus:border-[#008751] placeholder:text-slate-400";
  const inputErrorStyle = darkMode
    ? "bg-gray-700 border-red-500/50 text-red-300 focus:ring-red-900/30"
    : "bg-slate-50 border-red-200 text-red-900 focus:ring-red-100";
    
  const iconBaseColor = darkMode ? 'text-gray-500' : 'text-slate-400';
  const dividerColor = darkMode ? 'border-gray-700' : 'border-slate-100';

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans transition-colors duration-300 ${bgClass}`}>
      
      {/* Decorative background blurs */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-3xl opacity-50 ${darkMode ? 'bg-green-900/20' : 'bg-green-100'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-3xl opacity-50 ${darkMode ? 'bg-gray-800' : 'bg-slate-200'}`}></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in duration-700">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center p-3 shadow-xl rounded-2xl mb-4 border transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'}`}>
            <ShieldCheck className="text-[#008751]" size={32} />
          </div>
          <h1 className={`text-3xl font-black tracking-tight ${textPrimary}`}>TaxWise Nigeria</h1>
          <p className={`${textSecondary} mt-2 text-sm`}>Join the portal for policy and tax clarity</p>
        </div>

        <div className={`p-8 rounded-[2.5rem] shadow-2xl transition-colors ${cardBg}`}>
          <div className="mb-8">
            <h2 className={`text-2xl text-center font-bold ${textPrimary}`}>Create an account</h2>
            <p className={`${textSecondary} text-center text-sm mt-1`}>Please sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label className={`text-xs font-black uppercase tracking-widest ml-1 ${textSecondary}`}>Full Name</label>
              <div className="relative">
                <User className={`absolute left-4 top-3.5 transition-colors ${errors.name ? 'text-red-400' : iconBaseColor}`} size={18} />
                <input 
                  type="text"
                  name="name" // --- FIX 2: Changed name="full_name" to name="name"
                  value={user_info.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`${inputBase} border ${errors.name ? inputErrorStyle : inputNormal}`}
                />
              </div>
              {errors.name && (
                <div className="flex items-center gap-1.5 mt-1 ml-1 text-red-500 text-[11px] font-bold">
                  <AlertCircle size={12} />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className={`text-xs font-black uppercase tracking-widest ml-1 ${textSecondary}`}>Email address</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-3.5 transition-colors ${errors.email ? 'text-red-400' : iconBaseColor}`} size={18} />
                <input 
                  type="email"
                  name="email"
                  value={user_info.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`${inputBase} border ${errors.email ? inputErrorStyle : inputNormal}`}
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-1.5 mt-1 ml-1 text-red-500 text-[11px] font-bold">
                  <AlertCircle size={12} />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className={`text-xs font-black uppercase tracking-widest ml-1 ${textSecondary}`}>Password</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-3.5 transition-colors ${errors.password ? 'text-red-400' : iconBaseColor}`} size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password" // --- FIX 3: Changed name="password_hash" to name="password"
                  value={user_info.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`${inputBase} border ${errors.password ? inputErrorStyle : inputNormal}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-3.5 focus:outline-none transition-colors ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1.5 mt-1 ml-1 text-red-500 text-[11px] font-bold">
                  <AlertCircle size={12} />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#008751] text-white py-4 rounded-[1.25rem] font-bold shadow-lg shadow-green-900/20 hover:bg-[#007043] transition-all transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  <span>Signing up...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>

            {/* Feedback Alerts */}
            {apiError && (
              <div className={`p-3 border rounded-xl flex items-center gap-2 text-[11px] font-bold animate-in slide-in-from-top-1 ${darkMode ? 'bg-red-900/20 border-red-900/30 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
                <AlertCircle size={14} />
                <span>{apiError}</span>
              </div>
            )}
            {success && (
              <div className={`p-3 border rounded-xl flex items-center gap-2 text-[11px] font-bold animate-in slide-in-from-top-1 ${darkMode ? 'bg-green-900/20 border-green-900/30 text-green-400' : 'bg-green-50 border-green-100 text-green-700'}`}>
                <CheckCircle2 size={14} className="text-green-600" />
                <span>{success}</span>
              </div>
            )}

            {/* SSO / Divider */}
            <div className="pt-4">
              <div className="relative flex items-center py-4">
                <div className={`flex-grow border-t ${dividerColor}`}></div>
                <span className={`flex-shrink mx-4 text-[10px] font-bold uppercase tracking-widest ${textSecondary}`}>Or sign up with</span>
                <div className={`flex-grow border-t ${dividerColor}`}></div>
              </div>
              
              <button 
                type="button"
                className={`w-full flex items-center justify-center gap-3 py-3 px-4 border rounded-2xl text-sm font-semibold transition-all active:scale-[0.99] cursor-pointer ${darkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                <FcGoogle size={24}/>
                <span>Google</span>
              </button>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className={`mt-8 text-center border-t pt-6 ${darkMode ? 'border-gray-700' : 'border-slate-50'}`}>
            <p className={`text-sm ${textSecondary}`}>
              Already have an account?{" "}
              <NavLink 
                to="/" 
                className="text-[#008751] font-black hover:underline underline-offset-4"
              >
                Sign in
              </NavLink>
            </p>
          </div>
        </div>

        <p className={`text-center mt-8 text-[10px] uppercase tracking-[0.2em] font-bold ${textSecondary}`}>
          Federal Republic of Nigeria • Policy Portal
        </p>
      </div>
    </div>
  );
}
export default SignUp;