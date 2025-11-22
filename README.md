# CTC Calculator - React Version

A modern, fully-functional Cost to Company (CTC) calculator built with React, Tailwind CSS, and Chart.js.

## Features

- **CTC to In-hand Calculator**: Calculate your net in-hand salary from your CTC
- **In-hand to CTC Calculator**: Estimate required CTC from desired in-hand salary
- **Compare Offers**: Compare two salary offers side by side
- **Tax Calculator**: Calculate and compare taxes under old vs new regimes
- **Hike Calculator**: Calculate salary after a percentage hike
- **Additional Calculators**: PF, HRA, Gratuity, LTA, Bonus, and Cost-of-Living calculators
- **Dark Mode Support**: Seamless dark/light theme switching
- **Export to PDF & Excel**: Download salary reports in PDF and Excel formats
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── Header.jsx                    # Navigation header with theme toggle
│   ├── Footer.jsx                    # Footer with links
│   ├── calculators/
│   │   ├── CTCToInhand.jsx          # Main CTC to In-hand calculator
│   │   ├── InhandToCTC.jsx          # Reverse calculator
│   │   ├── CompareOffers.jsx        # Compare multiple offers
│   │   ├── TaxCalculator.jsx        # Tax regime comparison
│   │   ├── HikeCalculator.jsx       # Salary hike calculator
│   │   └── AdditionalCalculators.jsx # Utility calculators
│   └── sections/
│       ├── About.jsx                 # About section
│       └── FAQ.jsx                   # FAQ section
├── App.jsx                           # Main application component
├── index.jsx                         # React entry point
└── index.css                         # Global styles
```

## Technologies Used

- **React 18**: UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Chart.js**: Data visualization
- **jsPDF**: PDF generation
- **XLSX**: Excel file generation
- **Lucide React**: Icon library

## Key Features Implementation

### 1. Tax Calculation
- Old Tax Regime with HRA exemption, 80C deductions
- New Tax Regime with Section 87A rebate
- Automatic tax slab calculation
- Professional tax and surcharge handling

### 2. Salary Components
- Basic salary (percentage or fixed amount)
- HRA (40% of basic, auto-calculated)
- Special Allowance (balancing figure)
- Employee & Employer EPF/PF
- Gratuity calculation
- NPS deductions

### 3. Dark Mode
- System preference detection
- LocalStorage persistence
- Smooth transitions
- All components themed

### 4. Responsive Design
- Mobile-first approach
- Tailwind breakpoints
- Adaptive layouts
- Touch-friendly inputs

## Tax Slabs (2025)

### New Regime
- 0-3L: 0%
- 3-6L: 5%
- 6-9L: 10%
- 9-12L: 15%
- 12-15L: 20%
- 15L+: 30%

### Old Regime
- 0-2.5L: 0%
- 2.5-5L: 5%
- 5-10L: 20%
- 10L+: 30%

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for personal and commercial purposes.

## Author

Arpit Pandey (Arpitpandey0454)

---

**Note**: This is an estimation tool. Actual calculations may vary based on company policies and individual financial situations. Consult a financial advisor for precise figures.
