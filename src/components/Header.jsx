import React, { useState } from 'react';
import logo from './logo.png';

const Header = ({ activeTab, setActiveTab, isDark, setIsDark, tabs }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const headerStyleLight = {
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 251, 242, 0.8) 50%, rgba(234, 243, 255, 0.75) 100%)',
    backdropFilter: 'blur(16px) saturate(120%)'
  };

  const headerStyleDark = {
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(20, 35, 50, 0.85) 50%, rgba(25, 38, 55, 0.82) 100%)',
    backdropFilter: 'blur(16px) saturate(120%)'
  };

  return (
    <header className="fixed w-full top-0 z-50 border-b border-gray-200/80 dark:border-white/10 transition-all"
      style={isDark ? headerStyleDark : headerStyleLight}>
      <div className="max-w-5xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          <img src={logo} alt="CTC Calculator Logo" className="h-[60px] w-[60px] object-contain" />
          <span className="app-title-gradient tracking-wider font-extrabold text-xl sm:text-xl leading-none">
            MY CTC <br className="hidden sm:inline" /> CALCULATOR
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-2 text-sm">
            <a href="#about-section" className="tab-btn py-1 px-3">About</a>
            <a href="#faq-section" className="tab-btn py-1 px-3">FAQs</a>
            <button onClick={() => {}} className="tab-btn py-1 px-3">Blog</button>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle dark mode"
            aria-pressed={isDark}
          >
            <svg
              id="theme-icon-light"
              className={isDark ? 'inline w-6 h-6' : 'hidden w-6 h-6'}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden={!isDark}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg
              id="theme-icon-dark"
              className={!isDark ? 'inline w-6 h-6' : 'hidden w-6 h-6'}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden={isDark}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle mobile menu">
            ☰
          </button>
        </div>
      </div>

      <nav className={`w-full border-t border-gray-200/80 dark:border-white/10 sm:border-t-0 bg-white dark:bg-gray-900 sm:bg-transparent dark:sm:bg-transparent ${mobileMenuOpen ? 'block' : 'hidden sm:block'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-center w-full sm:space-x-8 text-gray-500 text-sm sm:text-base font-extrabold p-4 sm:p-0 sm:max-w-5xl mx-auto space-y-2 sm:space-y-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'tab-active' : ''}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
