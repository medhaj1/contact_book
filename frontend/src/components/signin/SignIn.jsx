import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';  


const SignIn = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false); // Toggles forgot-password form
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  // Check active session -> redirect
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate('/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  // Normal login handler
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message, {
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.success('Login successful!', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      if (onLogin) onLogin(data.user);
      navigate('/dashboard');
    }
  };

  // Forgot password handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address to reset password.', {
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message, {
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.success('Password reset email sent! Check your inbox.', {
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setShowForgot(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.', {
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-white flex items-center justify-center relative">
      <form
        onSubmit={showForgot ? handleForgotPassword : handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center"
      >
        {/* Back to home */}
        <button
          type="button"
          className="top-4 left-4 flex scale-100 hover:scale-110 transition transition-transform items-center"
          onClick={() => navigate('/')}
        >
          <ArrowLeftIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" />
        </button>

        <h2 className="text-3xl font-bold mb-6 text-blue-900">
          {showForgot ? 'Reset Password' : 'Sign In'}
        </h2>

        {!showForgot ? (
          <>
            {/* Login form */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 border rounded-xl shadow focus:shadow-md hover:shadow-md scale-100 focus:scale-105 transition-all duration-200"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-4 border rounded-xl shadow focus:shadow-md hover:shadow-md scale-100 focus:scale-105 transition-all duration-200"
            />

            <button
              type="submit"
              className="w-full text-lg font-bold bg-gradient-to-r from-blue-700 to-blue-400 text-white py-3 rounded-xl shadow scale-100 hover:scale-105 hover:shadow-lg hover:from-blue-800 hover:to-blue-500 transition-all duration-200"
            >
              Sign In
            </button>

            {/* Forgot Password link */}
            <p className="mt-3 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
              onClick={() => setShowForgot(true)}
            >
              Forgot password?
            </p>

            <p className="mt-4 text-sm">
              Don’t have an account?
              <Link to="/signup" className="text-blue-600 font-semibold ml-1 hover:underline hover:text-blue-800">
                Sign Up
              </Link>
            </p>
          </>
        ) : (
          <>
            {/* Forgot password form */}
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full p-3 mb-4 border rounded-xl shadow focus:shadow-md hover:shadow-md scale-100 focus:scale-105 transition-all duration-200"
            />
            <button
              type="submit"
              className="w-full text-lg font-bold bg-gradient-to-r from-blue-700 to-blue-400 text-white py-3 rounded-xl shadow scale-100 hover:scale-105 hover:shadow-lg hover:from-blue-800 hover:to-blue-500 transition-all duration-200"
            >
              Send Reset Link
            </button>

            <p 
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
              onClick={() => setShowForgot(false)}
            >
              Back to Sign In
            </p>
          </>
        )}
      </form>
    </div>
  );
};

export default SignIn;
