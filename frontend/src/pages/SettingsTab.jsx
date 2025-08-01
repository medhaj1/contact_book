import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

function SettingsTab() {

  const[isDark, setIsDark] = useState(()=>{
      return localStorage.getItem('theme') === 'dark';
    });
  useEffect(() => {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
      else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }, [isDark]);
  const toggleTheme = () => {
      setIsDark(!isDark);
    };
  
  const[showThemePanel, setShowThemePanel] = useState(false);
  const handlethemeToggle=()=> {
    setShowThemePanel(true)
  }
  const closeThemePanel=()=> {
    setShowThemePanel(false)
  }
  const handleNameformat=()=> {}
  const handleAccountSettings=()=> {}
  const handleBlockedContacts=()=> {}


  return (
    <div className="bg-white dark:bg-slate-700 rounded-xl shadow-md overflow-hidden">
      {/* Section 1: Account */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-slate-500 dark:text-gray-400 text-md font-semibold uppercase mb-2">Account</h2>

        <div className="divide-y divide-slate-200">
          <button className="w-full text-left py-5 px-2 rounded-lg text-slate-700 dark:text-white hover:bg-blue-50 dark:hover:bg-slate-600"
            onClick={handleAccountSettings}>
            Account Settings
          </button>
          <button className="w-full text-left py-5 px-2 rounded-lg text-slate-700 dark:text-white hover:bg-blue-50 dark:hover:bg-slate-600"
            onClick={handleBlockedContacts}>
            Blocked Contacts
          </button>
        </div>
      </div>

      {/* Section 2: Preferences */}
      <div className="px-6 py-4">
        <h2 className="text-gray-500 dark:text-gray-400 text-md font-semibold uppercase mb-2">Preferences</h2>

        <div className="divide-y divide-slate-200">
          <button className="w-full text-left py-5 px-2 rounded-lg text-slate-700 dark:text-white hover:bg-blue-50 dark:hover:bg-slate-600"
            onClick={handlethemeToggle}>
            Theme
          </button>
          <button className="w-full text-left py-5 px-2 rounded-lg text-slate-700 dark:text-white hover:bg-blue-50 dark:hover:bg-slate-600"
          onClick={handleNameformat} >
            Name Format
          </button>
        </div>
      </div>
      {/* Theme Panel */}
      {showThemePanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="relative bg-white border-[10px] border-slate-200 rounded-3xl w-[500px] h-[400px] shadow-xl p-6 flex flex-col items-center dark:bg-slate-700 dark:border-slate-800">

            {/* Back Arrow - absolute top-left inside the panel */}
            <button
              className="absolute top-4 left-4 scale-100 hover:scale-110 transition-transform"
              onClick={closeThemePanel}
            >
              <ArrowLeftIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" />
            </button>

            {/* Centered Heading */}
            <h3 className="text-lg font-semibold text-black dark:text-white text-center mt-4 mb-6">
              Change Theme
            </h3>

            {/* Inner block for toggle and image */}
            <div className="flex flex-col w-[250px] h-[200px] items-center justify-center mt-6 space-y-4">
              <img
                src={isDark ? '/dark-preview.png' : '/light-preview.png'}
                alt="Theme Preview"
                className="w-[220px] h-[150px] dark:text-white rounded-md shadow"
              />
              <button
                onClick={toggleTheme}
                className="btn"
              >
                {isDark ? '☀️  Light' : '🌙 Dark'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SettingsTab;
