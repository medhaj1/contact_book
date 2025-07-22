import React, { useState } from 'react';

const SignIn = ({ toggleForm, onLogin, onBack }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) {
      onLogin(credentials.email, credentials.password);
    }
  };

  const styles = {
    container: {
      height: '100vh',
      background: 'linear-gradient(to right, #cffafe, #ffffff)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    formBox: {
      background: '#fff',
      padding: '50px 40px',
      borderRadius: '15px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '400px',
      textAlign: 'center',
    },
    heading: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '30px',
      color: '#660099',
    },
    input: {
      width: '100%',
      padding: '12px',
      margin: '10px 0',
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: '14px',
      boxSizing: 'border-box',
    },
    button: {
      width: '100%',
      padding: '12px',
      background: 'linear-gradient(to right, #a100f2, #ff4ecd)',
      color: '#fff',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '10px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
      cursor: 'pointer',
      marginTop: '10px',
    },
    switchText: {
      marginTop: '20px',
      fontSize: '14px',
    },
    link: {
      color: '#7b00ff',
      fontWeight: 'bold',
      marginLeft: '5px',
      cursor: 'pointer',
    },
    backButton: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      padding: '10px 15px',
      background: '#f0f0f0',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    }
  };

  return (
    <div style={styles.container}>
      {onBack && (
        <button style={styles.backButton} onClick={onBack}>
          Back
        </button>
      )}
      <div style={styles.formBox}>
        <h2 style={styles.heading}>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            name="email"
            placeholder="Email" 
            style={styles.input}
            value={credentials.email}
            onChange={handleChange} 
            required
          />
          <input 
            type="password"
            name="password" 
            placeholder="Password" 
            style={styles.input}
            value={credentials.password}
            onChange={handleChange}
            required
          />
          <button type="submit" style={styles.button}>Sign In</button>
        </form>
        <p style={styles.switchText}>
          Don't have an account?
          <span style={styles.link} onClick={toggleForm}> Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
