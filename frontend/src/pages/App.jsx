// src/pages/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import SignUp from '../components/signup/SignUp';
import SignIn from '../components/signin/SignIn';
import Dashboard from './Dashboard';
import LandingPage from './LandingPage';
import UserProfile from './UserProfile';
import SettingsPage from './SettingsPage';

import { supabase } from '../supabaseClient';
import { BlockedContactsProvider } from '../components/dashboard/BlockedContactsContext';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsLoggedIn(true);
        setCurrentUser(data.session.user);
      }
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setCurrentUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Logout error:', err);
      alert('Error logging out. Please try again.');
    }
  };

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
  };

  if (loading) return null; // ⏳ Don’t render anything until session check

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/dashboard"
          element={isLoggedIn ? (
            <BlockedContactsProvider currentUser={currentUser}>
              <Dashboard currentUser={currentUser} onLogout={handleLogout} />
            </BlockedContactsProvider>
          ) : <Navigate to="/signin" />}
        />
        <Route
          path="/profile"
          element={isLoggedIn ? <UserProfile currentUser={currentUser} onLogout={handleLogout} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/settings"
          element={isLoggedIn ? <SettingsPage currentUser={currentUser} /> : <Navigate to="/signin" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
export default App;
