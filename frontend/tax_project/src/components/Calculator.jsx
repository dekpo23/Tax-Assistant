import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom'; // ✅ 1. Import Context
import { 
  Calculator, 
  TrendingUp, 
  Search, 
  Sparkles, 
  Command,
  Info,
  Loader2,
  Menu // ✅ 2. Import Menu Icon
} from 'lucide-react';

export default function TaxCalculator() {
  // ✅ 3. Get toggle function from parent Layout
  const { toggleSidebar } = useOutletContext() || {};

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

  // --- Calculator Logic ---
  const [income, setIncome] = useState(5000000);
  const [debouncedIncome, setDebouncedIncome] = useState(income);
  const [results, setResults] = useState({
    currentTax: 0,
    proposedTax: 0,
    relief: 0,
    currentRate: 0,
    proposedRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedIncome(income);
    }, 500); 
    return () => clearTimeout(timer);
  }, [income]);

  // API Call Logic
  useEffect(() => {
    const fetchTaxImpact = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://fashionable-demeter-ajeessolutions-c2d97d4a.koyeb.app/public/impact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "authorization": `Bearer ${localStorage.getItem("authToken") || ""}`
          },
          body: JSON.stringify({ monthly_income: debouncedIncome }),
        });

        if (!response.ok) throw new Error('Failed to calculate tax');

        const jsonData = await response.json();
        const data = jsonData.data;

        setResults({
          currentTax: data.current.annual_tax,
          proposedTax: data.proposed.annual_tax,
          relief: data.impact.monthly_relief,
          currentRate: data.current.effective_rate,
          proposedRate: data.proposed.effective_rate
        });

      } catch (err) {
        console.error(err);
        setError("Calculation failed");
      } finally {
        setLoading(false);
      }
    };
    fetchTaxImpact();
  }, [debouncedIncome]);

  const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // --- Dynamic Color Classes ---
  const mainBg = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-slate-800';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const inputBg = darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-700';
  const headerBg = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className={`flex flex-col h-full font-sans transition-colors duration-300 ${mainBg}`}>
      
      {/* ✅ INTEGRATED HEADER 
          Acts as the Navbar on mobile (with Menu button) and standard Header on desktop.
      */}
      

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-7xl mx-auto">
          
          {/* Left Column: Input */}
          <div className="xl:col-span-4 space-y-6">
            <div className={`p-6 rounded-2xl shadow-sm border h-full flex flex-col transition-colors ${cardBg}`}>
              <div className="flex items-center gap-2 mb-6">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                  <Calculator className="text-[#008751]" size={20} />
                </div>
                <h3 className={`text-lg font-bold ${textPrimary}`}>Impact Calculator</h3>
              </div>

              <div className="mb-8">
                <label className={`text-xs font-bold mb-2 block uppercase tracking-wider ${textSecondary}`}>Monthly Income (Gross)</label>
                <div className="relative group">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold group-focus-within:text-[#008751] transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>₦</span>
                  <input 
                    type="number" 
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className={`w-full pl-10 pr-4 py-4 rounded-xl font-bold text-lg focus:outline-none focus:border-[#008751] focus:ring-4 focus:ring-green-500/10 transition-all ${inputBg}`}
                  />
                  {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="animate-spin text-[#008751]" size={20} />
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-10 px-1">
                <input 
                  type="range" 
                  min="100000" 
                  max="20000000" 
                  step="50000"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#008751] hover:accent-[#006741]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                  <span>₦100k</span>
                  <span>₦20m</span>
                </div>
              </div>

              {/* Result Box */}
              <div className={`p-6 rounded-xl border mt-auto relative overflow-hidden transition-colors ${darkMode ? 'bg-[#008751]/20 border-[#008751]/30' : 'bg-[#e6f4ea] border-green-100'}`}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <TrendingUp size={100} color="#008751" />
                </div>
                
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div className="text-xs font-bold text-[#008751] uppercase tracking-wide opacity-80">Estimated Monthly Relief</div>
                  <span className={`text-[10px] font-bold text-[#008751] px-2 py-1 rounded-md shadow-sm backdrop-blur-sm ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'}`}>
                    {results.relief >= 0 ? 'Tax Savings' : 'Tax Increase'}
                  </span>
                </div>
                
                <div className={`text-3xl font-black relative z-10 tracking-tight ${darkMode ? 'text-green-400' : 'text-[#003b22]'}`}>
                  {error ? (
                    <span className="text-red-500 text-lg">Error calculating</span>
                  ) : loading ? (
                    <span className="opacity-50 text-2xl">Updating...</span>
                  ) : (
                    formatNaira(results.relief)
                  )}
                </div>
                <div className="text-xs text-[#008751] mt-1 font-medium opacity-70">Based on proposed 2026 adjustments</div>
              </div>
            </div>
          </div>

          {/* Middle Column: Charts */}
          <div className="xl:col-span-4 space-y-6">
            <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${cardBg}`}>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100/10 pb-4">Yearly Comparison</h4>
              
              <div className="space-y-8">
                {/* Current Bar */}
                <div className="group">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={`font-medium transition-colors ${darkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-700'}`}>Current (2024 PITA)</span>
                    <span className={`font-bold ${textPrimary}`}>
                        {loading ? '...' : formatNaira(results.currentTax)}
                    </span>
                  </div>
                  <div className={`h-3 w-full rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="h-full bg-slate-400 rounded-full transition-all duration-500 ease-out" style={{ width: '100%' }}></div>
                  </div>
                </div>

                {/* Proposed Bar */}
                <div className="group">
                  <div className="flex justify-between text-sm mb-2 items-center">
                    <span className="text-[#008751] font-bold">Proposed (2026 Reform)</span>
                    <div className="flex items-center gap-2">
                       <span className={`text-[10px] text-[#008751] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>Pro-Poor</span>
                       <span className="font-bold text-[#008751]">
                           {loading ? '...' : formatNaira(results.proposedTax)}
                       </span>
                    </div>
                  </div>
                  <div className={`h-3 w-full rounded-full overflow-hidden ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                    <div 
                        className="h-full bg-[#008751] rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${results.currentTax > 0 ? (results.proposedTax / results.currentTax) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className={`grid grid-cols-2 gap-4 mt-8 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className={`text-center p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Current Eff. Rate</div>
                  <div className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-slate-700'}`}>{results.currentRate}%</div>
                </div>
                <div className={`text-center p-3 rounded-lg border ${darkMode ? 'bg-[#008751]/10 border-[#008751]/30' : 'bg-[#e6f4ea] border-green-100'}`}>
                  <div className="text-[10px] text-[#008751] font-bold uppercase mb-1">Proposed Eff. Rate</div>
                  <div className="text-xl font-bold text-[#008751]">{results.proposedRate}%</div>
                </div>
              </div>
            </div>

            {/* Quote Card */}
            <div className="bg-[#003b22] p-8 rounded-2xl shadow-lg text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20 transform group-hover:scale-110 transition-transform duration-700">
                <TrendingUp size={80} />
              </div>
              <div className="relative z-10">
                <div className="mb-4 opacity-50"><Info size={24} /></div>
                <p className="font-medium text-lg leading-relaxed mb-6 text-green-50">
                  "The 2024 Reform aims to reduce the burden on the bottom 90% of earners while ensuring top earners contribute their fair share."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 bg-green-400/50"></div>
                  <div className="text-xs text-green-400 font-bold tracking-widest uppercase">Presidential Tax Committee</div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#008751] rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute top-10 -left-10 w-24 h-24 bg-[#008751] rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>

          {/* Right Column: Highlights & FAB */}
          <div className="xl:col-span-4 space-y-6">
            <div className={`p-6 rounded-2xl shadow-sm border h-full flex flex-col transition-colors ${cardBg}`}>
              <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                <TrendingUp className="text-[#008751]" size={20} />
                <h3 className={`font-bold ${textPrimary}`}>Reform Highlights</h3>
              </div>

              <div className="space-y-8 flex-1">
                <HighlightItem 
                  title="VAT DERIVATION" 
                  desc="Derivation factor increased to 60%. VAT follows the place of consumption, not headquarters."
                  darkMode={darkMode}
                />
                <HighlightItem 
                  title="SME TAX FREE" 
                  desc="Companies with annual turnover under ₦50m (was ₦25m) are 100% exempt from income tax."
                  darkMode={darkMode}
                />
                <HighlightItem 
                  title="FOOD & HEALTH" 
                  desc="0% VAT on basic food, healthcare, and educational books remains protected."
                  darkMode={darkMode}
                />
              </div>

              <div className={`mt-8 p-5 rounded-xl border ${darkMode ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Related Search</div>
                <div className="space-y-3">
                  <SearchItem text="Is my 2025 salary affected?" darkMode={darkMode} />
                  <SearchItem text="Corporate tax reduction" darkMode={darkMode} />
                  <SearchItem text="Development levy changes" darkMode={darkMode} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-30">
        <button className={`w-14 h-14 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all group border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-black border-gray-800'}`}>
           <div className="relative">
              <Sparkles size={24} className="group-hover:opacity-0 transition-opacity duration-300 absolute inset-0 text-yellow-400" />
              <Command size={24} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
           </div>
        </button>
      </div>

    </div>
  );
}

// Helper Components
function HighlightItem({ title, desc, darkMode }) {
  return (
    <div className="group">
      <h4 className="text-xs font-bold text-[#008751] uppercase mb-1.5 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#008751]"></span>
        {title}
      </h4>
      <p className={`text-sm leading-relaxed pl-3.5 border-l-2 border-transparent group-hover:border-green-100 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {desc}
      </p>
    </div>
  );
}

function SearchItem({ text, darkMode }) {
  return (
    <div className={`flex items-center gap-3 text-sm cursor-pointer group p-2 rounded-lg transition-all ${darkMode ? 'text-gray-300 hover:text-[#008751] hover:bg-gray-600' : 'text-slate-600 hover:text-[#008751] hover:bg-white'}`}>
      <Search size={14} className="text-gray-400 group-hover:text-[#008751]" />
      <span className="font-medium">{text}</span>
    </div>
  );
}