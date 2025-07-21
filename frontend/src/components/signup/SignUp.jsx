import React, { useState } from 'react';

const SignUp = ({ toggleForm }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sign up data:', formData);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(to right, #cffafe, #ffffff)', // light cyan to white
      padding: '20px',
    },
    form: {
      backgroundColor: '#ffffff',
      padding: '40px',
      borderRadius: '20px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '460px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '24px',
      color: '#660099',
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      marginBottom: '14px',
      borderRadius: '10px',
      border: '1px solid #ccc',
      fontSize: '14px',
      outline: 'none',
    },
    button: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(to right, #a100f2, #ff4ecd)',
      color: '#fff',
      fontWeight: '600',
      border: 'none',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      fontSize: '16px',
      marginTop: '10px',
    },
    switchText: {
      marginTop: '18px',
      textAlign: 'center',
      fontSize: '14px',
    },
    switchLink: {
      color: '#6a0dad',
      fontWeight: 'bold',
      cursor: 'pointer',
      textDecoration: 'underline',
    },
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.title}>Create Account</div>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="text"
          name="contact"
          placeholder="Contact Number"
          value={formData.contact}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="text"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="text"
          name="password"
          placeholder="Create Password"
          value={formData.password}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="text"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Sign Up</button>
        <div style={styles.switchText}>
          Already have an account?{' '}
          <span style={styles.switchLink} onClick={toggleForm}>Sign In</span>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
