import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import SignUp from "../components/signup/SignUp";
import SignIn from "../components/signin/SignIn";
import ResetPassword from "../components/signin/ResetPassword";
import Dashboard from "./Dashboard";
import LandingPage from "./LandingPage";
import UserProfile from "./UserProfile";
import SettingsPage from './SettingsPage';
import { supabase } from "../supabaseClient";
import { BlockedContactsProvider } from "../components/dashboard/BlockedContactsContext";
import { FormatProvider } from "../components/settings/FormatContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import ThemedToastContainer from "../components/ThemedToastContainer";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEventFix } from "../utils/eventFix";

const AuthListener = ({ setIsLoggedIn, setCurrentUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsLoggedIn(true);
        setCurrentUser(data.session.user);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          // Clear any toasts when transitioning auth state
          try { toast.dismiss(); /* eslint-disable-line no-empty */ } catch {}
          setIsLoggedIn(false);
          setCurrentUser(null);
          navigate("/reset-password");
        } else if (event === "SIGNED_IN") {
          try { toast.dismiss(); } catch {}
          setIsLoggedIn(true);
          setCurrentUser(session?.user || null);
          navigate("/dashboard");
        } else if (event === "SIGNED_OUT") {
          // Force-dismiss all active and queued toasts on logout
          try {
            toast.dismiss();
            if (typeof toast.clearWaitingQueue === 'function') {
              toast.clearWaitingQueue();
            }
          } catch {}
          setIsLoggedIn(false);
          setCurrentUser(null);
          navigate("/", { replace: true });
        }
      }
    );

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

  // Apply event fixes to prevent clicking issues
  useEventFix();

  useEffect(() => {
    if (isLoggedIn || currentUser === null) {
      setLoading(false);
    }
  }, [isLoggedIn, currentUser]);

  const clearPersistenceData = () => {
    const keysToRemove = [
      "dashboardSearchTerm",
      "dashboardSelectedCategory",
      "dashboardContactViewFilter",
      "dashboardViewMode",
      "dashboardShowAddContact",
      "dashboardEditingContact",
      "dashboardShowImportModal",
      "settingsActiveSubPage",
      "contactFormData",
      "taskPanelNewTask",
      "taskPanelDeadline",
      "categoriesPanelShowAddCategory",
      "categoryFormCategoryName",
      "userProfileIsEditing",
      "userProfileIsResettingPassword",
      "chatPanelSelectedContact",
      "chatPanelNewMessage",
    ];
    
    // Clear localStorage items
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });
    
    // Clear any Supabase auth tokens
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('sb-localhost-auth-token');
    
    // Clear session storage
    sessionStorage.clear();
  };

  const handleLogout = async () => {
    try {
  // Ensure no prior toasts distract during logout
  try { toast.dismiss(); } catch {}
      
      // Clear local data first
      clearPersistenceData();
      
      // Clear session storage
      sessionStorage.clear();
      
      // Update state immediately
      setIsLoggedIn(false);
      setCurrentUser(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast.error("Error logging out. Please try again.", {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Error logging out. Please try again.", {
        autoClose: 3000,
      });
    }
  };

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    const toastId = toast.success("Logged in successfully", { autoClose: 1000 });
    setTimeout(() => toast.dismiss(toastId), 1000);
  };

  if (loading) return null; // You can add a spinner here

  return (
    <ThemeProvider>
      <FormatProvider>
        <Router>
          <AuthListener setIsLoggedIn={setIsLoggedIn} setCurrentUser={setCurrentUser} />
          <ThemedToastContainer />
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
          <Route
            path="/settings"
            element={isLoggedIn ? <SettingsPage currentUser={currentUser} /> : <Navigate to="/signin" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </FormatProvider>
    </ThemeProvider>
  );
}

export default App;







