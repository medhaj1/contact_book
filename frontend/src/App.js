import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AuthForm from './components/auth/AuthForm';
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
        <div className="flex justify-center items-center min-h-screen p-4">
          <AuthForm 
            isLogin={true} 
            onBack={() => setCurrentView('landing')}
            onLogin={handleLogin}
            onSwitch={() => setCurrentView('register')}
          />
        </div>
      )}
      
      {currentView === 'register' && (
        <div className="flex justify-center items-center min-h-screen p-4">
          <AuthForm 
            isLogin={false} 
            onBack={() => setCurrentView('landing')}
            onLogin={handleLogin}
            onSwitch={() => setCurrentView('login')}
          />
        </div>
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