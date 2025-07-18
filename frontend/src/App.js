import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AuthForm from './components/auth/AuthForm';

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

  const containerStyle = {
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };
  
  const authContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '1rem',
  };

  return (
    <div style={containerStyle}>
      {currentView === 'landing' && (
        <LandingPage onGetStarted={() => setCurrentView('login')} />
      )}
      
      {currentView === 'login' && (
        <div style={authContainerStyle}>
          <AuthForm 
            isLogin={true} 
            onBack={() => setCurrentView('landing')}
            onLogin={handleLogin}
            onSwitch={() => setCurrentView('register')}
          />
        </div>
      )}
      
      {currentView === 'register' && (
        <div style={authContainerStyle}>
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
        />
      )}
    </div>
  );
};

export default App;