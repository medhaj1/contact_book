import React, { useState } from 'react';
import { ArrowLeftIcon, UserCircleIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-toastify';

const AccountSettings = ({ onCancel }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [userDetails, setUserDetails] = useState(null);

    const handleAccountDetails = async () => {
        const { data: userData, error } = await supabase.auth.getUser();
        if (error || !userData || !userData.user) {
          toast.error('Failed to fetch user details.');
          return;
        }

        const user = userData.user;
        const userId = user.id;

        try {
            const [contactsRes, blockedRes, docsRes, tasksRes] = await Promise.all([
                supabase.from("contact").select("*", { count: "exact", head: true }).eq("user_id", userId),
                supabase.from("block_contacts").select("*", { count: "exact", head: true }).eq("u_id", userId),
                supabase.from("shared_documents").select("*", { count: "exact", head: true }).eq("user_id", userId),
                supabase.from("task").select("*", { count: "exact", head: true }).eq("user_id", userId),
            ]);

            setUserDetails({
                ...user,
                contactsCount: contactsRes.count || 0,
                blockedCount: blockedRes.count || 0,
                docsCount: docsRes.count || 0,
                tasksCount: tasksRes.count || 0,
                password: "********",
                authentic: true,
            });
            setShowDetails(true);
        } catch (err) {
            console.error("Error fetching account details:", err);
            alert("Something went wrong fetching your account details.");
        }
    };

    const handleClearAllData = async () => {
        const confirmClear = window.confirm('Are you sure you want to clear all your data? This action cannot be undone.');
        if (!confirmClear) return;

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData || !userData.user) {
          toast.error('Failed to identify user.');
            return;
        }
        const userId = userData.user.id;

        // Delete contacts
        const { error: contactsError } = await supabase.from('contact').delete().eq('user_id', userId);
        if (contactsError) {
          toast.error('Failed to clear contacts.');
            return;
        }

        // Delete blocked contacts
        const { error: blockedError } = await supabase.from('block_contacts').delete().eq('u_id', userId);
        if (blockedError) {
          toast.error('Failed to clear blocked contacts.');
            return;
        }

        // Remove user from received documents only (shared documents remain for others)
        const { error: receivedDocsError } = await supabase
          .from('shared_documents')
          .update({ receiver_id: null })
          .eq('receiver_id', userId);
        if (receivedDocsError) {
          alert('Failed to clear received documents.');
          return;
        }

        // Delete tasks
        const { error: tasksError } = await supabase.from('task').delete().eq('user_id', userId);
        if (tasksError) {
            alert('Failed to clear tasks.');
            return;
        }

        toast('All your data has been cleared.');
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm('⚠ WARNING: This will permanently delete your account and ALL of your data (contacts, blocked contacts, documents, and tasks). This action CANNOT be undone. Are you absolutely sure you want to continue?');
        if (!confirmDelete) return;

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData || !userData.user) {
          toast.error('Failed to identify user.');
            return;
        }
        const userId = userData.user.id;

        // Delete contacts
        const { error: contactsError } = await supabase.from('contact').delete().eq('user_id', userId);
        if (contactsError) {
          toast.error('Failed to delete contacts.');
            return;
        }

        // Delete blocked contacts
        const { error: blockedError } = await supabase.from('block_contacts').delete().eq('u_id', userId);
        if (blockedError) {
          toast.error('Failed to delete blocked contacts.');
            return;
        }

        // Remove user from documents
        const { error: sentDocsError } = await supabase
          .from('shared_documents')
          .update({ sender_id: null })
          .eq('sender_id', userId);
        if (sentDocsError) {
          alert('Failed to clear sent documents.');
          return;
        }

        const { error: receivedDocsError } = await supabase
          .from('shared_documents')
          .update({ receiver_id: null })
          .eq('receiver_id', userId);
        if (receivedDocsError) {
          alert('Failed to clear received documents.');
          return;
        }

        // Delete tasks
        const { error: tasksError } = await supabase.from('task').delete().eq('user_id', userId);
        if (tasksError) {
            alert('Failed to clear tasks.');
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
              toast.error('Failed to delete user account from authentication system.');
                return;
            }
        } catch (error) {
          toast.error('Failed to delete user account from authentication system.');
            return;
        }

        await supabase.auth.signOut();
        toast('Your account has been permanently deleted.');
    };

    return(
      <div className="w-full max-w-5xl bg-white dark:bg-[#161b22] rounded-xl min-h-[600px]">
        <div>
          <button onClick={onCancel} >
              <ArrowLeftIcon className="w-5 inline mb-6 text-slate-400 scale-100 hover:scale-105 hover:text-slate-800 dark:hover:text-slate-300 transform transition-tranform duration-200" />
          </button>
          <h2 className="ml-5 text-slate-500 dark:text-gray-400 text-md font-semibold uppercase mb-2">Account Settings</h2>
          <div className="px-8 py-3 divide-y divide-slate-200 dark:divide-slate-500">
            <button onClick={handleAccountDetails} className="w-full text-left py-5 px-2 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center">
              <UserCircleIcon className="w-5 h-5 mr-3 inline" />
                Account Details
            </button>
            {showDetails && userDetails && (
  <div className="rounded-lg bg-[#0d1117] dark:bg-[#0d1117] shadow-sm p-5 border border-[#30363d]">
    <h3 className="font-semibold mb-4 text-gray-200 text-lg">User Details</h3>
    <div className="space-y-3 text-sm text-gray-300">
      <p>
        <span className="font-medium text-gray-400">Email:</span> {userDetails.email}
        {userDetails.email_confirmed_at && (
          <span className="ml-2 text-green-500 font-semibold">✔ Verified</span>
        )}
      </p>
      <p><span className="font-medium text-gray-400">Authentic User:</span> {userDetails.authentic ? "Yes" : "No"}</p>
      <p><span className="font-medium text-gray-400">Contacts saved:</span> {userDetails.contactsCount}</p>
      <p>
        <span className="font-medium text-gray-400">Contacts blocked:</span> 
        <span className={`ml-1 font-semibold ${userDetails.blockedCount > 0 ? 'text-orange-400' : 'text-gray-300'}`}>
          {userDetails.blockedCount}
        </span>
        {userDetails.blockedCount > 0 && (
          <span className="ml-2 text-xs text-orange-500 bg-orange-900/30 px-2 py-0.5 rounded-full">
            Active blocks
          </span>
        )}
      </p>
      <p><span className="font-medium text-gray-400">Documents shared:</span> {userDetails.docsCount}</p>
      <p><span className="font-medium text-gray-400">Tasks:</span> {userDetails.tasksCount}</p>
      <p><span className="font-medium text-gray-400">Password:</span> {userDetails.password}</p>
    </div>
    <div className="mt-5 flex justify-end">
      <button
        onClick={() => setShowDetails(false)}
        className="px-4 py-2 rounded-md text-sm bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
      >
        Close
      </button>
    </div>
  </div>
)}
            <button onClick={handleClearAllData} className="w-full text-left py-5 px-2 rounded-lg text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-800 dark:hover:bg-opacity-20 flex items-center">
              <NoSymbolIcon className="w-5 h-5 mr-3 inline" />
                Clear All Data
            </button>
            <button onClick={handleDeleteAccount} className="w-full text-left py-5 px-2 rounded-lg text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-800 dark:hover:bg-opacity-20 flex items-center">
              <NoSymbolIcon className="w-5 h-5 mr-3 inline" />
                Permanently Delete Account
            </button>
          </div>
          
        </div>
      </div>
    )
}

export default AccountSettings;