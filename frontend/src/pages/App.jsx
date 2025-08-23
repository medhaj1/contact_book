import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import SignUp from '../components/signup/SignUp';
import SignIn from '../components/signin/SignIn';
import ResetPassword from '../components/signin/ResetPassword';
import Dashboard from './Dashboard';
import LandingPage from './LandingPage';
import UserProfile from './UserProfile';

import { supabase } from '../supabaseClient';

import { BlockedContactsProvider } from '../components/dashboard/BlockedContactsContext';

const AuthListener = ({ setIsLoggedIn, setCurrentUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsLoggedIn(true);
        setCurrentUser(data.session.user);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsLoggedIn(false);
        setCurrentUser(null);
        navigate('/reset-password');
      } else if (event === 'SIGNED_IN') {
        setIsLoggedIn(true);
        setCurrentUser(session?.user || null);
        navigate('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setCurrentUser(null);
        navigate('/signin');
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate, setIsLoggedIn, setCurrentUser]);

  return null; // Does not render anything
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Mark loading false after initial session check inside AuthListener
  useEffect(() => {
    // Wait until isLoggedIn or currentUser is set to stop loading
    if (isLoggedIn || currentUser === null) {
      setLoading(false);
    }
  }, [isLoggedIn, currentUser]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        alert('Error logging out. Please try again.');
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    } catch {
      alert('Error logging out. Please try again.');
    }
  };

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
  };

  if (loading) return null; // or add loading spinner

  return (
    <Router>
      <AuthListener setIsLoggedIn={setIsLoggedIn} setCurrentUser={setCurrentUser} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <BlockedContactsProvider currentUser={currentUser}>
                <Dashboard currentUser={currentUser} onLogout={handleLogout} />
              </BlockedContactsProvider>
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isLoggedIn ? (
              <UserProfile currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;



