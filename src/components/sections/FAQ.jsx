import React, { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const faqs = [
    {
      question: '1. What is CTC (Cost to Company)?',
      answer: 'CTC stands for "Cost to Company". It is the total amount that a company spends on an employee, directly or indirectly. It includes your gross salary, employer\'s contribution to EPF, gratuity (if applicable), and any other benefits.'
    },
    {
      question: '2. Old vs New Tax Regime?',
      answer: 'Old: more deductions (HRA, LTA, 80C) | New: lower tax slabs but fewer exemptions.'
    },
    {
      question: '3. How is EPF calculated?',
      answer: 'EPF = 12% of Basic Salary (employee) + 12% employer contribution.'
    }
  ];

  return (
    <section id="faq-section" className="max-w-5xl mx-auto px-4 py-20">
      <h2 className="text-4xl font-extrabold mb-10 bg-gradient-to-r from-blue-700 via-teal-600 to-teal-700 bg-clip-text text-transparent dark:from-cyan-300 dark:via-teal-200 dark:to-blue-200 text-center">
        Frequently Asked Questions
      </h2>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div
            key={index}
            onClick={() => setActiveIndex(activeIndex === index ? -1 : index)}
            className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl border border-white/50 dark:border-gray-800 rounded-2xl p-6 shadow-md cursor-pointer transition-all">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{faq.question}</h3>
              <span className="text-lg text-teal-600 dark:text-teal-300">
                {activeIndex === index ? '−' : '+'}
              </span>
            </div>
            {activeIndex === index && (
              <p className="text-gray-700 dark:text-gray-300 mt-3">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
