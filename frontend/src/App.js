import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SignIn from './components/signin/SignIn';
import SignUp from './components/signup/SignUp';
import UserProfile from './pages/UserProfile';

const App = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);

  // Sample users for demo
  const users = [
    { user_id: 1, name: 'John Doe', email: 'john@example.com', password: 'password123' },
    { user_id: 2, name: 'Jane Smith', email: 'jane@example.com', password: 'password123' }
  ];

  const handleLogin = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setCurrentView('dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-indigo-400 to-purple-600">
      {currentView === 'landing' && (
        <LandingPage onGetStarted={() => setCurrentView('login')} />
      )}
      
      {currentView === 'login' && (
        <SignIn 
          toggleForm={() => setCurrentView('register')}
          onLogin={handleLogin}
          onBack={() => setCurrentView('landing')}
        />
      )}
      
      {currentView === 'register' && (
        <SignUp 
          toggleForm={() => setCurrentView('login')}
          onBack={() => setCurrentView('landing')}
        />
      )}
      
      {currentView === 'dashboard' && (
        <Dashboard 
          currentUser={currentUser}
          onLogout={handleLogout}
          onProfileClick={() => setCurrentView('profile')}
        />
      )}
      
      {currentView === 'profile' && (
        <UserProfile 
          currentUser={currentUser}
          onBack={() => setCurrentView('dashboard')}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default App;