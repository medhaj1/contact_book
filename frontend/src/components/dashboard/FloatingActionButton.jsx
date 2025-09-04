import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useOutsideClick } from '../../hooks/useOutsideClick';

const FloatingActionButton = ({
  show = true,
  onAddContact,
  onImportContacts
}) => {
  const [showAddContactDropdown, setShowAddContactDropdown] = useState(false);
  const [hovered, setHovered] = useState(false);
  const addBtnRef = useRef(null);
  
  // Use outside click hook to close dropdown
  const dropdownRef = useOutsideClick(
    () => setShowAddContactDropdown(false),
    showAddContactDropdown
  );

  if (!show) return null;

  return (
    <div className="fixed bottom-[60px] right-[50px] z-40" ref={dropdownRef}>
      <div
        className="group relative"
        tabIndex={0}
        // Ensure focus for keyboard accessibility
        onBlur={e => {
          if (
            !e.currentTarget.contains(e.relatedTarget) &&
            showAddContactDropdown
          ) {
            setShowAddContactDropdown(false)
          }
        }}
      >
        <button
          ref={addBtnRef}
          type="button"
          onClick={() => setShowAddContactDropdown((prev) => !prev)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`flex items-center h-14 rounded-full bg-gradient-to-r from-blue-700 to-blue-400 dark:from-indigo-800 dark:to-indigo-500 text-white font-bold shadow-lg transition-all duration-300 overflow-hidden
    ${(showAddContactDropdown || hovered) ? "w-48 px-4 justify-start" : "w-14 justify-center"}
  `}
        >
          <Plus
            size={24}
            className={`transition-all duration-300 ${
              (showAddContactDropdown || hovered) ? "mr-3" : ""
            }`}
          />
          <span
            className={`whitespace-nowrap transition-all duration-300 ${
              (showAddContactDropdown || hovered) ? "opacity-100" : "opacity-0 w-0"
            }`}
          >
            Add Contact
          </span>
        </button>
        {showAddContactDropdown && (
          <div className="absolute bottom-full mb-2 w-48 bg-white dark:bg-[#161b22] dark:text-gray-300 border border-slate-200 dark:border-[#30363d] rounded-lg shadow-lg z-50">
            <div
              className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              onClick={() => {
                onAddContact();
                setShowAddContactDropdown(false);
                if (addBtnRef.current) addBtnRef.current.blur();
              }}
            >
              Add via Form
            </div>
            <div
              className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              onClick={() => {
                onImportContacts();
                setShowAddContactDropdown(false);
                if (addBtnRef.current) addBtnRef.current.blur();
              }}
            >
              Import Contacts
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FloatingActionButton;