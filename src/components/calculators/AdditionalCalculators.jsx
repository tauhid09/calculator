import React, { useState } from 'react';
import { formatCurrency } from '../../utils/salaryUtils';

const cityCostIndex = {
  Mumbai: 1.0,
  Pune: 0.75,
  Delhi: 0.85,
  Bengaluru: 0.9,
  Hyderabad: 0.8,
  Chennai: 0.78
};

const AdditionalCalculators = () => {
  // PF
  const [pfBasic, setPfBasic] = useState(600000);
  const [empPfRate, setEmpPfRate] = useState(12);
  const [erPfRate, setErPfRate] = useState(12);
  const [pfResult, setPfResult] = useState(null);

  // HRA
  const [basicMonthly, setBasicMonthly] = useState(50000);
  const [hraReceivedMonthly, setHraReceivedMonthly] = useState(20000);
  const [rentMonthly, setRentMonthly] = useState(22000);
  const [isMetro, setIsMetro] = useState(true);
  const [hraResult, setHraResult] = useState(null);

  // Gratuity
  const [lastBasicMonthly, setLastBasicMonthly] = useState(50000);
  const [yearsService, setYearsService] = useState(5);
  const [gratuityResult, setGratuityResult] = useState(null);

  // LTA
  const [ltaReceived, setLtaReceived] = useState(40000);
  const [travelExpenses, setTravelExpenses] = useState(35000);
  const [ltaResult, setLtaResult] = useState(null);

  // Bonus
  const [bonusBase, setBonusBase] = useState(1000000);
  const [bonusPercent, setBonusPercent] = useState(10);
  const [bonusResult, setBonusResult] = useState(null);

  // COL
  const [cityA, setCityA] = useState('Mumbai');
  const [cityB, setCityB] = useState('Pune');
  const [salaryA, setSalaryA] = useState(1000000);
  const [colResult, setColResult] = useState(null);

  // Handlers
  const handleCalculatePF = () => {
    const employee = Math.round((pfBasic * (empPfRate / 100)));
    const employer = Math.round((pfBasic * (erPfRate / 100)));
    setPfResult({ employee, employer });
  };

  const handleCalculateHRA = () => {
    const hraAnnual = hraReceivedMonthly * 12;
    const rentMinus = (rentMonthly * 12) - (0.1 * basicMonthly * 12);
    const cap = (isMetro ? 0.5 : 0.4) * basicMonthly * 12;
    const exemption = Math.max(0, Math.min(hraAnnual, rentMinus, cap));
    setHraResult({ hraAnnual, rentMinus, cap, exemption });
  };

  const handleCalculateGratuity = () => {
    // Gratuity = (lastBasicMonthly * 15/26) * years
    const gratuity = Math.round(lastBasicMonthly * (15 / 26) * yearsService);
    setGratuityResult({ gratuity });
  };

  const handleCalculateLTA = () => {
    const exempt = Math.min(ltaReceived, travelExpenses);
    setLtaResult({ ltaReceived, travelExpenses, exempt });
  };

  const handleCalculateBonus = () => {
    const bonusAmt = Math.round((Number(bonusBase) || 0) * (Number(bonusPercent) / 100));
    setBonusResult({ bonusAmt });
  };

  const handleCompareCOL = () => {
    const idxA = cityCostIndex[cityA] || 1;
    const idxB = cityCostIndex[cityB] || 1;
    const required = Math.round((Number(salaryA) || 0) * (idxB / idxA));
    setColResult({ required });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="p-8 rounded-3xl bg-white dark:bg-black/30 border border-gray-200 dark:border-white/6">
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">Additional Calculators</h3>
        <p className="text-sm text-gray-700 dark:text-sky-200 mb-6">Small utilities: PF, HRA exemption, Gratuity, LTA, Bonus and Cost-of-Living comparison.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/20 text-gray-900 dark:text-amber-200 shadow-sm">
            <h4 className="font-semibold text-amber-700 dark:text-amber-200 mb-3">PF Calculator</h4>
            <label className="text-xs text-gray-700 dark:text-sky-200">Annual Basic (₹)</label>
            <input type="number" value={pfBasic} onChange={(e) => setPfBasic(parseFloat(e.target.value) || 0)} className="w-full mt-2 p-2 rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
            <div className="flex gap-3 mt-3">
              <input type="number" value={empPfRate} onChange={(e) => setEmpPfRate(parseFloat(e.target.value) || 0)} className="w-24 p-2 rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
              <div className="text-xs text-gray-700 dark:text-sky-300">Employee PF Rate (%)</div>
            </div>
            <div className="flex gap-3 mt-2">
              <input type="number" value={erPfRate} onChange={(e) => setErPfRate(parseFloat(e.target.value) || 0)} className="w-24 p-2 rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
              <div className="text-xs text-gray-700 dark:text-sky-300">Employer PF Rate (%)</div>
            </div>
            <button onClick={handleCalculatePF} className="mt-4 w-full py-2 rounded bg-emerald-500 text-white font-semibold">Calculate PF</button>
            {pfResult && (
              <div className="mt-3 text-sm text-gray-800 dark:text-sky-100">
                <div>Employee PF: {formatCurrency(pfResult.employee)} / month ≈ {formatCurrency(Math.round(pfResult.employee/12))}</div>
                <div>Employer PF: {formatCurrency(pfResult.employer)} / month ≈ {formatCurrency(Math.round(pfResult.employer/12))}</div>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-700/20 text-gray-900 dark:text-sky-200 shadow-sm">
            <h4 className="font-semibold text-sky-700 dark:text-sky-200 mb-3">HRA Exemption Calculator</h4>
            <label className="text-xs text-gray-700 dark:text-sky-200">Basic Monthly (₹)</label>
            <input type="number" value={basicMonthly} onChange={(e) => setBasicMonthly(parseFloat(e.target.value) || 0)} className="w-full mt-2 p-2 rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
            <label className="text-xs text-gray-700 dark:text-sky-200 mt-2">HRA Received Monthly (₹)</label>
            <input type="number" value={hraReceivedMonthly} onChange={(e) => setHraReceivedMonthly(parseFloat(e.target.value) || 0)} className="w-full mt-2 p-2 rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
            <label className="text-xs text-gray-700 dark:text-sky-200 mt-2">Rent Paid Monthly (₹)</label>
            <input type="number" value={rentMonthly} onChange={(e) => setRentMonthly(parseFloat(e.target.value) || 0)} className="w-full mt-2 p-2 rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
            <div className="mt-2">
              <label className="inline-flex items-center"><input type="checkbox" checked={isMetro} onChange={(e) => setIsMetro(e.target.checked)} className="mr-2" /> <span className="text-xs text-gray-700 dark:text-sky-300">Metro City (50% cap)</span></label>
            </div>
            <button onClick={handleCalculateHRA} className="mt-4 w-full py-2 rounded bg-blue-600 text-white font-semibold">Calculate HRA Exemption</button>
            {hraResult && (
              <div className="mt-3 text-sm text-gray-800 dark:text-sky-100">
                <div>Actual HRA received (annual): {formatCurrency(hraResult.hraAnnual)}</div>
                <div>Rent - 10% of Basic (annual): {formatCurrency(hraResult.rentMinus)}</div>
                <div>{isMetro ? '50% of Basic (annual)' : '40% of Basic (annual)'}: {formatCurrency(hraResult.cap)}</div>
                <div className="mt-2 font-semibold">HRA Exemption (annual): {formatCurrency(hraResult.exemption)}</div>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700/20 text-gray-900 dark:text-emerald-200 shadow-sm">
            <h4 className="font-semibold text-emerald-700 dark:text-emerald-200 mb-3">Gratuity Calculator</h4>
            <label className="text-xs text-gray-700 dark:text-sky-200">Last Drawn Basic Monthly (₹)</label>
            <input type="number" value={lastBasicMonthly} onChange={(e) => setLastBasicMonthly(parseFloat(e.target.value) || 0)} className="w-full mt-2 p-2 rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
            <label className="text-xs text-gray-700 dark:text-sky-200 mt-2">Years of Service</label>
            <input type="number" value={yearsService} onChange={(e) => setYearsService(parseFloat(e.target.value) || 0)} className="w-full mt-2 p-2 rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
            <button onClick={handleCalculateGratuity} className="mt-4 w-full py-2 rounded bg-emerald-500 text-white font-semibold">Calculate Gratuity</button>
            {gratuityResult && (
              <div className="mt-3 text-sm text-gray-800 dark:text-sky-100">Estimated Gratuity: {formatCurrency(gratuityResult.gratuity)}</div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/20 text-gray-900 dark:text-amber-200 shadow-sm">
            <h4 className="font-semibold text-amber-700 dark:text-amber-200 mb-3">LTA Calculator</h4>
            <label className="text-xs text-gray-700 dark:text-sky-200">LTA Received (Annual ₹)</label>
            <input type="number" value={ltaReceived} onChange={(e) => setLtaReceived(parseFloat(e.target.value) || 0)} className="w-full mt-2 p-2 rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
            <label className="text-xs text-gray-700 dark:text-sky-200 mt-2">Travel Expenses Claimed (₹)</label>
            <input type="number" value={travelExpenses} onChange={(e) => setTravelExpenses(parseFloat(e.target.value) || 0)} className="w-full mt-2 p-2 rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
            <button onClick={handleCalculateLTA} className="mt-4 w-full py-2 rounded bg-emerald-500 text-white font-semibold">Calculate LTA Exemption</button>
            {ltaResult && (
              <div className="mt-3 text-sm text-gray-800 dark:text-sky-100">LTA Received: {formatCurrency(ltaResult.ltaReceived)} | Expenses Claimed: {formatCurrency(ltaResult.travelExpenses)} | LTA Exempt: {formatCurrency(ltaResult.exempt)}</div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700/20 text-gray-900 dark:text-sky-200 shadow-sm">
            <h4 className="font-semibold text-sky-700 dark:text-sky-200 mb-3">Bonus Calculator</h4>
            <label className="text-xs text-gray-700 dark:text-sky-200">CTC or Base (₹)</label>
            <input type="number" value={bonusBase} onChange={(e) => setBonusBase(parseFloat(e.target.value) || 0)} className="w-full mt-2 p-2 rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
            <label className="text-xs text-gray-700 dark:text-sky-200 mt-2">Bonus %</label>
            <input type="number" value={bonusPercent} onChange={(e) => setBonusPercent(parseFloat(e.target.value) || 0)} className="w-full mt-2 p-2 rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
            <button onClick={handleCalculateBonus} className="mt-4 w-full py-2 rounded bg-blue-600 text-white font-semibold">Calculate Bonus</button>
            {bonusResult && (
              <div className="mt-3 text-sm text-gray-800 dark:text-sky-100">Bonus Amount: {formatCurrency(bonusResult.bonusAmt)}</div>
            )}
          </div>

          <div className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-pink-200 dark:border-pink-600/20 text-gray-900 dark:text-pink-200 shadow-sm">
            <h4 className="font-semibold text-pink-700 dark:text-pink-200 mb-3">Cost-of-Living Comparison</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select value={cityA} onChange={(e) => setCityA(e.target.value)} className="p-2 rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent">
                {Object.keys(cityCostIndex).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={cityB} onChange={(e) => setCityB(e.target.value)} className="p-2 rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent">
                {Object.keys(cityCostIndex).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" value={salaryA} onChange={(e) => setSalaryA(parseFloat(e.target.value) || 0)} className="p-2 rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent" />
            </div>
            <button onClick={handleCompareCOL} className="mt-4 w-full py-2 rounded bg-green-600 text-white font-semibold">Compare Cost of Living</button>
            {colResult && (
              <div className="mt-3 text-sm text-gray-800 dark:text-sky-100">If you earn {formatCurrency(Number(salaryA) || 0)} in {cityA}, you need approximately {formatCurrency(colResult.required)} in {cityB} to match cost-of-living.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalCalculators;


