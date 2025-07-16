// src/components/AuthModal.jsx
import React, { useState } from 'react';

const AuthModal = ({ isLogin, onClose, onLogin, onSwitchToRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(formData.email, formData.password);
    } else {
      alert('Registration successful! Please login.');
      onSwitchToLogin();
    }
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = '#667eea';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = '#e1e5e9';
  };

  const handleButtonHover = (e) => {
    e.target.style.backgroundColor = '#5a67d8';
  };

  const handleButtonLeave = (e) => {
    e.target.style.backgroundColor = '#667eea';
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

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                style={styles.input}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
              />
            </div>
          )}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              style={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              style={styles.input}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required
            />
          </div>
          <button 
            type="submit" 
            style={styles.button}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>

          <div style={{ textAlign: 'center' }}>
            {isLogin ? (
              <>
                <span>Don't have an account? </span>
                <button type="button" style={styles.linkButton} onClick={onSwitchToRegister}>
                  Register
                </button>
              </>
            ) : (
              <>
                <span>Already have an account? </span>
                <button type="button" style={styles.linkButton} onClick={onSwitchToLogin}>
                  Login
                </button>
              </>
            )}
          </div>
        </form>

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
