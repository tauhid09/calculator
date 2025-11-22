// Utility functions for calculator

export const formatCurrency = (num) => {
  return '₹' + Math.round(num).toLocaleString('en-IN');
};

export const formatSimple = (val) => `₹${Math.round(val).toLocaleString('en-IN')}`;

export const negFormatSimple = (val) => `-₹${Math.round(val).toLocaleString('en-IN')}`;

export const numberToWords = (num) => {
  const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  if (num === 0) return 'Zero rupees';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;

  let words = '';
  if (crore) words += units[crore] + ' crore ';
  if (lakh) words += units[lakh] + ' lakh ';
  if (thousand) words += units[thousand] + ' thousand ';

  return (words || 'Zero') + 'rupees';
};

export const calculateTax = (income, regime, taxSlabs) => {
  const slabs = taxSlabs[regime];
  let tax = 0;
  let previousLimit = 0;
  let slabBreakdown = [];

  for (let slab of slabs) {
    if (income <= previousLimit) break;
    const taxableInSlab = Math.min(income, slab.limit) - previousLimit;
    if (taxableInSlab > 0) {
      const taxInSlab = taxableInSlab * slab.rate;
      tax += taxInSlab;
      slabBreakdown.push({
        range: `₹${previousLimit.toLocaleString('en-IN')} - ${slab.limit === Infinity ? 'Above' : '₹' + slab.limit.toLocaleString('en-IN')}`,
        rate: slab.rate * 100,
        tax: taxInSlab
      });
    }
    previousLimit = slab.limit;
  }

  let surcharge = 0;
  if (income > 5000000 && income <= 10000000) surcharge = tax * 0.10;
  else if (income > 10000000 && income <= 20000000) surcharge = tax * 0.15;
  else if (income > 20000000 && income <= 50000000) surcharge = tax * 0.25;
  else if (income > 50000000) surcharge = tax * 0.37;

  const cess = (tax + surcharge) * 0.04;
  const finalTax = tax + surcharge + cess;

  return {
    taxBeforeCharges: tax,
    surcharge,
    cess,
    finalTax,
    slabBreakdown
  };
};

export const TAX_SLABS = {
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

export const SALARY_COMPONENTS = {
  hraPercent: 0.40,      // 40% of basic
  employerPfPercent: 0.12,   // 12% of basic
  employeePfPercent: 0.12,   // 12% of basic
  gratuityPercent: 0.0481,   // 4.81% of basic
  npsMaxPercent: 0.14,   // Max 14% of basic
  professionalTax: 2500, // Annual
  standardDeduction: 50000
};

export const generatePDFReport = (jsPDF, data, filename = 'salary-breakdown.pdf') => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Salary Breakdown Report', 105, 20, { align: 'center' });
  
  let y = 45;
  doc.setFontSize(12);
  
  Object.entries(data).forEach(([key, value]) => {
    doc.text(`${key}:`, 20, y);
    doc.text(formatCurrency(value), 180, y, { align: 'right' });
    y += 8;
  });
  
  doc.save(filename);
};

export const generateExcelReport = (XLSX, data, sheetName = 'Salary Breakdown') => {
  const wb = XLSX.utils.book_new();
  const wsData = Object.entries(data).map(([key, value]) => [key, value]);
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return wb;
};

export const validateInput = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  if (isNaN(num)) return min;
  if (num < min) return min;
  if (num > max) return max;
  return num;
};
