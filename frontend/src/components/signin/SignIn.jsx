import React from 'react';

const SignIn = ({ toggleForm }) => {
  const styles = {
    container: {
      height: '100vh',
      background: 'linear-gradient(to right, #cffafe, #ffffff)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    formBox: {
      background: '#fff',
      padding: '50px 40px', // increased padding for better spacing
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
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h2 style={styles.heading}>Sign In</h2>
        <input type="email" placeholder="Email" style={styles.input} />
        <input type="password" placeholder="Password" style={styles.input} />
        <button style={styles.button}>Sign In</button>
        <p style={styles.switchText}>
          Don’t have an account?
          <span style={styles.link} onClick={toggleForm}> Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;

