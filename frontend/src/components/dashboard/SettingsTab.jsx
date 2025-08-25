import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  NoSymbolIcon,
  MoonIcon,
  SunIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

import AccountSettings from '../settings/AccountSettings';
import BlockedContacts from '../settings/BlockedContacts';

function SettingsTab({ currentUser }) {
  /** --------------------------
   * THEME HANDLING (From Code 1)
   ---------------------------*/
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
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

  const toggleTheme = () => setIsDark(!isDark);

  /** --------------------------
   * SUB PAGE HANDLING (From Code 1)
   ---------------------------*/
  const [activeSubPage, setActiveSubPage] = useState(() => {
    return localStorage.getItem('settingsActiveSubPage') || null;
  });

  // Persist active sub page
  useEffect(() => {
    if (activeSubPage) {
      localStorage.setItem('settingsActiveSubPage', activeSubPage);
    } else {
      localStorage.removeItem('settingsActiveSubPage');
    }
  }, [activeSubPage]);

  /** --------------------------
   * CATEGORY FETCHING (From Code 2 - Service based)
   ---------------------------*/


  /** --------------------------
   * EXPORT HANDLING (From Code 2 - Service based)
   ---------------------------*/

  /** --------------------------
   * FORMAT HANDLING (Code 1 style UI)
   ---------------------------*/
  const [showFormatPanel, setShowFormatPanel] = useState(false);
  const [isFirstLast, setIsFirstLast] = useState(() => {
    return (localStorage.getItem("nameFormat") || "first_last") === "first_last";
  });
  const [isDayMonthYear, setIsDayMonthYear] = useState(() => {
    return (localStorage.getItem("dateFormat") || "dd_mm_yyyy") === "dd_mm_yyyy";
  });
  const [showNameToggle, setShowNameToggle] = useState(false);
  const [showDateToggle, setShowDateToggle] = useState(false);

  const toggleNameFormat = () => {
    const newFormat = !isFirstLast;
    setIsFirstLast(newFormat);
    localStorage.setItem("nameFormat", newFormat ? "first_last" : "last_first");
  };
  
  const toggleDateFormat = () => {
    const newFormat = !isDayMonthYear;
    setIsDayMonthYear(newFormat);
    localStorage.setItem("dateFormat", newFormat ? "dd_mm_yyyy" : "mm_dd_yyyy");
  };

  /** --------------------------
   * THEME PANEL handling
   ---------------------------*/
  const [showThemePanel, setShowThemePanel] = useState(false);
  const handlethemeToggle = () => setShowThemePanel(true);
  const closeThemePanel = () => setShowThemePanel(false);

  /** --------------------------
   * RENDER
   ---------------------------*/
  return (
    <div className="flex justify-center bg-blue-50 dark:bg-[#0d1117]">
      <div className="w-[900px] px-[30px] py-[20px] bg-white dark:bg-[#161b22] rounded-xl shadow-md overflow-hidden">
        {!activeSubPage && (
          <>
            {/* Section 1: Account */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#30363d]">
              <h2 className="text-slate-500 dark:text-gray-400 text-md font-semibold uppercase mb-2">Account</h2>
              <div className="divide-y divide-slate-200 dark:divide-[#30363d]">
                <button
                  className="w-full text-left p-5 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center"
                  onClick={() => setActiveSubPage('account')}
                >
                  <UserCircleIcon className="w-5 h-5 mr-3 inline" />
                  Account Settings
                </button>
                <button
                  className="w-full text-left p-5 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center"
                  onClick={() => setActiveSubPage('blocked')}
                >
                  <NoSymbolIcon className="w-5 h-5 mr-3 inline" />
                  Blocked Contacts
                </button>
              </div>
            </div>

            {/* Section 2: Preferences */}
            <div className="px-6 py-4">
              <h2 className="text-gray-500 dark:text-gray-400 text-md font-semibold uppercase mb-2">Preferences</h2>
              <div className="divide-y divide-slate-200 dark:divide-[#30363d]">
                <button
                  className="w-full text-left py-5 px-5 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center"
                  onClick={handlethemeToggle}
                >
                  {isDark ? <MoonIcon className="w-5 h-5 mr-3 inline" /> : <SunIcon className="w-5 h-5 mr-3 inline" />}
                  Theme
                </button>
                <button
                  className="w-full text-left py-5 px-5 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center"
                  onClick={() => setShowFormatPanel(true)}
                >
                  <IdentificationIcon className="w-5 h-5 mr-3 inline" />
                  Format
                </button>
              </div>
            </div>
          </>
        )}

        {/* Sub Pages */}
        {activeSubPage === 'account' && <AccountSettings onCancel={() => setActiveSubPage(false)} />}
        {activeSubPage === 'blocked' && <BlockedContacts onCancel={() => setActiveSubPage(false)} />}

        {/* Theme Panel */}
        {showThemePanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="relative bg-slate-100 border border-slate-300 rounded-3xl w-[600px] h-[450px] shadow-xl p-6 flex flex-col items-center dark:bg-[#161b22] dark:border-[#30363d]">
              <button
                className="absolute top-4 left-4 scale-100 hover:scale-110 transition-transform"
                onClick={closeThemePanel}
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400" />
              </button>
              <h3 className="text-lg font-semibold text-black dark:text-gray-300 text-center mt-4 mb-[60px]">Change Theme</h3>
              <div className="flex flex-col w-[500px] h-[200px] items-center justify-center mt-6 space-y-4">
                <img
                  src={isDark ? '/LightTheme.png' : '/DarkTheme.png'}
                  alt="Theme Preview"
                  className="w-[400px] mb-[15px] dark:text-white rounded-md shadow-lg"
                />
                <button onClick={toggleTheme} className="btn">
                  {isDark ? <SunIcon className="w-5 h-5 inline" /> : <MoonIcon className="w-5 h-5 inline" />}
                  {isDark ? 'Light' : 'Dark'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Format Panel */}
        {showFormatPanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="relative bg-slate-100 border border-slate-300 rounded-3xl w-[500px] h-auto shadow-xl p-6 flex flex-col items-center dark:bg-[#161b22] dark:border-[#30363d]">
              <button
                className="absolute top-4 left-4 scale-100 hover:scale-110 transition-transform"
                onClick={() => setShowFormatPanel(false)}
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400" />
              </button>
              <h3 className="text-lg font-semibold text-black dark:text-gray-300 text-center mt-4 mb-6">Change Formats</h3>

              <div className="w-full divide-y divide-slate-200 dark:divide-[#30363d]">
                {/* Name Format */}
                <div>
                  <button
                    className="w-full text-left py-5 px-2 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center"
                    onClick={() => setShowNameToggle((prev) => !prev)}
                  >
                    <IdentificationIcon className="w-5 h-5 mr-3 inline" />
                    Name Format
                  </button>
                  {showNameToggle && (
                    <div className="px-2 pb-4">
                      <button onClick={toggleNameFormat} className="btn w-full flex justify-center items-center">
                        {isFirstLast ? 'First Name / Last Name' : 'Last Name / First Name'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Date Format */}
                <div>
                  <button
                    className="w-full text-left py-5 px-2 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center"
                    onClick={() => setShowDateToggle((prev) => !prev)}
                  >
                    <IdentificationIcon className="w-5 h-5 mr-3 inline" />
                    Date Format
                  </button>
                  {showDateToggle && (
                    <div className="px-2 pb-4">
                      <button onClick={toggleDateFormat} className="btn w-full flex justify-center items-center">
                        {isDayMonthYear ? 'DD/MM/YYYY' : 'MM/DD/YYYY'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsTab;
