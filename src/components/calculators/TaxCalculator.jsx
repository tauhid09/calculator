import React, { useState } from 'react';
import { calculateTax, formatCurrency } from '../../utils/salaryUtils';

const TaxCalculator = () => {
  const [income, setIncome] = useState(500000);
  const [employeePf, setEmployeePf] = useState(0);
  const [npsContribution, setNpsContribution] = useState(0);
  const [regime, setRegime] = useState('new');
  const [result, setResult] = useState(null);

  const handleCompute = () => {
    const gross = Number(income) || 0;
    const pf = Number(employeePf) || 0;
    const nps = Number(npsContribution) || 0;

    const standardDeduction = 50000;
    // Old regime deductions
    const section80C = Math.min(pf, 150000);
    const nps80ccd = Math.min(nps, 50000);
    const taxableOld = Math.max(0, gross - standardDeduction - section80C - nps80ccd);
    const taxOld = calculateTax(taxableOld, 'old');
    // apply rebate for old regime (as in original): if taxable <= 500k reduce tax by up to 12,500
    let totalTaxOld = taxOld.finalTax;
    if (taxableOld <= 500000) {
      totalTaxOld = Math.max(0, totalTaxOld - 12500);
    }

    // New regime
    const taxableNew = Math.max(0, gross - standardDeduction);
    const taxNew = calculateTax(taxableNew, 'new');
    let totalTaxNew = taxNew.finalTax;
    if (taxableNew <= 700000) totalTaxNew = 0;

    const recommendation = {
      taxSaving: Math.abs(totalTaxOld - totalTaxNew),
      better: totalTaxOld < totalTaxNew ? 'Old Regime' : (totalTaxNew < totalTaxOld ? 'New Regime' : 'Equal')
    };

    setResult({
      gross,
      standardDeduction,
      old: {
        section80C,
        nps80ccd,
        taxableIncome: taxableOld,
        taxBeforeCharges: taxOld.taxBeforeCharges,
        surcharge: taxOld.surcharge,
        cess: taxOld.cess,
        totalTax: totalTaxOld
      },
      new: {
        taxableIncome: taxableNew,
        taxBeforeCharges: taxNew.taxBeforeCharges,
        surcharge: taxNew.surcharge,
        cess: taxNew.cess,
        totalTax: totalTaxNew
      },
      recommendation
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white/60 dark:bg-gray-900 backdrop-blur-lg rounded-3xl shadow-xl border border-black dark:border-gray-800 p-6 sm:p-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Tax Calculator</h2>
        <p className="text-gray-800 dark:text-gray-400">Compute income tax breakdown for an annual taxable income.</p>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-black dark:border-slate-700 text-gray-900 dark:text-sky-300">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-sky-300 mb-3">Annual Income</h4>
            <label className="text-xs text-gray-700 dark:text-sky-300">Gross Salary (₹)</label>
            <input type="number" value={income} onChange={(e) => setIncome(parseFloat(e.target.value) || 0)} className="w-full mt-2 p-3 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
            <div className="text-xs text-gray-700 dark:text-sky-300 mt-2">{income >= 100000 ? 'Five lakh rupees' : ''}</div>

            <label className="text-xs text-gray-700 dark:text-sky-300 mt-4">Employee PF (₹)</label>
            <input type="number" value={employeePf} onChange={(e) => setEmployeePf(parseFloat(e.target.value) || 0)} className="w-full mt-2 p-3 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />

            <label className="text-xs text-gray-700 dark:text-sky-300 mt-4">NPS Contribution (₹)</label>
            <input type="number" value={npsContribution} onChange={(e) => setNpsContribution(parseFloat(e.target.value) || 0)} className="w-full mt-2 p-3 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
          </div>

          <div className="p-6 rounded-2xl border border-black bg-blue-50 dark:border-blue-700/40 dark:bg-transparent">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-sky-300 mb-3">Tax Slabs 2025</h4>
            <div className="text-xs text-gray-700 dark:text-sky-300 space-y-2">
              <div className='text-gray-700 dark:text-sky-300' ><strong>New Regime:</strong> 0-3L: 0% | 3-6L: 5% | 6-9L: 10% | 9-12L:15% | 12-15L:20% | 15L+:30%</div>
              <div className="mt-2 text-gray-700 dark:text-sky-300"><strong>Old Regime:</strong> 0-2.5L:0% | 2.5-5L:5% | 5-10L:20% | 10L+:30% (surcharge & cess apply)</div>
            </div>
            <div className="mt-6">
              <label className="text-xs text-gray-700 dark:text-sky-300">Regime (preview)</label>
              <select className="w-full mt-2 p-2 rounded bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" value={regime} onChange={(e) => setRegime(e.target.value)}>
                <option value="new">New Regime</option>
                <option value="old">Old Regime</option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-2">
            <button onClick={handleCompute} className="w-full py-3 rounded-full font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 mt-4">Calculate Tax</button>
          </div>
        </div>

        {result && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/5">
              <h4 className="font-semibold text-amber-700 dark:text-amber-300">Old Regime</h4>
              <div className="mt-3 text-sm text-amber-900 dark:text-amber-100 space-y-2">
                <div className="flex justify-between"><span>Gross Income</span><span>{formatCurrency(result.gross)}</span></div>
                <div className="flex justify-between"><span>Standard Deduction</span><span>{formatCurrency(result.standardDeduction)}</span></div>
                <div className="flex justify-between"><span>Section 80C (PF)</span><span>{formatCurrency(result.old.section80C)}</span></div>
                <div className="flex justify-between"><span>80CCD(1B) (NPS)</span><span>{formatCurrency(result.old.nps80ccd)}</span></div>
                <div className="border-t border-amber-200 dark:border-amber-700/20 pt-2 flex justify-between"><span>Taxable Income</span><span>{formatCurrency(result.old.taxableIncome)}</span></div>
                <div className="flex justify-between"><span>Income Tax</span><span>{formatCurrency(result.old.taxBeforeCharges)}</span></div>
                <div className="flex justify-between"><span>Surcharge & Cess</span><span>{formatCurrency(result.old.surcharge + result.old.cess)}</span></div>
                <div className="mt-2 bg-amber-100 dark:bg-amber-800/60 p-2 rounded-md flex justify-between font-semibold"><span>Total Tax</span><span>{formatCurrency(result.old.totalTax)}</span></div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-700/40 dark:bg-emerald-900/5">
              <h4 className="font-semibold text-emerald-700 dark:text-emerald-300">New Regime</h4>
              <div className="mt-3 text-sm text-emerald-900 dark:text-emerald-100 space-y-2">
                <div className="flex justify-between"><span>Gross Income</span><span>{formatCurrency(result.gross)}</span></div>
                <div className="flex justify-between"><span>Standard Deduction</span><span>{formatCurrency(result.standardDeduction)}</span></div>
                <div className="border-t border-emerald-200 dark:border-emerald-700/20 pt-2 flex justify-between"><span>Taxable Income</span><span>{formatCurrency(result.new.taxableIncome)}</span></div>
                <div className="flex justify-between"><span>Income Tax</span><span>{formatCurrency(result.new.taxBeforeCharges)}</span></div>
                <div className="flex justify-between"><span>Surcharge & Cess</span><span>{formatCurrency(result.new.surcharge + result.new.cess)}</span></div>
                <div className="mt-2 bg-emerald-100 dark:bg-emerald-800/60 p-2 rounded-md flex justify-between font-semibold"><span>Total Tax</span><span>{formatCurrency(result.new.totalTax)}</span></div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-700/40 dark:bg-purple-900/5">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300">Recommendation</h4>
              <div className="mt-3 text-sm text-sky-900 dark:text-sky-100">
                <div className="flex justify-between"><span>Tax Saving</span><span className="text-emerald-600 dark:text-emerald-300">{formatCurrency(result.recommendation.taxSaving)}</span></div>
                <div className="mt-4 text-lg font-semibold text-purple-700 dark:text-purple-200">Better Regime</div>
                <div className="text-xl font-bold text-purple-700 dark:text-purple-300 mt-1">{result.recommendation.better} {result.recommendation.better !== 'Equal' ? `(Save ${formatCurrency(result.recommendation.taxSaving)})` : ''}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxCalculator;

