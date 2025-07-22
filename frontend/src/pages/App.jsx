// src/pages/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import SignUp from '../components/signup/SignUp';
import SignIn from '../components/signin/SignIn';
import Dashboard from './Dashboard';
import LandingPage from './LandingPage';

import { supabase } from '../supabaseClient';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ Loading state to wait for auth

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsLoggedIn(true);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null; // ⏳ Don’t render anything until session check

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/signin" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
