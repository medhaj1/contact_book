import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const BlockedContacts =({onCancel})=>{

    return(
        <div>
          <div className="px-6 py-4">
              <button onClick={onCancel}>
                <ArrowLeftIcon className="w-5 inline mb-6 text-slate-400 scale-100 hover:scale-105 hover:text-slate-800 dark:hover:text-slate-300 transform transition-tranform duration-200" />
              </button>
              <h2 className="text-slate-500 dark:text-gray-400 text-md font-semibold uppercase mb-2">Blocked Contacts</h2>
              <div className="ml-1 text-slate-700 dark:text-white py-4">
                No blocked contacts.
              </div>
          </div>
        </div>
    )
}

export default BlockedContacts;