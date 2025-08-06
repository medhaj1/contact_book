import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient';

function SettingsTab({ currentUser }) {

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

  // Fetch categories from Supabase
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('category')
        .select('*')
        .order('category_id', { ascending: true });
      if (error) {
        console.error('Error fetching categories:', error.message);
        // Set default categories if fetch fails
        setCategories([
          { category_id: 1, name: 'Family' },
          { category_id: 2, name: 'Friends' },
          { category_id: 3, name: 'Work' },
          { category_id: 4, name: 'Business' }
        ]);
      } else {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set default categories if fetch fails
      setCategories([
        { category_id: 1, name: 'Family' },
        { category_id: 2, name: 'Friends' },
        { category_id: 3, name: 'Work' },
        { category_id: 4, name: 'Business' }
      ]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  const[showThemePanel, setShowThemePanel] = useState(false);
  const[showExportPanel, setShowExportPanel] = useState(false);
  const[exportFormat, setExportFormat] = useState('csv'); // 'csv' or 'vcf'
  const[exportFilters, setExportFilters] = useState({
    filename: '',
    search: '',
    category: '',
    hasBirthday: false
  });
  const[categories, setCategories] = useState([]);
  const handlethemeToggle=()=> {
    setShowThemePanel(true)
  }
  const closeThemePanel=()=> {
    setShowThemePanel(false)
  }
  const openExportPanel = (format) => {
    setExportFormat(format);
    setShowExportPanel(true);
  }
  const closeExportPanel = () => {
    setShowExportPanel(false);
    setExportFilters({
      filename: '',
      search: '',
      category: '',
      hasBirthday: false
    });
  }
  const handleNameformat=()=> {}
  const handleAccountSettings=()=> {}
  const handleBlockedContacts=()=> {}

  // Export functions
  const handleExport = async () => {
    try {
      const userId = currentUser?.id;
      if (!userId) {
        alert('User not found');
        return;
      }
      
      // Build query parameters
      const params = new URLSearchParams();
      if (exportFilters.filename.trim()) {
        params.append('filename', exportFilters.filename.trim());
      }
      if (exportFilters.search.trim()) {
        params.append('search', exportFilters.search.trim());
      }
      if (exportFilters.category) {
        params.append('category', exportFilters.category);
      }
      if (exportFilters.hasBirthday) {
        params.append('hasBirthday', '1');
      }

      const queryString = params.toString();
      const url = `http://localhost:5000/contacts/export/${exportFormat}/${userId}${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        
        // Use custom filename or default
        const defaultFilename = `contacts_${userId}_${new Date().toISOString().slice(0,10)}.${exportFormat}`;
        a.download = exportFilters.filename.trim() || defaultFilename;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        
        closeExportPanel();
        alert(`${exportFormat.toUpperCase()} exported successfully!`);
      } else {
        const errorText = await response.text();
        alert(`Failed to export ${exportFormat.toUpperCase()}: ${errorText}`);
      }
    } catch (error) {
      alert(`Error exporting ${exportFormat.toUpperCase()}: ` + error.message);
    }
  };

  const handleExportCSV = async () => {
    try {
      const userId = currentUser?.id;
      if (!userId) {
        alert('User not found');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/contacts/export/csv/${userId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contacts_${userId}_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export CSV');
      }
    } catch (error) {
      alert('Error exporting CSV: ' + error.message);
    }
  };

  const handleExportVCF = async () => {
    try {
      const userId = currentUser?.id;
      if (!userId) {
        alert('User not found');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/contacts/export/vcf/${userId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contacts_${userId}_${new Date().toISOString().slice(0,10)}.vcf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export VCF');
      }
    } catch (error) {
      alert('Error exporting VCF: ' + error.message);
    }
  };


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
      <div className="px-6 py-4 border-b border-slate-200">
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

      {/* Section 3: Export */}
      <div className="px-6 py-4">
        <h2 className="text-gray-500 dark:text-gray-400 text-md font-semibold uppercase mb-2">Export</h2>

        <div className="divide-y divide-slate-200">
          <button 
            className="w-full text-left py-5 px-2 rounded-lg text-slate-700 dark:text-white hover:bg-blue-50 dark:hover:bg-slate-600 flex items-center"
            onClick={() => openExportPanel('csv')}
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-3" />
            Export as CSV
          </button>
          <button 
            className="w-full text-left py-5 px-2 rounded-lg text-slate-700 dark:text-white hover:bg-blue-50 dark:hover:bg-slate-600 flex items-center"
            onClick={() => openExportPanel('vcf')}
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-3" />
            Export as VCF
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

      {/* Export Panel */}
      {showExportPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="relative bg-white border-[10px] border-slate-200 rounded-3xl w-[600px] h-[500px] shadow-xl p-6 flex flex-col dark:bg-slate-700 dark:border-slate-800">

            {/* Back Arrow - absolute top-left inside the panel */}
            <button
              className="absolute top-4 left-4 scale-100 hover:scale-110 transition-transform"
              onClick={closeExportPanel}
            >
              <ArrowLeftIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" />
            </button>

            {/* Centered Heading */}
            <h3 className="text-lg font-semibold text-black dark:text-white text-center mt-4 mb-6">
              Export Contacts as {exportFormat.toUpperCase()}
            </h3>

            {/* Export Form */}
            <div className="flex-1 px-4 space-y-4 overflow-y-auto">
              {/* Filename */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Custom Filename (optional)
                </label>
                <input
                  type="text"
                  placeholder={`contacts_${new Date().toISOString().slice(0,10)}.${exportFormat}`}
                  value={exportFilters.filename}
                  onChange={(e) => setExportFilters({...exportFilters, filename: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-500 rounded-lg text-slate-700 dark:text-white dark:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Search Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Search Filter (name, email, or phone)
                </label>
                <input
                  type="text"
                  placeholder="Enter search term..."
                  value={exportFilters.search}
                  onChange={(e) => setExportFilters({...exportFilters, search: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-500 rounded-lg text-slate-700 dark:text-white dark:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category Filter
                </label>
                <select
                  value={exportFilters.category}
                  onChange={(e) => setExportFilters({...exportFilters, category: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-500 rounded-lg text-slate-700 dark:text-white dark:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Birthday Filter */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasBirthday"
                  checked={exportFilters.hasBirthday}
                  onChange={(e) => setExportFilters({...exportFilters, hasBirthday: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="hasBirthday" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                  Only contacts with birthdays
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
              <button
                onClick={closeExportPanel}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export {exportFormat.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SettingsTab;
