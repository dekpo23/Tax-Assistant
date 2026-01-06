import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Search, 
  Sparkles, 
  Command,
  Info
} from 'lucide-react';

export default function TaxCalculator() {
  const [income, setIncome] = useState(5000000);
  const [results, setResults] = useState({
    currentTax: 0,
    proposedTax: 0,
    relief: 0,
    currentRate: 0,
    proposedRate: 0
  });
  const [loading, setLoading] = useState(false);

  // --- OPTION 1: Frontend Logic (For immediate interactivity) ---
  useEffect(() => {
    // Simple mock formula to make the UI move
    const yearlyIncome = income * 12;
    // Mocking a progressive tax calculation
    const currentYearlyTax = yearlyIncome * 0.2365; 
    const proposedYearlyTax = yearlyIncome * 0.2155; 
    
    setResults({
      currentTax: currentYearlyTax,
      proposedTax: proposedYearlyTax,
      relief: (currentYearlyTax - proposedYearlyTax) / 12, // Monthly relief
      currentRate: 23.7,
      proposedRate: 21.6
    });
  }, [income]);

  /* --- OPTION 2: Backend Integration (Uncomment when ready) ---
  useEffect(() => {
    const fetchCalculation = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/calculate-tax', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ monthly_income: income })
        });
        const data = await response.json();
        setResults(data); // Expecting backend to return matching structure
      } catch (error) {
        console.error("Calculation failed:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce to prevent too many API calls while sliding
    const timer = setTimeout(fetchCalculation, 500);
    return () => clearTimeout(timer);
  }, [income]);
  */

  const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 font-sans text-slate-800">
      
      {/* Header */}
      <header className="h-16 border-b border-gray-200 bg-white px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
        <h2 className="text-lg font-bold text-gray-800">Calculator Interface</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#e6f4ea] text-[#008751] px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border border-green-100">
            Problem 1: Tax Reform
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 cursor-pointer hover:bg-gray-300 transition-colors">
            ME
          </div>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-7xl mx-auto">
          
          {/* Left Column: Calculator Input */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Calculator className="text-[#008751]" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Impact Calculator</h3>
              </div>

              <div className="mb-8">
                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Monthly Income (Gross)</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-[#008751] transition-colors">₦</span>
                  <input 
                    type="number" 
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 text-lg focus:outline-none focus:border-[#008751] focus:ring-4 focus:ring-green-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Slider */}
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
              <div className="bg-[#e6f4ea] p-6 rounded-xl border border-green-100 mt-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <TrendingUp size={100} color="#008751" />
                </div>
                
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div className="text-xs font-bold text-[#008751] uppercase tracking-wide opacity-80">Estimated Monthly Relief</div>
                  <span className="text-[10px] font-bold text-[#008751] bg-white/80 px-2 py-1 rounded-md shadow-sm backdrop-blur-sm">+9% take-home</span>
                </div>
                
                <div className="text-3xl font-black text-[#003b22] relative z-10 tracking-tight">
                  {loading ? "Calculating..." : formatNaira(results.relief)}
                </div>
                <div className="text-xs text-[#008751] mt-1 font-medium opacity-70">Based on proposed 2026 adjustments</div>
              </div>
            </div>
          </div>

          {/* Middle Column: Comparison Charts */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Chart Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Yearly Comparison</h4>
              
              <div className="space-y-8">
                {/* Current Bar */}
                <div className="group">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500 font-medium group-hover:text-gray-700 transition-colors">Current (2024 PITA)</span>
                    <span className="font-bold text-gray-700">{formatNaira(results.currentTax)}</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full transition-all duration-500 ease-out" style={{ width: '85%' }}></div>
                  </div>
                </div>

                {/* Proposed Bar */}
                <div className="group">
                  <div className="flex justify-between text-sm mb-2 items-center">
                    <span className="text-[#008751] font-bold">Proposed (2026 Reform)</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] bg-green-100 text-[#008751] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Pro-Poor</span>
                       <span className="font-bold text-[#008751]">{formatNaira(results.proposedTax)}</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-green-50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#008751] rounded-full transition-all duration-500 ease-out" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Current Eff. Rate</div>
                  <div className="text-xl font-bold text-slate-700">{results.currentRate}%</div>
                </div>
                <div className="text-center p-3 bg-[#e6f4ea] rounded-lg border border-green-100">
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
              
              {/* Decorative Elements */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#008751] rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute top-10 -left-10 w-24 h-24 bg-[#008751] rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>

          {/* Right Column: Highlights */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
                <TrendingUp className="text-[#008751]" size={20} />
                <h3 className="font-bold text-gray-800">Reform Highlights</h3>
              </div>

              <div className="space-y-8 flex-1">
                <HighlightItem 
                  title="VAT DERIVATION" 
                  desc="Derivation factor increased to 60%. VAT follows the place of consumption, not headquarters."
                />
                <HighlightItem 
                  title="SME TAX FREE" 
                  desc="Companies with annual turnover under ₦50m (was ₦25m) are 100% exempt from income tax."
                />
                <HighlightItem 
                  title="FOOD & HEALTH" 
                  desc="0% VAT on basic food, healthcare, and educational books remains protected."
                />
              </div>

              {/* Related Search */}
              <div className="mt-8 bg-gray-50 p-5 rounded-xl border border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Related Search</div>
                <div className="space-y-3">
                  <SearchItem text="Is my 2025 salary affected?" />
                  <SearchItem text="Corporate tax reduction" />
                  <SearchItem text="Development levy changes" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="absolute bottom-8 right-8 z-30">
        <button className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all group border border-gray-800">
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
function HighlightItem({ title, desc }) {
  return (
    <div className="group">
      <h4 className="text-xs font-bold text-[#008751] uppercase mb-1.5 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#008751]"></span>
        {title}
      </h4>
      <p className="text-sm text-gray-500 leading-relaxed pl-3.5 border-l-2 border-transparent group-hover:border-green-100 transition-colors">
        {desc}
      </p>
    </div>
  );
}

function SearchItem({ text }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600 hover:text-[#008751] cursor-pointer group p-2 hover:bg-white rounded-lg transition-all">
      <Search size={14} className="text-gray-400 group-hover:text-[#008751]" />
      <span className="font-medium">{text}</span>
    </div>
  );
}