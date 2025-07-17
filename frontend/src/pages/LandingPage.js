import React from 'react';

const LandingPage = ({ onGetStarted }) => {
  const styles = {
    landingPage: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(to right, #e0f7fa, #ffffff)', // light blue to white
    },
    hero: {
      textAlign: 'center',
      maxWidth: '700px',
      color: '#2c3e50',
    },
    heroTitle: {
      fontSize: '3.5rem',
      fontWeight: '800',
      marginBottom: '1.5rem',
      color: '#0d47a1',
    },
    heroSubtitle: {
      fontSize: '1.25rem',
      marginBottom: '2rem',
      color: '#37474f',
    },
    ctaButton: {
      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
      color: 'white',
      border: 'none',
      padding: '1rem 2rem',
      fontSize: '1.1rem',
      borderRadius: '50px',
      cursor: 'pointer',
      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)',
      transition: 'all 0.3s ease',
      transform: 'translateY(0)',
    },
    features: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
      marginTop: '3rem',
      maxWidth: '800px',
    },
    featureCard: {
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: '1.5rem',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      border: '1px solid #e3f2fd',
    },
    featureIcon: {
      fontSize: '2.5rem',
      marginBottom: '1rem',
    },
    featureTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#1565c0',
    },
    featureDesc: {
      fontSize: '0.95rem',
      color: '#555',
    },
  };

  return (
    <div style={styles.landingPage}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Contact Book</h1>
        <p style={styles.heroSubtitle}>
          Organize your contacts beautifully. Connect with people that matter.
        </p>
        <button 
          style={styles.ctaButton}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 12px 35px rgba(25,118,210,0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 6px 20px rgba(25,118,210,0.3)';
          }}
          onClick={onGetStarted}
        >
          Get Started
        </button>

        <div style={styles.features}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📱</div>
            <h3 style={styles.featureTitle}>Easy Management</h3>
            <p style={styles.featureDesc}>
              Add, edit, and organize your contacts with intuitive interface
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🔍</div>
            <h3 style={styles.featureTitle}>Smart Search</h3>
            <p style={styles.featureDesc}>
              Find contacts instantly with powerful search and filtering
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📊</div>
            <h3 style={styles.featureTitle}>Categories</h3>
            <p style={styles.featureDesc}>
              Organize contacts into custom categories for better management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
