import React, { useState, useRef } from 'react';
import { computeSalaryFromCTC, formatCurrency } from '../../utils/salaryUtils';

const CompareOffers = () => {
  const [ctcA, setCtcA] = useState(500000);
  const [ctcB, setCtcB] = useState(500000);
  const [taxRegime, setTaxRegime] = useState('new');
  const [basicPercent, setBasicPercent] = useState(40);
  const [nps, setNps] = useState(0);

  const resultA = computeSalaryFromCTC({ ctc: Number(ctcA) || 0, basicPercent, inputMode: 'percentage', nps, taxRegime });
  const resultB = computeSalaryFromCTC({ ctc: Number(ctcB) || 0, basicPercent, inputMode: 'percentage', nps, taxRegime });
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef(null);

  function numberToWordsIndian(num) {
    num = Number(num) || 0;
    if (num === 0) return 'Zero rupees';
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    function twoDigits(n) { if (n < 20) return a[n]; return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : ''); }
    function threeDigits(n) { let str = ''; if (n > 99) { str += a[Math.floor(n / 100)] + ' hundred'; if (n % 100) str += ' '; } if (n % 100) str += twoDigits(n % 100); return str; }
    const crore = Math.floor(num / 10000000); num = num % 10000000;
    const lakh = Math.floor(num / 100000); num = num % 100000;
    const thousand = Math.floor(num / 1000);
    const hund = Math.floor((num % 1000));
    const parts = [];
    if (crore) parts.push(twoDigits(crore) + ' crore');
    if (lakh) parts.push(twoDigits(lakh) + ' lakh');
    if (thousand) parts.push(twoDigits(thousand) + ' thousand');
    if (hund) parts.push(threeDigits(hund));
    const words = parts.join(' ').replace(/\s+/g, ' ').trim();
    return words.charAt(0).toUpperCase() + words.slice(1) + ' rupees';
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="p-8 rounded-3xl bg-white/6 dark:bg-black/30 border border-black dark:border-white">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Compare CTC Offers</h2>
        <p className="text-sm text-gray-900 dark:text-sky-200 mb-6">Compare two salary offers side by side</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Offer A Card */}
          <div className="p-6 rounded-2xl border border-teal-500/40" style={{boxShadow: 'inset 0 0 0 1px rgba(13,148,136,0.04)'}}>
            <h3 className="font-semibold text-gray-900 dark:text-sky-200 mb-2">Offer 1</h3>
            <label className="text-xs text-gray-900 dark:text-sky-200">CTC (₹)</label>
            <input type="number" value={ctcA} onChange={(e) => setCtcA(e.target.value)} className="w-full mt-2 p-3 rounded-lg bg-slate-800 text-white" />
            <div className="text-xs text-gray-900 dark:text-sky-300 mt-2">{numberToWordsIndian(ctcA)}</div>
            <label className="text-xs text-gray-900 dark:text-sky-200 mt-4 block">Tax Regime</label>
            <select value={taxRegime} onChange={(e) => setTaxRegime(e.target.value)} className="w-full mt-2 p-2 rounded bg-slate-800 text-white">
              <option value="new">New Regime</option>
              <option value="old">Old Regime</option>
            </select>
          </div>

          {/* Offer B Card */}
          <div className="p-6 rounded-2xl border border-blue-500/40" style={{boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.04)'}}>
            <h3 className="font-semibold text-gray-900 dark:text-sky-200 mb-2">Offer 2</h3>
            <label className="text-xs text-gray-900 dark:text-sky-200">CTC (₹)</label>
            <input type="number" value={ctcB} onChange={(e) => setCtcB(e.target.value)} className="w-full mt-2 p-3 rounded-lg bg-slate-800 text-white" />
            <div className="text-xs text-gray-900 dark:text-sky-300 mt-2">{numberToWordsIndian(ctcB)}</div>
            <label className="text-xs text-gray-900 dark:text-sky-200 mt-4 block">Tax Regime</label>
            <select value={taxRegime} onChange={(e) => setTaxRegime(e.target.value)} className="w-full mt-2 p-2 rounded bg-slate-800 text-white">
              <option value="new">New Regime</option>
              <option value="old">Old Regime</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => {
              setShowResults(true);
              // scroll to results after a tick so layout updates
              setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
            }}
            className="w-full py-3 rounded-full font-semibold text-gray-900 dark:text-sky-200 bg-gradient-to-r from-teal-500 to-blue-500 shadow-md"
          >
            Compare Offers
          </button>
        </div>

        {showResults && (
          <div ref={resultsRef} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/40 rounded-lg border border-sky-800/30">
            <h4 className="font-semibold text-sky-200">Offer 1 Summary</h4>
            <div className="mt-3 text-sm text-sky-100 space-y-2">
              <div className="flex justify-between"><span>Gross Salary</span><span>{formatCurrency(resultA.grossSalary)}</span></div>
              <div className="flex justify-between"><span>Total Deductions</span><span>{formatCurrency(resultA.totalDeductions)}</span></div>
              <div className="border-t border-sky-800/30 pt-2 flex justify-between text-teal-300"><span>In-hand (Yearly)</span><span>{formatCurrency(resultA.netInHandYearly)}</span></div>
              <div className="flex justify-between text-teal-300"><span>In-hand (Monthly)</span><span>{formatCurrency(resultA.netInHandMonthly)}</span></div>
            </div>
          </div>
          <div className="p-4 bg-slate-900/40 rounded-lg border border-blue-800/30">
            <h4 className="font-semibold text-sky-200">Offer 2 Summary</h4>
            <div className="mt-3 text-sm text-sky-100 space-y-2">
              <div className="flex justify-between"><span>Gross Salary</span><span>{formatCurrency(resultB.grossSalary)}</span></div>
              <div className="flex justify-between"><span>Total Deductions</span><span>{formatCurrency(resultB.totalDeductions)}</span></div>
              <div className="border-t border-sky-800/30 pt-2 flex justify-between text-teal-300"><span>In-hand (Yearly)</span><span>{formatCurrency(resultB.netInHandYearly)}</span></div>
              <div className="flex justify-between text-teal-300"><span>In-hand (Monthly)</span><span>{formatCurrency(resultB.netInHandMonthly)}</span></div>
            </div>
          </div>
          <div className="p-4 bg-slate-900/40 rounded-lg border border-emerald-700/20">
            <h4 className="font-semibold text-emerald-300">Difference Analysis</h4>
            <div className="mt-3 text-sm text-sky-100 space-y-3">
              <div className="flex justify-between"><span>CTC Difference (Yearly)</span><span className="text-emerald-300">{formatCurrency(resultA.ctc - resultB.ctc)}</span></div>
              <div className="flex justify-between"><span>In-hand Difference (Yearly)</span><span className="text-emerald-300">{formatCurrency(resultA.netInHandYearly - resultB.netInHandYearly)}</span></div>
              <div className="flex justify-between"><span>Monthly In-hand Difference</span><span className="text-emerald-300">{formatCurrency(resultA.netInHandMonthly - resultB.netInHandMonthly)}</span></div>
              <div className="mt-2 border-t border-emerald-700/10 pt-2 text-teal-200"><span>Better Offer</span><div className="text-emerald-300 font-semibold">{(resultA.netInHandYearly > resultB.netInHandYearly) ? 'Offer 1' : (resultB.netInHandYearly > resultA.netInHandYearly) ? 'Offer 2' : 'Equal'}</div></div>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareOffers;
