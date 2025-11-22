import React, { useState, useRef } from 'react';
import { computeSalaryFromCTC, formatCurrency } from '../../utils/salaryUtils';

const HikeCalculator = () => {
  const [currentCtc, setCurrentCtc] = useState(5000000);
  const [monthlyInhand, setMonthlyInhand] = useState(30000);
  const [hikePercent, setHikePercent] = useState(10);
  const [basicPercent, setBasicPercent] = useState(40);
  const [taxRegime, setTaxRegime] = useState('new');

  const [showResults, setShowResults] = useState(false);
  const [before, setBefore] = useState(null);
  const [after, setAfter] = useState(null);
  const resultsRef = useRef(null);

  const handleCalculate = () => {
    const newCtc = Math.round(Number(currentCtc) * (1 + (Number(hikePercent) / 100)));
    const beforeRes = computeSalaryFromCTC({ ctc: Number(currentCtc) || 0, basicPercent, taxRegime });
    const afterRes = computeSalaryFromCTC({ ctc: newCtc, basicPercent, taxRegime });
    setBefore(beforeRes);
    setAfter(afterRes);
    setShowResults(true);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="p-8 rounded-3xl bg-white/6 dark:bg-black/30 border border-gray-200/30 dark:border-white/6">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Hike Calculator</h2>
        <p className="text-sm text-gray-700 dark:text-sky-200 mb-6">Calculate revised salary after a percentage hike</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Current Salary */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-yellow-200 dark:border-blue-700/40 text-gray-900 dark:text-white shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Current Salary</h3>
            <label className="text-xs text-gray-700 dark:text-sky-200">Current CTC (₹)</label>
            <input type="number" value={currentCtc} onChange={(e) => setCurrentCtc(parseFloat(e.target.value) || 0)} className="w-full mt-2 p-3 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
            <div className="text-xs text-gray-600 dark:text-sky-300 mt-2">{currentCtc >= 100000 ? 'Fifty lakh rupees' : ''}</div>

            <label className="text-xs text-gray-700 dark:text-sky-200 mt-4">Current Monthly In-hand (₹)</label>
            <input type="number" value={monthlyInhand} onChange={(e) => setMonthlyInhand(parseFloat(e.target.value) || 0)} className="w-full mt-2 p-3 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
            <div className="text-xs text-gray-600 dark:text-sky-300 mt-2">{monthlyInhand >= 1000 ? 'Thirty thousand rupees' : ''}</div>

            <hr className="my-4 border-gray-200 dark:border-slate-700" />

            <h4 className="text-sm font-medium text-gray-800 dark:text-sky-200 mb-2">Hike Details</h4>
            <label className="text-xs text-gray-700 dark:text-sky-200">Hike Percentage (%)</label>
            <input type="number" value={hikePercent} onChange={(e) => setHikePercent(parseFloat(e.target.value) || 0)} className="w-32 mt-2 p-2 rounded bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />

            <label className="text-xs text-gray-700 dark:text-sky-200 mt-4 block">Tax Regime</label>
            <select value={taxRegime} onChange={(e) => setTaxRegime(e.target.value)} className="w-full mt-2 p-2 rounded bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent">
              <option value="new">New Regime</option>
              <option value="old">Old Regime</option>
            </select>
          </div>

          {/* Right: Revised Salary */}
          <div className="p-6 rounded-2xl bg-white dark:bg-transparent border border-emerald-200 dark:border-emerald-700/30 text-gray-900 dark:text-white shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Revised Salary</h3>
            <div className="mt-3 text-gray-700 dark:text-sky-200">
              <div className="text-sm">New CTC</div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-2">{formatCurrency(Math.round(Number(currentCtc) * (1 + (Number(hikePercent) / 100))))}</div>
              <div className="text-xs text-gray-600 dark:text-sky-300 mt-1">Increase: {formatCurrency(Math.round(Number(currentCtc) * (Number(hikePercent) / 100)))} ({hikePercent}%)</div>

              <hr className="my-4 border-gray-200 dark:border-emerald-800/30" />

              <div className="text-sm">New Monthly In-hand</div>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-2">{after ? formatCurrency(after.netInHandMonthly) : '—'}</div>
              <div className="text-xs text-gray-600 dark:text-sky-300 mt-1">Increase: {after ? formatCurrency(Math.round((after.netInHandMonthly - monthlyInhand) * 12)) : '—'}</div>

              <hr className="my-4 border-gray-200 dark:border-emerald-800/30" />

              <div className="text-sm">New Annual In-hand</div>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-2">{after ? formatCurrency(after.netInHandYearly) : '—'}</div>
              <div className="text-xs text-gray-600 dark:text-sky-300 mt-1">Increase: {after ? formatCurrency(after.netInHandYearly - (monthlyInhand * 12)) : '—'}</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button onClick={handleCalculate} className="w-full py-3 rounded-full font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-500">Calculate Hike</button>
        </div>

        {showResults && (
          <div ref={resultsRef} className="mt-6 p-6 rounded-lg bg-white/50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Salary Breakdown Comparison</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded bg-white/50 dark:bg-slate-800/40 text-center">
                <div className="text-xs text-gray-700 dark:text-sky-300">Current CTC</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mt-3">{formatCurrency(Number(currentCtc))}</div>
              </div>
              <div className="flex items-center justify-center text-gray-700 dark:text-sky-300">→</div>
              <div className="p-4 rounded bg-emerald-50 dark:bg-emerald-900/20 text-center">
                <div className="text-xs text-gray-700 dark:text-sky-300">New CTC</div>
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-3">{formatCurrency(Math.round(Number(currentCtc) * (1 + (Number(hikePercent) / 100))))}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded">
                <div className="text-xs text-gray-700 dark:text-sky-300">Current In-hand/Year</div>
                <div className="text-teal-700 dark:text-teal-200 font-bold mt-2">{before ? formatCurrency(before.netInHandYearly) : '—'}</div>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                <div className="text-xs text-gray-700 dark:text-sky-300">New In-hand/Year</div>
                <div className="text-emerald-700 dark:text-emerald-300 font-bold mt-2">{after ? formatCurrency(after.netInHandYearly) : '—'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HikeCalculator;

