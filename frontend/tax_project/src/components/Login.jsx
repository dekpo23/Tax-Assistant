import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { HashRouter, NavLink } from "react-router-dom";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";

function Login() {
  const [user_info, setUser_info] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function validate() {
    const newErrors = {};
    if (!user_info.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(user_info.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!user_info.password) {
      newErrors.password = 'Password is required';
    }
    return newErrors;
  }

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

      const response = await fetch("Api-url", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user_info),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid email or password");
      }

      setSuccess("Login successful!");
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-200 rounded-full blur-3xl opacity-50"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in duration-700">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white shadow-xl rounded-2xl mb-4 border border-slate-100">
            <ShieldCheck className="text-[#008751]" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">TaxWise Nigeria</h1>
          <p className="text-slate-500 mt-2 text-sm">Empowering citizens with policy clarity</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-green-900/5 border border-slate-100">
          <div className="mb-8">
            <h2 className="text-2xl text-center font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-center text-sm mt-1">Please sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email address</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-3.5 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                <input 
                  type="email"
                  name="email"
                  value={user_info.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all focus:ring-2 focus:bg-white ${
                    errors.email 
                    ? 'border-red-200 focus:ring-red-100 text-red-900' 
                    : 'border-slate-200 focus:ring-green-100 focus:border-[#008751]'
                  }`}
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
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] text-[#008751] font-bold hover:underline cursor-pointer">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className={`absolute left-4 top-3.5 transition-colors ${errors.password ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={user_info.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all focus:ring-2 focus:bg-white ${
                    errors.password 
                    ? 'border-red-200 focus:ring-red-100 text-red-900' 
                    : 'border-slate-200 focus:ring-green-100 focus:border-[#008751]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Sign in</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>

            {/* API Feedback Alerts */}
            {apiError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-medium">
                <AlertCircle size={14} />
                <span>{apiError}</span>
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2 text-green-700 text-xs font-medium">
                <ShieldCheck size={14} className="text-green-600" />
                <span>{success}</span>
              </div>
            )}

            {/* Divider and SSO */}
            <div className="pt-4">
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Or</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>
              
              <button 
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.99] cursor-pointer"
              >
                <FcGoogle size={24}/>
                <span>Sign in with Google</span>
              </button>
            </div>
          </form>

          {/* Create Account Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{" "}
              <NavLink 
                to="/signup" 
                className="text-[#008751] font-black hover:underline underline-offset-4"
              >
                Create Account
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;