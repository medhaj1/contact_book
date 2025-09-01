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
          setIsLoggedIn(false);
          setCurrentUser(null);
          navigate("/reset-password");
        } else if (event === "SIGNED_IN") {
          setIsLoggedIn(true);
          setCurrentUser(session?.user || null);
          navigate("/dashboard");
        } else if (event === "SIGNED_OUT") {
          setIsLoggedIn(false);
          setCurrentUser(null);
          navigate("/signin");
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
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        const toastId = toast.error("Error logging out. Please try again.", {
          autoClose: 1000,
        });
        setTimeout(() => toast.dismiss(toastId), 1000);
      } else {
        clearPersistenceData();
        setIsLoggedIn(false);
        setCurrentUser(null);
        const toastId = toast.success("Logged out successfully", {
          autoClose: 1000,
        });
        setTimeout(() => toast.dismiss(toastId), 1000);
      }
    } catch {
      const toastId = toast.error("Error logging out. Please try again.", {
        autoClose: 1000,
      });
      setTimeout(() => toast.dismiss(toastId), 1000);
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







