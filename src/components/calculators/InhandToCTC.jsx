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
  const [showAdvanced, setShowAdvanced] = useState(false);

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

    const backgroundColor = ['#0D9488', '#F59E0B', '#EAB308', '#EF4444'];

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">In-hand TO CTC Calculator</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Enter desired monthly in-hand to estimate required CTC and breakdown.</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Input Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border-2 border-yellow-200 dark:border-yellow-700/40 text-gray-900 dark:text-white shadow-lg">
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Calculate CTC from In-hand</h3>
            
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Desired Net Monthly In-hand</label>
            <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-full px-5 py-4 mb-3 border-2 border-gray-200 dark:border-gray-600">
              <span className="text-gray-700 dark:text-gray-300 mr-3 font-bold text-lg">₹</span>
              <input 
                type="number" 
                value={monthlyInhand} 
                onChange={(e) => setMonthlyInhand(parseFloat(e.target.value) || 0)} 
                className="w-full bg-transparent text-right text-gray-900 dark:text-white focus:outline-none font-semibold text-lg" 
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium">
              {monthlyInhand >= 100000 ? (monthlyInhand / 100000).toFixed(2).replace(/\.?0+$/, '') + ' lakh rupees' : 'Seventy thousand rupees'}
            </p>

            <div className="mb-6 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Tax Regime</label>
              <div className="flex items-center gap-8">
                <label className="inline-flex items-center text-base text-gray-900 dark:text-white cursor-pointer font-medium">
                  <input 
                    type="radio" 
                    name="regime" 
                    value="new" 
                    checked={taxRegime === 'new'} 
                    onChange={(e) => setTaxRegime(e.target.value)} 
                    className="mr-3 w-5 h-5 accent-teal-600" 
                  /> 
                  New
                </label>
                <label className="inline-flex items-center text-base text-gray-900 dark:text-white cursor-pointer font-medium">
                  <input 
                    type="radio" 
                    name="regime" 
                    value="old" 
                    checked={taxRegime === 'old'} 
                    onChange={(e) => setTaxRegime(e.target.value)} 
                    className="mr-3 w-5 h-5 accent-teal-600"
                  /> 
                  Old
                </label>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wide">Assumed Deductions</h4>
              <label className="flex items-center mb-4 cursor-pointer">
                <input type="checkbox" checked={includePF} onChange={(e) => setIncludePF(e.target.checked)} className="mr-3 w-5 h-5 accent-teal-600 rounded" />
                <span className="text-base text-gray-900 dark:text-white font-medium">EPF Applicable</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={includeProfTax} onChange={(e) => setIncludeProfTax(e.target.checked)} className="mr-3 w-5 h-5 accent-teal-600 rounded" />
                <span className="text-base text-gray-900 dark:text-white font-medium">Professional Tax</span>
              </label>
            </div>

            <div className="mt-8">
              <button 
                onClick={handleCalculate} 
                className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 text-white py-4 rounded-full font-bold text-base shadow-lg hover:shadow-xl transition-all"
              >
                Calculate Required CTC
              </button>
            </div>
          </div>

          {/* Middle: Result Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 border-2 border-cyan-200 dark:border-cyan-600/40 text-gray-900 dark:text-white flex flex-col items-center shadow-lg">
            <div className="w-full text-center mb-8">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Required CTC Breakdown ({taxRegime === 'new' ? 'new' : 'old'} Regime)</p>
              <div className="p-5 bg-white dark:bg-slate-700/60 rounded-2xl border-2 border-cyan-200 dark:border-cyan-600/40">
                <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2">Required Annual CTC</div>
                <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-3">{result ? formatCurrency(result.ctc) : '—'}</div>
                <div className="text-base text-gray-700 dark:text-gray-300 font-semibold">Gives Net Monthly <span className="text-cyan-600 dark:text-cyan-400 font-bold">₹ {result ? (result.netInHandMonthly / 1000).toFixed(0) + ' K' : '—'}</span></div>
              </div>
            </div>

            <div className="w-full flex-1 flex flex-col items-center justify-center">
              <div className="w-56 h-56 bg-white dark:bg-slate-700/40 rounded-full flex items-center justify-center mb-8 border-2 border-cyan-200 dark:border-cyan-600/40 shadow-md">
                <div className="w-48 h-48 relative">
                  <canvas ref={chartRef} className="w-full h-full" />
                </div>
              </div>
              <div className="w-full flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-gray-700 dark:text-gray-300 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full" style={{background:'#0D9488'}} />
                  <span>Net In-Hand</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full" style={{background:'#F59E0B'}} />
                  <span>Employee PF</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full" style={{background:'#EAB308'}} />
                  <span>Prof. Tax</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full" style={{background:'#EF4444'}} />
                  <span>Income Tax</span>
                </div>
              </div>
              
              <div className="w-full mt-8 pt-6 border-t-2 border-cyan-200 dark:border-cyan-600/40">
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
                  <div className="flex justify-between font-semibold"><span>Gross Salary</span><span className="text-gray-900 dark:text-white font-bold">{result ? formatCurrency(result.grossSalary) : '—'}</span></div>
                  <div className="flex justify-between font-semibold"><span>Employer EPF</span><span className="text-gray-900 dark:text-white font-bold">{result ? formatCurrency(result.employerPf) : '—'}</span></div>
                  <div className="flex justify-between font-bold mt-3 pt-3 border-t-2 border-cyan-200 dark:border-cyan-600/40 text-cyan-600 dark:text-cyan-400"><span>Total CTC</span><span>{result ? formatCurrency(result.ctc) : '—'}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Earnings & Deductions */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border-2 border-pink-200 dark:border-pink-700/40 text-gray-900 dark:text-white shadow-lg">
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Earnings & Deductions</h3>
            
            <div className="mb-6 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-4">Earnings (Annual)</h4>
              <div className="text-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-400">Basic Salary</span>
                  <span className="font-bold text-gray-900 dark:text-white">{result ? formatCurrency(result.basicAmount) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-400">HRA</span>
                  <span className="font-bold text-gray-900 dark:text-white">{result ? formatCurrency(result.hra) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-400">Special Allowance</span>
                  <span className="font-bold text-gray-900 dark:text-white">{result ? formatCurrency(result.special) : '—'}</span>
                </div>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <span>Gross Salary</span>
                <span>{result ? formatCurrency(result.grossSalary) : '—'}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-4">Deductions (Annual)</h4>
              <div className="text-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-400">EPF (Employee)</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{result ? `-${formatCurrency(result.employeePf)}` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-400">Professional Tax</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{result ? `-${formatCurrency(result.profTax)}` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-400">Income Tax</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{result ? `-${formatCurrency(result.totalTax)}` : '—'}</span>
                </div>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm font-bold bg-red-50 dark:bg-red-900/30 p-3 rounded-lg text-red-700 dark:text-red-400">
                <span>Total Deductions</span>
                <span>{result ? `-${formatCurrency(result.totalDeductions)}` : '—'}</span>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wide">Download Report</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={downloadPDF} 
                  className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 text-white py-3 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  📄 PDF
                </button>
                <button 
                  onClick={downloadExcel} 
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white py-3 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  📊 Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InhandToCTC;
