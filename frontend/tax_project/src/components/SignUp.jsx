import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { NavLink } from "react-router-dom";
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
  const [user_info, setUser_info] = useState({
    full_name: "",
    email: "",
    password_hash: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [submit, setSubmit] = useState(false);

  // Logic: Validation function based on your snippet
  function validate() {
    const newErrors = {};

    if (!user_info.full_name.trim()) {
      newErrors.full_name = "Name is required";
    } else if (user_info.full_name.length < 2) {
      newErrors.full_name = "Name must have at least 2 characters";
    }

    if (!user_info.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(user_info.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!user_info.password_hash) {
      newErrors.password_hash = 'Password is required';
    } else if (user_info.password_hash.length < 6) {
      newErrors.password_hash = "Password must have at least 6 characters";
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

      const response = await fetch("Api-url", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user_info),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Signup failed. Please try again!");
      }

      setSubmit(true);
      setSuccess("Registration successful!");
      setUser_info({ full_name: "", email: "", password_hash: "" });

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
          <p className="text-slate-500 mt-2 text-sm">Join the portal for policy and tax clarity</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-green-900/5 border border-slate-100">
          <div className="mb-8">
            <h2 className="text-2xl text-center font-bold text-slate-900">Create an account</h2>
            <p className="text-slate-500 text-center text-sm mt-1">Please sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className={`absolute left-4 top-3.5 transition-colors ${errors.full_name ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                <input 
                  type="text"
                  name="full_name"
                  value={user_info.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all focus:ring-2 focus:bg-white ${
                    errors.full_name 
                    ? 'border-red-200 focus:ring-red-100 text-red-900' 
                    : 'border-slate-200 focus:ring-green-100 focus:border-[#008751]'
                  }`}
                />
              </div>
              {errors.full_name && (
                <div className="flex items-center gap-1.5 mt-1 ml-1 text-red-500 text-[11px] font-bold">
                  <AlertCircle size={12} />
                  <span>{errors.full_name}</span>
                </div>
              )}
            </div>

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
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-3.5 transition-colors ${errors.password_hash ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password_hash"
                  value={user_info.password_hash}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all focus:ring-2 focus:bg-white ${
                    errors.password_hash 
                    ? 'border-red-200 focus:ring-red-100 text-red-900' 
                    : 'border-slate-200 focus:ring-green-100 focus:border-[#008751]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password_hash && (
                <div className="flex items-center gap-1.5 mt-1 ml-1 text-red-500 text-[11px] font-bold">
                  <AlertCircle size={12} />
                  <span>{errors.password_hash}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#008751] text-white py-4 rounded-[1.25rem] font-bold shadow-lg shadow-green-900/20 hover:bg-[#007043] transition-all transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
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
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-[11px] font-bold animate-in slide-in-from-top-1">
                <AlertCircle size={14} />
                <span>{apiError}</span>
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2 text-green-700 text-[11px] font-bold animate-in slide-in-from-top-1">
                <CheckCircle2 size={14} className="text-green-600" />
                <span>{success}</span>
              </div>
            )}

            {/* SSO / Divider */}
            <div className="pt-4">
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Or sign up with</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>
              
              <button 
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.99]"
              >
                <FcGoogle size={24}/>
                <span>Google</span>
              </button>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 text-center border-t border-slate-50 pt-6">
            <p className="text-slate-500 text-sm">
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

        {/* Federal Republic Badge */}
        <p className="text-center mt-8 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
          Federal Republic of Nigeria • Policy Portal
        </p>
      </div>
    </div>
  );
}
export default SignUp;