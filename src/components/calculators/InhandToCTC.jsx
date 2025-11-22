import React, { useState, useRef, useEffect } from 'react';
import { estimateCTCForInhand, formatCurrency } from '../../utils/salaryUtils';
import Chart from 'chart.js/auto';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const InhandToCTC = () => {
  const [monthlyInhand, setMonthlyInhand] = useState(50000);
  const [taxRegime, setTaxRegime] = useState('new');
  const [basicPercent, setBasicPercent] = useState(40);
  const [nps, setNps] = useState(0);
  const [insurance, setInsurance] = useState(0);
  const [other, setOther] = useState(0);
  const [includeProfTax, setIncludeProfTax] = useState(true);
  const [includePF, setIncludePF] = useState(true);
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const res = estimateCTCForInhand(monthlyInhand, { basicPercent, inputMode: 'percentage', nps, insurance, other, includeProfTax, includeEmployeePF: includePF, taxRegime });
    setResult(res);
  };

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');

    const netAnnual = result ? Math.max(0, result.netInHandMonthly * 12) : 0;
    const employeePf = result ? Math.max(0, result.employeePf) : 0;
    const profTax = result ? Math.max(0, result.profTax) : 0;
    const incomeTax = result ? Math.max(0, result.totalTax) : 0;

    const dataValues = [netAnnual, employeePf, profTax, incomeTax];
    // If all zeros, show a small default slice so Chart.js doesn't complain
    const hasAny = dataValues.some(v => v > 0);
    const chartData = hasAny ? dataValues : [1, 0, 0, 0];

    const backgroundColor = ['#06b6d4', '#0ea5a4', '#f59e0b', '#ef4444'];

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const totalForPercent = chartData.reduce((a,b) => a + b, 0) || 1;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Net In-Hand', 'Employee PF', 'Prof. Tax', 'Income Tax'],
        datasets: [{
          data: chartData,
          backgroundColor,
          borderColor: '#071033',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed || 0;
                const percent = ((value / totalForPercent) * 100).toFixed(1);
                // format as Indian currency
                const formatted = '₹' + Math.round(value).toLocaleString('en-IN');
                return `${context.label}: ${formatted} (${percent}%)`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [result]);

  // Run initial calculation on mount so chart and values appear immediately
  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-run calculation whenever inputs change so UI stays in sync
  useEffect(() => {
    // debounce slightly to avoid rapid repeated binary searches when user types
    const t = setTimeout(() => {
      handleCalculate();
    }, 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthlyInhand, taxRegime, basicPercent, nps, insurance, other, includeProfTax, includePF]);

  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Estimated CTC (In-hand to CTC)', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    let y = 40;
    doc.text(`Target Monthly In-hand: ${formatCurrency(result.netInHandMonthly)}`, 20, y);
    y += 8;
    doc.text(`Estimated CTC: ${formatCurrency(result.ctc)}`, 20, y);
    y += 12;
    doc.text('Breakdown:', 20, y);
    y += 8;
    const rows = [
      ['Gross Salary', formatCurrency(result.grossSalary)],
      ['Basic', formatCurrency(result.basicAmount)],
      ['HRA', formatCurrency(result.hra)],
      ['Employee PF', formatCurrency(result.employeePf)],
      ['NPS', formatCurrency(result.npsDeduction)],
      ['Income Tax', formatCurrency(result.totalTax)],
      ['Net Monthly In-hand', formatCurrency(result.netInHandMonthly)]
    ];
    rows.forEach(r => { doc.text(`${r[0]}: ${r[1]}`, 20, y); y += 8; });
    doc.save('inhand-to-ctc.pdf');
  };

  const downloadExcel = () => {
    if (!result) return;
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['Estimated CTC (In-hand to CTC)'],
      ['Target Monthly In-hand', result.netInHandMonthly],
      ['Estimated CTC', result.ctc],
      [],
      ['Breakdown', 'Amount'],
      ['Gross Salary', result.grossSalary],
      ['Basic', result.basicAmount],
      ['HRA', result.hra],
      ['Employee PF', result.employeePf],
      ['NPS', result.npsDeduction],
      ['Income Tax', result.totalTax],
      ['Net Monthly In-hand', result.netInHandMonthly]
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Estimate');
    XLSX.writeFile(wb, 'inhand-to-ctc.xlsx');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-yellow-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Calculate CTC from In-hand</h3>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Desired Net Monthly In-hand</label>
          <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2 mb-2">
            <span className="text-gray-600 dark:text-gray-300 mr-3">₹</span>
            <input type="number" value={monthlyInhand} onChange={(e) => setMonthlyInhand(parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-right text-gray-900 dark:text-white focus:outline-none" />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">{monthlyInhand >= 100000 ? 'One lakh rupees' : ''}</p>

          <div className="mb-4">
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center text-sm text-gray-900 dark:text-white">
                <input type="radio" name="regime" value="new" checked={taxRegime === 'new'} onChange={(e) => setTaxRegime(e.target.value)} className="mr-2 " /> New
              </label>
              <label className="inline-flex items-center text-sm text-gray-900 dark:text-white">
                <input type="radio" name="regime" value="old" checked={taxRegime === 'old'} onChange={(e) => setTaxRegime(e.target.value)} className="mr-2" /> Old
              </label>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Assumed Deductions</h4>
            <label className="flex items-center mb-2">
              <input type="checkbox" checked={includePF} onChange={(e) => setIncludePF(e.target.checked)} className="mr-2" />
              <span className="text-sm text-gray-900 dark:text-white ">EPF Applicable</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={includeProfTax} onChange={(e) => setIncludeProfTax(e.target.checked)} className="mr-2" />
              <span className="text-sm text-gray-900 dark:text-white">Professional Tax</span>
            </label>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Salary Assumptions</h4>
            <label className="block text-xs text-gray-900 dark:text-white mb-1 ">Basic as % of Gross</label>
            <div className="flex items-center gap-3 mb-3">
              <input type="number" value={basicPercent} onChange={(e) => setBasicPercent(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))} className="w-24 bg-gray-900 rounded-full px-3 py-2 text-white text-right" />
              <div className="text-xs text-gray-900 dark:text-white">% of CTC allocated to Basic (default 40%)</div>
            </div>

            <label className="block text-xs text-gray-900 dark:text-white mb-1">NPS (Employee) % or amount</label>
            <div className="flex items-center gap-3 mb-3">
              <input type="number" value={nps} onChange={(e) => setNps(Math.max(0, parseFloat(e.target.value) || 0))} className="w-24 bg-gray-900 rounded-full px-3 py-2 text-white text-right" />
              <div className="text-xs text-gray-900 dark:text-white">Enter % (interpreted as percent of Basic) or absolute amount</div>
            </div>

            <label className="block text-xs text-gray-900 dark:text-white mb-1">Employer Insurance (annual)</label>
            <div className="flex items-center gap-3 mb-3">
              <input type="number" value={insurance} onChange={(e) => setInsurance(Math.max(0, parseFloat(e.target.value) || 0))} className="w-32 bg-gray-900 rounded-full px-3 py-2 text-white text-right" />
              <div className="text-xs text-gray-900 dark:text-white">Any employer-paid insurance component</div>
            </div>

            <label className="block text-xs text-gray-900 dark:text-white mb-1">Other Employer Components (annual)</label>
            <div className="flex items-center gap-3">
              <input type="number" value={other} onChange={(e) => setOther(Math.max(0, parseFloat(e.target.value) || 0))} className="w-32 bg-gray-900 rounded-full px-3 py-2 text-white text-right" />
              <div className="text-xs text-gray-900 dark:text-white">Bonuses or other fixed employer additions</div>
            </div>
          </div>

          <div className="mt-6">
            <button onClick={handleCalculate} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-full font-semibold">Calculate Required CTC</button>
          </div>
        </div>

        {/* Middle: Result Card */}
        <div className="p-6 rounded-2xl bg-white/60 dark:bg-gradient-to-b dark:from-sky-900/80 dark:to-sky-800/80 border border-sky-200 dark:border-sky-700 text-gray-900 dark:text-white flex flex-col items-center shadow-sm">
          <div className="w-full text-center mb-4">
            <p className="text-sm text-sky-600 dark:text-sky-200">Required CTC Breakdown (new Regime)</p>
            <div className="mt-4 p-6 bg-sky-50 dark:bg-sky-800/40 rounded-lg">
              <div className="text-xs text-sky-600 dark:text-sky-200">Required Annual CTC</div>
              <div className="text-3xl font-bold mt-2 text-sky-600 dark:text-white">{result ? formatCurrency(result.ctc) : '—'}</div>
              <div className="text-sm text-sky-500 dark:text-sky-300 mt-1">Gives Net Monthly: {result ? formatCurrency(result.netInHandMonthly) : '—'}</div>
            </div>
          </div>

          <div className="w-full flex-1 flex flex-col items-center justify-center">
            <div className="w-56 h-56 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <div className="w-48 h-48 relative">
                <canvas ref={chartRef} className="w-full h-full" />
              </div>
            </div>
            <div className="w-full flex items-center justify-center gap-3 mt-2 text-xs text-sky-700 dark:text-sky-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-block" style={{background:'#06b6d4', display:'inline-block'}} />
                <span>Net In-Hand</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-block" style={{background:'#0ea5a4', display:'inline-block'}} />
                <span>Employee PF</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-block" style={{background:'#f59e0b', display:'inline-block'}} />
                <span>Prof. Tax</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-block" style={{background:'#ef4444', display:'inline-block'}} />
                <span>Income Tax</span>
              </div>
            </div>
            <div className="w-full text-sm text-gray-800 dark:text-sky-200">
              <div className="bg-gray-50 dark:bg-sky-900/30 p-3 rounded-lg">
                <div className="flex justify-between"><span>Gross Salary</span><span>{result ? formatCurrency(result.grossSalary) : '—'}</span></div>
                <div className="flex justify-between mt-2"><span>Employer EPF</span><span>{result ? formatCurrency(result.employerPf) : '—'}</span></div>
                <div className="flex justify-between font-semibold mt-3 border-t border-sky-700 pt-2"><span>Total CTC</span><span>{result ? formatCurrency(result.ctc) : '—'}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Earnings & Deductions */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-pink-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Earnings & Deductions</h3>
          <div className="text-sm space-y-3">
            <div className="flex justify-between"><span>Basic Salary</span><span className="font-medium">{result ? formatCurrency(result.basicAmount) : '—'}</span></div>
            <div className="flex justify-between"><span>HRA</span><span className="font-medium">{result ? formatCurrency(result.hra) : '—'}</span></div>
            <div className="flex justify-between"><span>Special Allowance</span><span className="font-medium">{result ? formatCurrency(result.special) : '—'}</span></div>
            <div className="border-t border-gray-200 dark:border-gray-800 pt-2 mt-2 flex justify-between font-semibold"><span>Gross Salary</span><span>{result ? formatCurrency(result.grossSalary) : '—'}</span></div>

            <div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-3 text-sm">
              <div className="flex justify-between text-rose-600 dark:text-rose-400"><span>EPF (Employee)</span><span>{result ? `-${formatCurrency(result.employeePf)}` : '—'}</span></div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400"><span>Professional Tax</span><span>{result ? `-${formatCurrency(result.profTax)}` : '—'}</span></div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400"><span>Income Tax</span><span>{result ? `-${formatCurrency(result.totalTax)}` : '—'}</span></div>
              <div className="flex justify-between font-semibold text-rose-600 dark:text-rose-500 mt-2 border-t border-gray-200 dark:border-gray-800 pt-2"><span>Total Deductions</span><span>{result ? `-${formatCurrency(result.totalDeductions)}` : '—'}</span></div>
            </div>

            <div className="mt-6">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={downloadPDF} className="bg-emerald-600 text-white py-2 rounded-lg">PDF</button>
                <button onClick={downloadExcel} className="bg-blue-600 text-white py-2 rounded-lg">Excel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InhandToCTC;
