import React, { useState } from 'react';
import { User, LogOut, Download } from 'lucide-react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const HeaderSection = ({
  activeTab,
  currentUser,
  showUserDropdown,
  setDropdown,
  setShowUserDropdown,
  profileImageError,
  setProfileImageError,
  onNavigateToProfile,
  onLogout,
  // Export functionality props
  onExport
}) => {
  const userName = currentUser?.user_metadata?.name || currentUser?.email?.split("@")[0] || "User";
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  return (
    <div className="flex justify-between items-center mb-0">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-[#c9d1d9] capitalize">
        {activeTab}
      </h1>
      <div className="relative flex items-center gap-3">
        {/* Export Button - Only show on contacts page */}
        {activeTab === 'contacts' && onExport && (
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-800/50 text-sm font-medium transition-all duration-200 hover:shadow-sm"
            >
              <Download size={16} />
              Export
              <svg
                className={`w-4 h-4 transition-transform ${
                  showExportDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showExportDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#161b22] rounded-lg shadow-lg border border-slate-200 dark:border-[#30363d] py-1 z-50">
                <button
                  onClick={() => {
                    onExport('csv');
                    setShowExportDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-[#c9d1d9] hover:bg-blue-50 dark:hover:bg-indigo-900/30 hover:text-blue-700 dark:hover:text-indigo-300"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-3" />
                  Export as CSV
                </button>
                <button
                  onClick={() => {
                    onExport('vcf');
                    setShowExportDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-[#c9d1d9] hover:bg-blue-50 dark:hover:bg-indigo-900/30 hover:text-blue-700 dark:hover:text-indigo-300"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-3" />
                  Export as VCF
                </button>
              </div>
            )}
            {/* Click outside to close dropdown */}
            {showExportDropdown && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowExportDropdown(false)}
              />
            )}
          </div>
        )}
        
        <div
          className="flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-[#161b22] hover:shadow-sm transition-all duration-200"
          onClick={() => setShowUserDropdown(!showUserDropdown)}
        >
          <div className="w-9 h-9 bg-gradient-to-r from-blue-700 to-blue-400 dark:from-indigo-700 dark:to-indigo-400 rounded-full flex justify-center items-center text-white font-bold overflow-hidden">
            {currentUser?.user_metadata?.image && !profileImageError ? (
              <img
                src={currentUser.user_metadata.image}
                alt={userName}
                className="w-full h-full object-cover rounded-full"
                onError={() => setProfileImageError(true)}
              />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-sm text-slate-600 dark:text-[#c9d1d9] font-medium">
            {userName}
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${
              showUserDropdown ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {showUserDropdown && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#161b22] rounded-xl shadow-lg border border-slate-200 dark:border-[#30363d] py-1 z-50">
            <div
              className="flex items-center mx-1 px-4 py-2 text-sm rounded-lg text-slate-700 dark:text-[#c9d1d9] hover:text-blue-700 dark:hover:font-semibold dark:hover:text-indigo-200 hover:bg-blue-100 dark:hover:bg-indigo-500/30 cursor-pointer"
              onClick={() => {
                onNavigateToProfile();
                setShowUserDropdown(false);
              }}
            >
              <User size={16} className="mr-2 inline" /> Profile
            </div>
            <div
              className="flex items-center mx-1 px-4 py-2 text-sm rounded-lg text-slate-700 dark:text-[#c9d1d9] hover:text-blue-700 dark:hover:font-semibold dark:hover:text-red-200 hover:bg-blue-100 dark:hover:bg-red-700/30 cursor-pointer"
              onClick={onLogout}
            >
              <LogOut size={16} className="mr-2 inline" /> Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderSection;
