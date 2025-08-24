import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  UserCircleIcon,
  NoSymbolIcon,
  MoonIcon,
  SunIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import {FiArrowLeft} from "react-icons/fi";

import AccountSettings from '../components/settings/AccountSettings';
import BlockedContacts from '../components/settings/BlockedContacts';
import { getCategories } from '../services/categoryService';
import { exportContactsCSV, exportContactsVCF } from '../services/importExportService';
import { BlockedContactsProvider } from '../components/dashboard/BlockedContactsContext';

function SettingsPage({ currentUser }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

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
  const navigate = useNavigate();

  const [activeSubPage, setActiveSubPage] = useState(null);
  const [categories, setCategories] = useState([]);

  const fetchCategories = useCallback(async () => {
    try {
      const result = await getCategories();
      if (result.success) setCategories(result.data);
      else throw new Error(result.error);
    } catch {
      setCategories([
        { category_id: 1, category_name: 'Family' },
        { category_id: 2, category_name: 'Friends' },
        { category_id: 3, category_name: 'Work' },
        { category_id: 4, category_name: 'Business' }
      ]);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFilters, setExportFilters] = useState({ filename: '', search: '', category: '', hasBirthday: false });

  const openExportPanel = (format) => { setExportFormat(format); setShowExportPanel(true); };
  const closeExportPanel = () => { setShowExportPanel(false); setExportFilters({ filename: '', search: '', category: '', hasBirthday: false }); };

  const handleExport = async () => {
    try {
      const userId = currentUser?.id;
      if (!userId) return alert('User not found');

      const filters = { ...exportFilters, hasBirthday: exportFilters.hasBirthday ? '1' : '' };
      const result = exportFormat === 'csv'
        ? await exportContactsCSV(userId, filters)
        : await exportContactsVCF(userId, filters);

      if (result.success) { closeExportPanel(); alert(`${exportFormat.toUpperCase()} exported successfully!`); }
      else alert(`Failed to export ${exportFormat.toUpperCase()}: ${result.error}`);
    } catch (error) { alert(`Error exporting ${exportFormat.toUpperCase()}: ` + error.message); }
  };

  /** --------------------------
   * FORMAT HANDLING (using PreferenceContext)
   ---------------------------*/
  const [showFormatPanel, setShowFormatPanel] = useState(false);
  const [showNameToggle, setShowNameToggle] = useState(false);
  const [showDateToggle, setShowDateToggle] = useState(false);

  // Remove PreferenceContext. Use local state for nameFormat and dateFormat, sync to localStorage
  const [nameFormat, setNameFormat] = useState(() => {
    return localStorage.getItem('nameFormat') || 'first_last';
  });
  const [dateFormat, setDateFormat] = useState(() => {
    return localStorage.getItem('dateFormat') || 'dd_mm_yyyy';
  });

  useEffect(() => {
    localStorage.setItem('nameFormat', nameFormat);
  }, [nameFormat]);

  useEffect(() => {
    localStorage.setItem('dateFormat', dateFormat);
  }, [dateFormat]);

  const handleToggleNameFormat = () => {
    setNameFormat((prev) => (prev === 'first_last' ? 'last_first' : 'first_last'));
  };

  const handleToggleDateFormat = () => {
    setDateFormat((prev) => (prev === 'dd_mm_yyyy' ? 'mm_dd_yyyy' : 'dd_mm_yyyy'));
  };

  /** --------------------------
   * THEME PANEL handling
   ---------------------------*/
  const [showThemePanel, setShowThemePanel] = useState(false);
  const handlethemeToggle = () => setShowThemePanel(true);
  const closeThemePanel = () => setShowThemePanel(false);

  return (
        <div className="min-h-screen bg-gradient-to-r from-blue-200 to-white dark:bg-gradient-to-r dark:from-[#0d1117] dark:via-slate-950 dark:to-[#15132b] flex items-center justify-center font-inter p-4">
          <div className="w-full max-w-5xl bg-white dark:bg-[#161b22] rounded-xl shadow-2xl p-10 relative">
            {!activeSubPage &&
              <>
                <div className="px-6 py-4 border-b border-slate-200 dark:border-[#30363d]">
                <button
                      onClick={() => navigate('/dashboard')}
                      className="absolute top-4 left-4 text-sm flex items-center text-slate-400 dark:text-slate-500 hover:scale-105 hover:text-blue-800 dark:hover:text-slate-400 transition-transform transform"
                    >
                      <FiArrowLeft className="mr-1" />
                      Back
                    </button>
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
    
                <div className="px-6 py-4 border-b border-slate-200 dark:border-[#30363d]">
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
    
                <div className="px-6 py-4">
                  <h2 className="text-gray-500 dark:text-gray-400 text-md font-semibold uppercase mb-2">Export</h2>
                  <div className="divide-y divide-slate-200 dark:divide-[#30363d]">
                    <button
                      className="w-full text-left py-5 px-5 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center"
                      onClick={() => openExportPanel('csv')}
                    >
                      <DocumentArrowDownIcon className="w-5 h-5 mr-3" />
                      Export as CSV
                    </button>
                    <button
                      className="w-full text-left py-5 px-5 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center"
                      onClick={() => openExportPanel('vcf')}
                    >
                      <DocumentArrowDownIcon className="w-5 h-5 mr-3" />
                      Export as VCF
                    </button>
                  </div>
                </div>
              </>
            }
        
    
            {activeSubPage === 'account' && (
              <AccountSettings onCancel={() => setActiveSubPage(false)} />
            )}
            {activeSubPage === 'blocked' && (
              <BlockedContactsProvider currentUser={currentUser}>
                <BlockedContacts onCancel={() => setActiveSubPage(false)} />
              </BlockedContactsProvider>
            )}
    
            {showThemePanel && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
                <div className="relative bg-slate-100 border border-slate-300 rounded-3xl w-[600px] h-[450px] shadow-xl p-6 flex flex-col items-center dark:bg-[#161b22] dark:border-[#30363d]">
                  <button className="absolute top-4 left-4 scale-100 hover:scale-110 transition-transform" onClick={closeThemePanel}>
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
    
            {showFormatPanel && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
                <div className="relative bg-slate-100 border border-slate-300 rounded-3xl w-[500px] h-auto shadow-xl p-6 flex flex-col items-center dark:bg-[#161b22] dark:border-[#30363d]">
                  <button className="absolute top-4 left-4 scale-100 hover:scale-110 transition-transform" onClick={() => setShowFormatPanel(false)}>
                    <ArrowLeftIcon className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400" />
                  </button>
                  <h3 className="text-lg font-semibold text-black dark:text-gray-300 text-center mt-4 mb-6">Change Formats</h3>
    
                  <div className="w-full divide-y divide-slate-200 dark:divide-[#30363d]">
                    <div>
                      <button
                        className="w-full text-left py-5 px-2 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center"
                        onClick={() => setShowNameToggle(prev => !prev)}
                      >
                        <IdentificationIcon className="w-5 h-5 mr-3 inline" />
                        Name Format
                      </button>
                      {showNameToggle && (
                        <div className="px-2 pb-4">
                          <button onClick={handleToggleNameFormat} className="btn w-full flex justify-center items-center">
                            {nameFormat === 'first_last' ? 'Switch to Last Name / First Name' : 'Switch to First Name / Last Name'}
                          </button>
                          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
                            Current: {nameFormat === 'first_last' ? 'First Name / Last Name' : 'Last Name / First Name'}
                          </div>
                        </div>
                      )}
                    </div>
    
                    <div>
                      <button
                        className="w-full text-left py-5 px-2 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center"
                        onClick={() => setShowDateToggle(prev => !prev)}
                      >
                        <IdentificationIcon className="w-5 h-5 mr-3 inline" />
                        Date Format
                      </button>
                      {showDateToggle && (
                        <div className="px-2 pb-4">
                          <button onClick={handleToggleDateFormat} className="btn w-full flex justify-center items-center">
                            {dateFormat === 'dd_mm_yyyy' ? 'Switch to MM/DD/YYYY' : 'Switch to DD/MM/YYYY'}
                          </button>
                          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
                            Current: {dateFormat === 'dd_mm_yyyy' ? 'DD/MM/YYYY' : 'MM/DD/YYYY'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
    
            {showExportPanel && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
                <div className="relative bg-white border border-slate-200 rounded-3xl w-[600px] h-[500px] shadow-xl p-6 flex flex-col dark:bg-[#161b22] dark:border-[#30363d]">
                  <button className="absolute top-4 left-4 scale-100 hover:scale-110 transition-transform" onClick={closeExportPanel}>
                    <ArrowLeftIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                  </button>
                  <h3 className="text-lg font-semibold text-black dark:text-white text-center mt-4 mb-6">
                    Export Contacts as {exportFormat.toUpperCase()}
                  </h3>
                  <div className="flex-1 px-4 space-y-4 overflow-y-auto">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Custom Filename (optional)
                      </label>
                      <input
                        type="text"
                        placeholder={`contacts_${new Date().toISOString().slice(0, 10)}.${exportFormat}`}
                        value={exportFilters.filename}
                        onChange={(e) => setExportFilters({ ...exportFilters, filename: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-white dark:bg-[#21262d] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Search Filter (name, email, or phone)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter search term..."
                        value={exportFilters.search}
                        onChange={(e) => setExportFilters({ ...exportFilters, search: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-white dark:bg-[#21262d] focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Category Filter
                      </label>
                      <select
                        value={exportFilters.category}
                        onChange={(e) => setExportFilters({ ...exportFilters, category: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-gray-400 dark:bg-[#21262d] focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-indigo-400"
                      >
                        <option value="">All Categories</option>
                        {categories.map(category => <option key={category.category_id} value={category.category_id}>{category.category_name}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasBirthday"
                        checked={exportFilters.hasBirthday}
                        onChange={(e) => setExportFilters({ ...exportFilters, hasBirthday: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      />
                      <label htmlFor="hasBirthday" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                        Only contacts with birthdays
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
                    <button onClick={closeExportPanel} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleExport} className="btn flex items-center">
                      <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                      Export {exportFormat.toUpperCase()}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
}

export default SettingsPage;