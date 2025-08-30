import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const ChangePassword = () => {
  const [passwords, setPasswords] = useState({ new: '', confirmNew: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (passwords.new !== passwords.confirmNew) {
      setError("Passwords don't match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password updated successfully.');
      setPasswords({ new: '', confirmNew: '' });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h3 className="text-xl font-semibold mb-4">Change Password</h3>
      <form onSubmit={handleChangePassword}>
        <input
          type="password"
          name="new"
          placeholder="New password"
          value={passwords.new}
          onChange={handleInputChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="password"
          name="confirmNew"
          placeholder="Confirm new password"
          value={passwords.confirmNew}
          onChange={handleInputChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
        >
          Update Password
        </button>
        {message && <p className="mt-3 text-green-600">{message}</p>}
        {error && <p className="mt-3 text-red-600">{error}</p>}
      </form>
    </div>
  );
};

export default ChangePassword;
