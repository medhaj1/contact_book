import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNewPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      alert('Error resetting password: ' + error.message);
    } else {
      alert('Password has been reset!');
      // Optionally redirect to login
      window.location.href = '/signin';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-200 to-white">
      <form onSubmit={handleNewPassword} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/a-vibrant-logo-for-a-contact-management-web-app--m (1).ico" 
            alt="ContactBook+ Logo" 
            className="h-16 w-16 object-contain mb-4"
          />
          <h2 className="text-3xl font-bold text-blue-900">Reset Password</h2>
        </div>
        
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded-xl shadow focus:shadow-md hover:shadow-md scale-100 focus:scale-105 transition-all duration-200"
          required
        />
        <button
          type="submit"
          className="w-full text-lg font-bold bg-gradient-to-r from-blue-700 to-blue-400 text-white py-3 rounded-xl shadow scale-100 hover:scale-105 hover:shadow-lg hover:from-blue-800 hover:to-blue-500 transition-all duration-200"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;