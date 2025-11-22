import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CTCToInhand from './components/calculators/CTCToInhand';
import InhandToCTC from './components/calculators/InhandToCTC';
import CompareOffers from './components/calculators/CompareOffers';
import TaxCalculator from './components/calculators/TaxCalculator';
import HikeCalculator from './components/calculators/HikeCalculator';
import AdditionalCalculators from './components/calculators/AdditionalCalculators';
import About from './components/sections/About';
import FAQ from './components/sections/FAQ';

const App = () => {
  const [activeTab, setActiveTab] = useState('ctc-to-inhand');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const tabs = [
    { id: 'ctc-to-inhand', label: 'CTC To In-hand', component: CTCToInhand },
    { id: 'inhand-to-ctc', label: 'In-hand To CTC', component: InhandToCTC },
    { id: 'compare', label: 'Compare Offers', component: CompareOffers },
    { id: 'tax', label: 'Tax Calculator', component: TaxCalculator },
    { id: 'hike', label: 'Hike Calculator', component: HikeCalculator },
    { id: 'additional', label: 'Additional Calculator', component: AdditionalCalculators },
  ];

  const CurrentComponent = tabs.find(t => t.id === activeTab)?.component || CTCToInhand;

  return (
    <div className={`min-h-screen bg-arpit-gradient text-gray-800 dark:text-gray-200 transition-colors duration-300 ${isDark ? 'dark' : 'light'}`}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} setIsDark={setIsDark} tabs={tabs} />
      
      <main className="container mx-auto px-4 py-8 relative z-10 pt-40 sm:pt-48">
        <CurrentComponent />
      </main>

      <About />
      <FAQ />

      <Footer activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
    </div>
  );
};

export default App;
