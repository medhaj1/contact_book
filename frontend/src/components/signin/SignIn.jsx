import React from 'react';

const SignIn = ({ onSwitch }) => {
  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h2 style={styles.heading}>Sign In</h2>
        <input type="email" placeholder="Email" style={styles.input} />
        <input type="password" placeholder="Password" style={styles.input} />
        <button style={styles.button}>Sign In</button>
        <p style={styles.switchText}>
          Don’t have an account?{' '}
          <span style={styles.link} onClick={onSwitch}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: '#e3f2fd',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formBox: {
    background: '#fff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    width: '350px',
    textAlign: 'center',
  },
  heading: {
    marginBottom: '25px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#4B0082', // Indigo
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    outline: 'none',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(to right, #a100f2, #ff4ecd)', // new gradient
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
    color: '#444',
  },
  link: {
    color: '#4B0082',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default SignIn;