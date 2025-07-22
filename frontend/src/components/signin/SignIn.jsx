import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const SignIn = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate('/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Login successful!');
      if (onLogin) onLogin(data.user);
      navigate('/dashboard');
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
      textDecoration: 'none',
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
      <button 
        style={styles.backButton} 
        onClick={() => navigate('/')}
      >
        Back
      </button>
      <div style={styles.formBox}>
        <h2 style={styles.heading}>Sign In</h2>
        <input
          type="email"
          placeholder="Email"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button style={styles.button} onClick={handleSubmit}>Sign In</button>

        <p style={styles.switchText}>
          Don’t have an account?
          <Link to="/signup" style={styles.link}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
