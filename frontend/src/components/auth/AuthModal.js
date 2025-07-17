// src/components/auth/AuthModal.js
import React from 'react';
import AuthForm from './AuthForm';

const AuthModal = ({ isLogin, onClose, onLogin, onSwitchToRegister, onSwitchToLogin }) => {
  const styles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '2rem',
      width: '90%',
      maxWidth: '400px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      textAlign: 'center',
      color: '#333',
    },
    inputGroup: {
      marginBottom: '1rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#555',
      fontWeight: '500',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #e1e5e9',
      borderRadius: '10px',
      fontSize: '1rem',
      transition: 'border-color 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box',
    },
    button: {
      width: '100%',
      padding: '0.75rem',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      marginBottom: '1rem',
    },
    linkButton: {
      background: 'none',
      border: 'none',
      color: '#667eea',
      textDecoration: 'underline',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
    demoInfo: {
      backgroundColor: '#f8f9fa',
      padding: '1rem',
      borderRadius: '10px',
      marginBottom: '1rem',
      fontSize: '0.9rem',
      color: '#666',
    },
    demoTitle: {
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#333',
    },
  };



  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {isLogin && (
          <div style={styles.demoInfo}>
            <div style={styles.demoTitle}>Demo Login:</div>
            <div>Email: john@example.com</div>
            <div>Password: password123</div>
          </div>
        )}

        <AuthForm 
          isLogin={isLogin} 
          onLogin={onLogin} 
          onBack={onClose} 
          onSwitch={isLogin ? onSwitchToRegister : onSwitchToLogin} 
        />

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button type="button" style={styles.linkButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
