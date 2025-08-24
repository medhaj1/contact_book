import React from 'react';
import { ArrowLeftIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import { useBlockedContacts } from '../dashboard/BlockedContactsContext';

const BlockedContacts = ({ onCancel }) => {
  const { blockedContacts, unblock } = useBlockedContacts();

  const handleUnblock = async (contact_id, contactName) => {
    if (window.confirm(`Are you sure you want to unblock ${contactName}?`)) {
      const result = await unblock(contact_id);
      if (result.success) {
        alert(`${contactName} has been unblocked.`);
      } else {
        alert(`Failed to unblock ${contactName}: ${result.error}`);
      }
    }
  };

  return (
    <div className='w-full h-[500px]'>
      <div className="">
        <button onClick={onCancel}>
          <ArrowLeftIcon className="w-5 inline mb-6 text-slate-400 scale-100 hover:scale-105 hover:text-slate-800 dark:hover:text-slate-300 transform transition-tranform duration-200" />
        </button>
        <h2 className="ml-8 text-slate-500 dark:text-gray-400 text-md font-semibold uppercase mb-5">
          Blocked Contacts
        </h2>
        {blockedContacts.length === 0 ? (
          <h3 className='ml-10 text-gray-600 dark:text-gray-400'>No blocked contacts</h3>
        ) : (
          <ul className='space-y-2 rounded-lg'>
            {blockedContacts.map(contact => (
              <li key={contact.contact_id} className="flex p-3 font-semibold shadow shadow-md bg-gray-50 dark:text-gray-300 dark:bg-gray-800/70 rounded-lg justify-between items-center">
                <div>
                  <div className="font-semibold">{contact.name}</div>
                  {contact.email && <div className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</div>}
                </div>
                <button
                  onClick={() => handleUnblock(contact.contact_id, contact.name)}
                  className="flex w-auto px-2 py-1 rounded-lg text-sm dark:bg-green-800/60 bg-green-100 text-green-500 dark:text-green-200 hover:bg-green-200 hover:text-green-600 dark:hover:bg-green-700/60 dark:hover:text-green-100 transition-colors duration-200"
                >
                  <NoSymbolIcon className="h-5 w-5 mr-1"/> Unblock
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BlockedContacts;