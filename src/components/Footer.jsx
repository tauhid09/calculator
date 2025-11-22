import React from 'react';

const Footer = ({ activeTab, setActiveTab, tabs }) => {
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 dark:from-slate-900/80 to-slate-100 dark:to-slate-800/80">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">Calculators</h4>
            <ul className="space-y-3">
              {tabs.map(tab => (
                <li key={tab.id}>
                  <button
                    onClick={() => handleTabClick(tab.id)}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 md:col-span-2 grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">Resources</h4>
              <ul className="space-y-3">
                <li><button onClick={() => {}} className="text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">About Us</button></li>
                <li><button onClick={() => {}} className="text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Blog</button></li>
                <li><button onClick={() => {}} className="text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">Legal</h4>
              <ul className="space-y-3">
                <li><button onClick={() => {}} className="text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => {}} className="text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold mb-4 text-lg text-gray-900 dark:text-gray-100">Follow Us</h4>
            <ul className="space-y-3">
              <li><button onClick={() => {}} className="text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Twitter</button></li>
              <li><button onClick={() => {}} className="text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">LinkedIn</button></li>
              <li><button onClick={() => {}} className="text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">GitHub</button></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 text-center border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">&copy; 2025 CTC Calculator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
