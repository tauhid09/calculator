import React from 'react';

const About = () => {
  return (
    <section id="about-section" className="max-w-5xl mx-auto px-4 py-20">
      <div className="mt-5">
        <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-teal-700 via-teal-600 to-blue-600 bg-clip-text text-transparent dark:from-teal-200 dark:via-cyan-200 dark:to-blue-200 text-center">
          About the CTC Calculator
        </h2>
        <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl border border-white/50 dark:border-gray-800 rounded-3xl p-10 shadow-[0_8px_25px_rgba(0,0,0,0.06)]">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
            This calculator helps you understand the breakdown of your Cost to Company (CTC) and estimate your in-hand salary. It accounts for common deductions like Employee Provident Fund (EPF), Professional Tax, and Income Tax under both the Old and New Tax Regimes.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
            Please note that this is an estimation tool. The final salary and tax calculations may vary based on your company's specific policies and your complete financial profile. It's always a good idea to consult with a financial advisor for exact figures.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
