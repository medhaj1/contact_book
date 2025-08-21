import React, { useState } from 'react';
import { ArrowLeftIcon, UserCircleIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../supabaseClient';

const AccountSettings = ({ onCancel }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [userDetails, setUserDetails] = useState(null);

    const handleAccountDetails = async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            alert('Failed to fetch user details.');
            return;
        }
        if (data && data.user) {
            setUserDetails(data.user);
            setShowDetails(true);
        }
    };

    const handleClearAllData = async () => {
        const confirmClear = window.confirm('Are you sure you want to clear all your data? This action cannot be undone.');
        if (!confirmClear) return;

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData || !userData.user) {
            alert('Failed to identify user.');
            return;
        }
        const userId = userData.user.id;

        // Delete contacts
        const { error: contactsError } = await supabase.from('contacts').delete().eq('user_id', userId);
        if (contactsError) {
            alert('Failed to clear contacts.');
            return;
        }

        // Delete blocked_contacts
        const { error: blockedError } = await supabase.from('blocked_contacts').delete().eq('user_id', userId);
        if (blockedError) {
            alert('Failed to clear blocked contacts.');
            return;
        }

        alert('All your data has been cleared.');
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.');
        if (!confirmDelete) return;

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData || !userData.user) {
            alert('Failed to identify user.');
            return;
        }
        const userId = userData.user.id;

        // Delete contacts
        const { error: contactsError } = await supabase.from('contacts').delete().eq('user_id', userId);
        if (contactsError) {
            alert('Failed to delete contacts.');
            return;
        }

        // Delete blocked_contacts
        const { error: blockedError } = await supabase.from('blocked_contacts').delete().eq('user_id', userId);
        if (blockedError) {
            alert('Failed to delete blocked contacts.');
            return;
        }

        // Call placeholder API endpoint to delete user auth
        try {
            const response = await fetch('/api/deleteUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            if (!response.ok) {
                alert('Failed to delete user account from authentication system.');
                return;
            }
        } catch (error) {
            alert('Failed to delete user account from authentication system.');
            return;
        }

        await supabase.auth.signOut();
        alert('Your account has been permanently deleted.');
    };

    return(
        <div>
            <div className="px-6 py-4">
              <button onClick={onCancel} >
                  <ArrowLeftIcon className="w-5 inline mb-6 text-slate-400 scale-100 hover:scale-105 hover:text-slate-800 dark:hover:text-slate-300 transform transition-tranform duration-200" />
              </button>
              <h2 className="text-slate-500 dark:text-gray-400 text-md font-semibold uppercase mb-2">Account Settings</h2>
              <div className="divide-y divide-slate-200 dark:divide-slate-500">
                <button onClick={handleAccountDetails} className="w-full text-left py-5 px-2 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center">
                  <UserCircleIcon className="w-5 h-5 mr-3 inline" />
                    Account Details
                </button>
                <button onClick={handleClearAllData} className="w-full text-left py-5 px-2 rounded-lg text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-800 dark:hover:bg-opacity-20 flex items-center">
                  <NoSymbolIcon className="w-5 h-5 mr-3 inline" />
                    Clear All Data
                </button>
                <button onClick={handleDeleteAccount} className="w-full text-left py-5 px-2 rounded-lg text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-800 dark:hover:bg-opacity-20 flex items-center">
                  <NoSymbolIcon className="w-5 h-5 mr-3 inline" />
                    Permanently Delete Account
                </button>
              </div>
              {showDetails && userDetails && (
                <div className="mt-6 p-4 border rounded bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-gray-300">
                  <h3 className="font-semibold mb-2">User Details</h3>
                  <p><strong>Email:</strong> {userDetails.email}</p>
                  {userDetails.user_metadata && Object.keys(userDetails.user_metadata).length > 0 && (
                    <div className="mt-2">
                      <strong>Metadata:</strong>
                      <ul className="list-disc list-inside">
                        {Object.entries(userDetails.user_metadata).map(([key, value]) => (
                          <li key={key}>{key}: {String(value)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button onClick={() => setShowDetails(false)} className="mt-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
                </div>
              )}
            </div>
        </div>
    )
}

export default AccountSettings;