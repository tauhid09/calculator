import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const CTCToInhand = () => {
  const [ctc, setCtc] = useState(1000000);
  const [basic, setBasic] = useState(40);
  const [inputMode, setInputMode] = useState('percentage');
  const [taxRegime, setTaxRegime] = useState('new');
  const [nps, setNps] = useState(0);
  const [insuranceAmount, setInsuranceAmount] = useState(0);
  const [otherDeductionsAmount, setOtherDeductionsAmount] = useState(0);
  const [includeProfTax, setIncludeProfTax] = useState(true);
  const [results, setResults] = useState(null);
  const chartRef = React.useRef(null);
  const chartInstanceRef = React.useRef(null);

  const taxSlabs = {
    old: [
      { limit: 250000, rate: 0 },
      { limit: 500000, rate: 0.05 },
      { limit: 1000000, rate: 0.20 },
      { limit: Infinity, rate: 0.30 }
    ],
    new: [
      { limit: 300000, rate: 0 },
      { limit: 600000, rate: 0.05 },
      { limit: 900000, rate: 0.10 },
      { limit: 1200000, rate: 0.15 },
      { limit: 1500000, rate: 0.20 },
      { limit: Infinity, rate: 0.30 }
    ]
  };

  const numberToWords = (num) => {
    const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

    if (num === 0) return 'Zero rupees';
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;

    let words = '';
    if (crore) words += units[crore] + ' crore ';
    if (lakh) words += units[lakh] + ' lakh ';
    return (words || 'Zero') + 'rupees';
  };

  const formatCurrency = (num) => {
    return '₹' + Math.round(num).toLocaleString('en-IN');
  };

  const calculateTax = (income, regime) => {
    const slabs = taxSlabs[regime];
    let tax = 0;
    let previousLimit = 0;
    const slabBreakdown = [];

    for (let i = 0; i < slabs.length; i++) {
      const slab = slabs[i];
      if (income <= previousLimit) break;
      const upperLimit = slab.limit;
      let taxableInSlab = (upperLimit === Infinity) ? Math.max(0, income - previousLimit) : Math.max(0, Math.min(income, upperLimit) - previousLimit);
      if (taxableInSlab > 0) {
        const taxInSlab = taxableInSlab * slab.rate;
        tax += taxInSlab;
        slabBreakdown.push({ range: `${previousLimit.toLocaleString('en-IN')} - ${upperLimit === Infinity ? 'Above' : upperLimit.toLocaleString('en-IN')}`, rate: slab.rate * 100, tax: taxInSlab });
      }
      previousLimit = upperLimit === Infinity ? previousLimit : upperLimit;
    }

    const taxBeforeCharges = tax;
    let surcharge = 0;
    if (income > 5000000 && income <= 10000000) surcharge = tax * 0.10;
    else if (income > 10000000 && income <= 20000000) surcharge = tax * 0.15;
    else if (income > 20000000 && income <= 50000000) surcharge = tax * 0.25;
    else if (income > 50000000) surcharge = tax * 0.37;

    tax += surcharge;
    const cess = tax * 0.04;
    const finalTax = tax + cess;
    return { taxBeforeCharges, surcharge, cess, finalTax, slabBreakdown };
  };

  const calculateSalary = () => {
    let basicAmount = inputMode === 'percentage' ? ctc * (basic / 100) : basic;
    const hra = basicAmount * 0.40;
    const employerPf = basicAmount * 0.12;
    const employeePf = basicAmount * 0.12;
    const gratuity = basicAmount * 0.0481;

    const insuranceEmployer = parseFloat(insuranceAmount) || 0;
    const otherEmployer = parseFloat(otherDeductionsAmount) || 0;

    let npsDeduction = 0;
    if (inputMode === 'percentage') {
      npsDeduction = Math.min(basicAmount * (nps / 100), basicAmount * 0.14);
    } else {
      npsDeduction = Math.min(nps, basicAmount * 0.14);
    }

    const ctcCommitments = basicAmount + hra + employerPf + gratuity + insuranceEmployer + otherEmployer;
    const special = Math.max(0, ctc - ctcCommitments);
    const grossSalary = basicAmount + hra + special;

    const standardDeduction = 50000;
    let taxableIncome = grossSalary; // initial
    let taxDetails = {};

    if (taxRegime === 'old') {
      const hraExemption = Math.min(hra, basicAmount * 0.50, grossSalary - (basicAmount + hra));
      const section80C = Math.min(employeePf, 150000);
      const nps80CCD1B = Math.min(npsDeduction, 50000);

      taxableIncome = grossSalary - (standardDeduction + hraExemption + section80C + nps80CCD1B);
      taxableIncome = Math.max(0, taxableIncome);
      taxDetails = calculateTax(taxableIncome, 'old');
      if (taxableIncome <= 500000) taxDetails.finalTax = Math.max(0, taxDetails.finalTax - 12500);
    } else {
      taxableIncome = grossSalary - standardDeduction;
      taxableIncome = Math.max(0, taxableIncome);
      taxDetails = calculateTax(taxableIncome, 'new');
      if (taxableIncome <= 700000) taxDetails.finalTax = 0;
    }

    const totalTax = taxDetails.finalTax;
    const profTax = includeProfTax ? 2500 : 0;
    const totalDeductions = employeePf + npsDeduction + profTax + totalTax;
    const netInHandYearly = grossSalary - totalDeductions;
    const netInHandMonthly = netInHandYearly / 12;

    setResults({
      ctc,
      basicAmount,
      hra,
      special,
      grossSalary,
      employerPf,
      employeePf,
      gratuity,
      insuranceEmployer,
      otherEmployer,
      npsDeduction,
      profTax,
      totalTax,
      totalDeductions,
      netInHandYearly,
      netInHandMonthly,
      taxableIncome,
      standardDeduction,
      taxRegime,
      taxDetails
    });
  };

  useEffect(() => {
    calculateSalary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctc, basic, inputMode, taxRegime, nps, includeProfTax]);

  useEffect(() => {
    if (results && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
      
      chartInstanceRef.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Net In-Hand', 'Employee PF', 'NPS', 'Prof. Tax', 'Income Tax'],
          datasets: [{
            data: [
              results.netInHandYearly,
              results.employeePf,
              results.npsDeduction,
              results.profTax,
              results.totalTax
            ],
            backgroundColor: ['#0d9488', '#f59e0b', '#8b5cf6', '#eab308', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 10 } } }
          }
        }
      });
    }
  }, [results]);

  const downloadPDF = () => {
    if (!results) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Salary Breakdown (CTC to In-hand)', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Tax Regime: ${results.taxRegime === 'old' ? 'Old' : 'New'}`, 105, 30, { align: 'center' });
    
    let y = 45;
    doc.setFontSize(14);
    doc.text('Summary', 20, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.text('Total CTC:', 20, y);
    doc.text(formatCurrency(results.ctc), 180, y, { align: 'right' });
    y += 8;
    doc.text('Net Annual Salary:', 20, y);
    doc.text(formatCurrency(results.netInHandYearly), 180, y, { align: 'right' });
    y += 8;
    doc.text('Net Monthly Salary:', 20, y);
    doc.text(formatCurrency(results.netInHandMonthly), 180, y, { align: 'right' });
    
    doc.save('salary-breakdown-ctc-to-inhand.pdf');
  };

  const downloadExcel = () => {
    if (!results) return;
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['Salary Breakdown (CTC to In-hand)'],
      ['Tax Regime', results.taxRegime],
      [],
      ['Summary', 'Amount'],
      ['Total CTC', results.ctc],
      ['Net Annual Salary', results.netInHandYearly],
      ['Net Monthly Salary', results.netInHandMonthly],
      [],
      ['Earnings (Annual)', 'Amount'],
      ['Basic Salary', results.basicAmount],
      ['HRA', results.hra],
      ['Special Allowance', results.special],
      ['Gross Salary', results.grossSalary],
      [],
      ['Deductions (Annual)', 'Amount'],
      ['Employee PF', results.employeePf],
      ['NPS', results.npsDeduction],
      ['Professional Tax', results.profTax],
      ['Income Tax', results.totalTax],
      ['Total Deductions', results.totalDeductions]
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Salary Breakdown');
    XLSX.writeFile(wb, 'salary-breakdown-ctc-to-inhand.xlsx');
  };

  if (!results) return null;

  return (
    <div className="max-w-5xl mx-auto mb-6">
      <div className="bg-white/60 dark:bg-gray-900 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-800 p-6 sm:p-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">CTC To In-hand Calculator</h2>
        <p className="text-gray-600 dark:text-gray-400">Enter your CTC and components to see gross, deductions and net in-hand salary.</p>
      </div>

      <div className="max-w-5xl mx-auto mt-6">
        <div className="bg-white/60 dark:bg-gray-900 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-800 p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Input Panel */}
            <div className="p-6 rounded-2xl bg-amber-40 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-100">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-4">Enter your Annual CTC</label>
                <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full px-4 py-2">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">₹</span>
                  <input
                    type="number"
                    value={ctc}
                    onChange={(e) => setCtc(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent text-gray-700 dark:text-gray-200 font-medium text-right focus:outline-none"
                    min="1"
                    max="10000000"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{numberToWords(ctc)}</p>
              </div>

              <hr className="border-gray-200/80 dark:border-gray-700/80 my-4" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Tax Regime</h3>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="taxRegime"
                      value="new"
                      checked={taxRegime === 'new'}
                      onChange={(e) => setTaxRegime(e.target.value)}
                      className="h-4 w-4 text-teal-600"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">New</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="taxRegime"
                      value="old"
                      checked={taxRegime === 'old'}
                      onChange={(e) => setTaxRegime(e.target.value)}
                      className="h-4 w-4 text-teal-600"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Old</span>
                  </label>
                </div>
              </div>

              <hr className="border-gray-200/80 dark:border-gray-700/80 my-4" />

              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Salary Components</h3>
                  <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="inputMode"
                        value="percentage"
                        checked={inputMode === 'percentage'}
                        onChange={(e) => setInputMode(e.target.value)}
                        className="h-4 w-4 text-teal-600"
                      />
                      <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">%</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="inputMode"
                        value="amount"
                        checked={inputMode === 'amount'}
                        onChange={(e) => setInputMode(e.target.value)}
                        className="h-4 w-4 text-teal-600"
                      />
                      <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">₹</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center space-x-4">
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Basic <span className="font-bold ml-1">({inputMode === 'percentage' ? '%' : '₹'})</span>
                    </label>
                    <input
                      type="number"
                      value={basic}
                      onChange={(e) => setBasic(parseFloat(e.target.value) || 0)}
                      className="w-28 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 text-right focus:ring-2 focus:ring-teal-400"
                      min="1"
                      max="100"
                    />
                  </div>

                  <div className="flex justify-between items-center space-x-4">
                    <label className="text-sm text-gray-600 dark:text-gray-400">NPS (Max 14% of Basic)</label>
                    <input
                      type="number"
                      value={nps}
                      onChange={(e) => setNps(parseFloat(e.target.value) || 0)}
                      className="w-28 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 text-right focus:ring-2 focus:ring-teal-400"
                      min="0"
                      max="14"
                    />
                  </div>

                  <div className="flex justify-between items-center space-x-4">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Insurance (Fixed)</label>
                    <input
                      type="number"
                      value={insuranceAmount}
                      onChange={(e) => setInsuranceAmount(parseFloat(e.target.value) || 0)}
                      className="w-28 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 text-right focus:ring-2 focus:ring-teal-400"
                      min="0"
                    />
                  </div>

                  <div className="flex justify-between items-center space-x-4">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Other Deductions (Fixed)</label>
                    <input
                      type="number"
                      value={otherDeductionsAmount}
                      onChange={(e) => setOtherDeductionsAmount(parseFloat(e.target.value) || 0)}
                      className="w-28 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 text-right focus:ring-2 focus:ring-teal-400"
                      min="0"
                    />
                  </div>

                  <label className="flex items-center cursor-pointer pt-3">
                    <input
                      type="checkbox"
                      checked={includeProfTax}
                      onChange={(e) => setIncludeProfTax(e.target.checked)}
                      className="h-5 w-5 text-teal-600 border-gray-300 rounded dark:bg-gray-700"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Professional Tax (₹2,500/Year)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="p-6 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Salary Breakdown under {taxRegime === 'old' ? 'Old' : 'New'} Tax Regime
              </h2>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-center text-gray-600 dark:text-gray-400 text-sm">Net Monthly Salary</p>
                <h3 className="text-3xl font-bold text-center text-teal-600 dark:text-teal-400">{formatCurrency(results.netInHandMonthly)}</h3>
                <p className="text-center text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Net Annual: <span className="font-medium text-gray-600 dark:text-gray-400">{formatCurrency(results.netInHandYearly)}</span>
                </p>
              </div>
              <canvas ref={chartRef} className="max-h-64 sm:max-h-72 mt-4"></canvas>

              <div className="mt-4">
                <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">Earnings Breakdown (Annual)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Basic Salary</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(results.basicAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">HRA</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(results.hra)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Special Allowance</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(results.special)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-gray-300 dark:border-gray-700 pt-2 mt-2">
                    <span>Gross Salary</span>
                    <span>{formatCurrency(results.grossSalary)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">Deductions (Annual)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Employee EPF</span>
                    <span className="text-red-600 dark:text-red-400 font-medium">{formatCurrency(results.employeePf)}</span>
                  </div>
                  {results.npsDeduction > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Employee NPS</span>
                      <span className="text-red-600 dark:text-red-400 font-medium">{formatCurrency(results.npsDeduction)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Professional Tax</span>
                    <span className="text-red-600 dark:text-red-400 font-medium">{formatCurrency(results.profTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Income Tax (TDS)</span>
                    <span className="text-red-600 dark:text-red-400 font-medium">{formatCurrency(results.totalTax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-gray-300 dark:border-gray-700 pt-2 mt-2 text-red-700 dark:text-red-400">
                    <span>Total Deductions</span>
                    <span>{formatCurrency(results.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Panel */}
            <div className="p-6 rounded-2xl bg-rose-40 dark:bg-rose-500/8 border border-rose-200 dark:border-rose-100">
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">Cost to Company Breakup (Total CTC)</h3>
              <div className="space-y-2 text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Gross Salary</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(results.grossSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Employer EPF (12%)</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(results.employerPf)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Gratuity (4.81%)</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(results.gratuity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Insurance (Employer Fixed)</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(results.insuranceEmployer || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Other Deductions (Employer Fixed)</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(results.otherEmployer || 0)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-gray-300 dark:border-gray-700 pt-2 mt-2">
                  <span>Total CTC</span>
                  <span>{formatCurrency(results.ctc)}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">Download Report</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={downloadPDF}
                    className="flex items-center justify-center bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 font-semibold transition-all">
                    PDF
                  </button>
                  <button
                    onClick={downloadExcel}
                    className="flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-all">
                    Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTCToInhand;
