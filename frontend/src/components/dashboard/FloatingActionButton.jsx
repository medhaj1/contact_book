import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const FloatingActionButton = ({
  show = true,
  onAddContact,
  onImportContacts
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  if (!show) return null;

  return (
    <div className="fixed bottom-10 right-10 z-40">
      <div className="relative">
        <button
          onClick={() => setShowDropdown((prev) => !prev)}
          className="flex w-[70px] h-[70px] items-center px-5 py-3 rounded-full shadow-lg bg-gradient-to-r from-blue-700 to-blue-400 text-white font-bold hover:bg-blue-700 dark:from-indigo-800 dark:to-indigo-500 scale-100 hover:scale-110 transition-transform duration-200"
        >
          <Plus size={30}/>
        </button>
        {showDropdown && (
          <div className="absolute bottom-14 right-0 w-48 bg-white border rounded-lg shadow-lg">
            <div
              className="px-4 py-3 hover:bg-slate-100 cursor-pointer"
              onClick={() => {
                onAddContact();
                setShowDropdown(false);
              }}
            >
              Add via Form
            </div>
            <div
              className="px-4 py-3 hover:bg-slate-100 cursor-pointer"
              onClick={() => {
                onImportContacts();
                setShowDropdown(false);
              }}
            >
              Import Contacts
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingActionButton;
