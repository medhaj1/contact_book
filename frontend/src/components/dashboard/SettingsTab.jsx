import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  UserCircleIcon,
  NoSymbolIcon,
  MoonIcon,
  SunIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

import AccountSettings from '../settings/AccountSettings';
import BlockedContacts from '../settings/BlockedContacts';
import { getCategories } from '../../services/categoryService';
import { exportContactsCSV, exportContactsVCF } from '../../services/importExportService';

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
  const [activeSubPage, setActiveSubPage] = useState(null);

  /** --------------------------
   * CATEGORY FETCHING (From Code 2 - Service based)
   ---------------------------*/
  const [categories, setCategories] = useState([]);

  const fetchCategories = useCallback(async () => {
    try {
      const result = await getCategories();
      if (result.success) {
        setCategories(result.data);
      } else {
        console.error('Error fetching categories:', result.error);
        setCategories([
          { category_id: 1, category_name: 'Family' },
          { category_id: 2, category_name: 'Friends' },
          { category_id: 3, category_name: 'Work' },
          { category_id: 4, category_name: 'Business' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([
        { category_id: 1, category_name: 'Family' },
        { category_id: 2, category_name: 'Friends' },
        { category_id: 3, category_name: 'Work' },
        { category_id: 4, category_name: 'Business' }
      ]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /** --------------------------
   * EXPORT HANDLING (From Code 2 - Service based)
   ---------------------------*/
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFilters, setExportFilters] = useState({
    filename: '',
    search: '',
    category: '',
    hasBirthday: false
  });

  const openExportPanel = (format) => {
    setExportFormat(format);
    setShowExportPanel(true);
  };

  const closeExportPanel = () => {
    setShowExportPanel(false);
    setExportFilters({
      filename: '',
      search: '',
      category: '',
      hasBirthday: false
    });
  };

  const handleExport = async () => {
    try {
      const userId = currentUser?.id;
      if (!userId) {
        alert('User not found');
        return;
      }

      const filters = {
        ...exportFilters,
        hasBirthday: exportFilters.hasBirthday ? '1' : ''
      };

      let result;
      if (exportFormat === 'csv') {
        result = await exportContactsCSV(userId, filters);
      } else {
        result = await exportContactsVCF(userId, filters);
      }

      if (result.success) {
        closeExportPanel();
        alert(`${exportFormat.toUpperCase()} exported successfully!`);
      } else {
        alert(`Failed to export ${exportFormat.toUpperCase()}: ${result.error}`);
      }
    } catch (error) {
      alert(`Error exporting ${exportFormat.toUpperCase()}: ` + error.message);
    }
  };

  /** --------------------------
   * FORMAT HANDLING (Code 1 style UI)
   ---------------------------*/
  const [showFormatPanel, setShowFormatPanel] = useState(false);
  const [isFirstLast, setIsFirstLast] = useState(true);
  const [isDayMonthYear, setIsDayMonthYear] = useState(true);
  const [showNameToggle, setShowNameToggle] = useState(false);
  const [showDateToggle, setShowDateToggle] = useState(false);

  const toggleNameFormat = () => setIsFirstLast(!isFirstLast);
  const toggleDateFormat = () => setIsDayMonthYear(!isDayMonthYear);

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

            {/* Section 3: Export */}
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

        {/* Export Panel */}
        {showExportPanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="relative bg-white border border-slate-200 rounded-3xl w-[600px] h-[500px] shadow-xl p-6 flex flex-col dark:bg-[#161b22] dark:border-[#30363d]">
              <button
                className="absolute top-4 left-4 scale-100 hover:scale-110 transition-transform"
                onClick={closeExportPanel}
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
              <h3 className="text-lg font-semibold text-black dark:text-white text-center mt-4 mb-6">
                Export Contacts as {exportFormat.toUpperCase()}
              </h3>
              <div className="flex-1 px-4 space-y-4 overflow-y-auto">
                {/* Filename */}
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
                {/* Search */}
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
                {/* Category */}
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
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Birthday */}
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

              {/* Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
                <button
                  onClick={closeExportPanel}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
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

export default SettingsTab;
