import React, { useState } from 'react';
import { ArrowLeftIcon, UserCircleIcon, NoSymbolIcon } from '@heroicons/react/24/outline';

const AccountSettings = ({ onCancel }) => {
    
    return(
        <div>
            <div className="px-6 py-4">
              <button onClick={onCancel} >
                  <ArrowLeftIcon className="w-5 inline mb-6 text-slate-400 scale-100 hover:scale-105 hover:text-slate-800 dark:hover:text-slate-300 transform transition-tranform duration-200" />
              </button>
              <h2 className="text-slate-500 dark:text-gray-400 text-md font-semibold uppercase mb-2">Account Settings</h2>
              <div className="divide-y divide-slate-200 dark:divide-slate-500">
                <button className="w-full text-left py-5 px-2 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center">
                  <UserCircleIcon className="w-5 h-5 mr-3 inline" />
                    Account Details
                </button>
                <button className="w-full text-left py-5 px-2 rounded-lg text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-800 dark:hover:bg-opacity-20 flex items-center">
                  <NoSymbolIcon className="w-5 h-5 mr-3 inline" />
                    Clear All Data
                </button>
                <button className="w-full text-left py-5 px-2 rounded-lg text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-800 dark:hover:bg-opacity-20 flex items-center">
                  <NoSymbolIcon className="w-5 h-5 mr-3 inline" />
                    Permanently Delete Account
                </button>
              </div>
            </div>
        </div>
    )
}

export default AccountSettings;