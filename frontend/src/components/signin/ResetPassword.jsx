import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      alert('Please enter and confirm your new password.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        alert(error.message);
      } else {
        alert('Password updated successfully! Please sign in.');
        navigate('/signin');
      }
    } catch (err) {
      console.error('Reset error:', err);
      alert('Something went wrong, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-white flex items-center justify-center">
      <form
        onSubmit={handleReset}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center"
      >
        <h2 className="text-3xl font-bold mb-6 text-blue-900">Reset Password</h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded-xl shadow focus:shadow-md hover:shadow-md scale-100 focus:scale-105 transition-all duration-200"
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded-xl shadow focus:shadow-md hover:shadow-md scale-100 focus:scale-105 transition-all duration-200"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-lg font-bold text-white py-3 rounded-xl shadow 
            ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-700 to-blue-400 hover:scale-105 hover:shadow-lg hover:from-blue-800 hover:to-blue-500'
            } scale-100 transition-all duration-200`}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
