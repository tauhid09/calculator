// salaryUtils.js

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

export function calculateTax(income, regime) {
  const slabs = taxSlabs[regime] || taxSlabs.new;
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
}

export function computeSalaryFromCTC({ ctc = 1000000, basicPercent = 40, inputMode = 'percentage', nps = 0, insurance = 0, other = 0, includeProfTax = true, includeEmployeePF = true, taxRegime = 'new' } = {}) {
  let basicAmount = inputMode === 'percentage' ? ctc * (basicPercent / 100) : basicPercent;
  const hra = basicAmount * 0.40;
  const employerPf = basicAmount * 0.12;
  const employeePf = basicAmount * 0.12;
  const gratuity = basicAmount * 0.0481;

  const insuranceEmployer = parseFloat(insurance) || 0;
  const otherEmployer = parseFloat(other) || 0;

  // NPS Calculation (Max 14% of Basic)
  let npsDeduction = 0;
  if (inputMode === 'percentage') {
    npsDeduction = Math.min(basicAmount * (nps / 100), basicAmount * 0.14);
  } else {
    npsDeduction = Math.min(nps, basicAmount * 0.14);
  }

  // CORRECTED: Added npsDeduction to ctcCommitments as per user formula
  const ctcCommitments = basicAmount + hra + employerPf + gratuity + insuranceEmployer + otherEmployer + npsDeduction;
  
  const special = Math.max(0, ctc - ctcCommitments);
  const grossSalary = basicAmount + hra + special;

  const standardDeduction = 50000;
  let taxableIncome = grossSalary; 
  let taxDetails = {};

  if (taxRegime === 'old') {
    const hraExemption = Math.min(hra, basicAmount * 0.50, grossSalary - (basicAmount + hra));
    const section80C = includeEmployeePF ? Math.min(employeePf, 150000) : 0;
    
    // Note: Since NPS is now removed from CTC (Employer Contribution), it is generally fully exempt 
    // and not claimed under 80CCD(1B) which is for employee contribution. 
    // Keeping logic simple based on requested formula.
    
    taxableIncome = grossSalary - (standardDeduction + hraExemption + section80C);
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

  // CORRECTED: Removed npsDeduction from totalDeductions because it was already subtracted from CTC to form Gross
  const totalDeductions = (includeEmployeePF ? employeePf : 0) + profTax + totalTax;
  
  const netInHandYearly = grossSalary - totalDeductions;
  const netInHandMonthly = netInHandYearly / 12;

  return {
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
  };
}

export function estimateCTCForInhand(targetMonthlyInhand, opts = {}) {
  let low = 10000;
  let high = 20000000;
  let best = null;
  for (let i = 0; i < 60; i++) {
    const mid = Math.round((low + high) / 2);
    const res = computeSalaryFromCTC({ ...opts, ctc: mid });
    const diff = res.netInHandMonthly - targetMonthlyInhand;
    if (Math.abs(diff) < 1) { best = res; break; }
    if (diff < 0) low = mid; else high = mid;
    best = res;
  }
  return best;
}

export function formatCurrency(num) {
  return '₹' + Math.round(num).toLocaleString('en-IN');
}

export default {
  calculateTax,
  computeSalaryFromCTC,
  estimateCTCForInhand,
  formatCurrency
};