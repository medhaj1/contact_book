import { useState } from "react";

export default function AuthForm({ isLogin: initialIsLogin = true, onLogin, onBack, onSwitch }) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!isLogin) {
      if (!name) {
        setError("Full name is required.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      
      // For sign up, just show success message and switch to login
      alert("Account created successfully! You can now login with: john@example.com / password123 or jane@example.com / password123");
      setIsLogin(true);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      return;
    }

    // For login, use the dummy data
    if (onLogin) {
      onLogin(email, password);
    }

    // Reset form
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {onBack && (
          <button onClick={onBack} style={styles.backButton}>
            ← Back
          </button>
        )}
        
        <h2 style={styles.title}>{isLogin ? "Login" : "Sign Up"}</h2>
        
        {isLogin && (
          <div style={styles.demoInfo}>
            <p style={styles.demoText}>Demo Credentials:</p>
            <p style={styles.demoCredentials}>Email: john@example.com | Password: password123</p>
            <p style={styles.demoCredentials}>Email: jane@example.com | Password: password123</p>
          </div>
        )}

        <div style={styles.toggle}>
          <button
            onClick={() => {
              setIsLogin(true);
              if (onSwitch && !isLogin) onSwitch();
            }}
            style={{
              ...styles.toggleButton,
              ...(isLogin ? styles.activeToggle : styles.inactiveToggle),
            }}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              if (onSwitch && isLogin) onSwitch();
            }}
            style={{
              ...styles.toggleButton,
              ...(!isLogin ? styles.activeToggle : styles.inactiveToggle),
            }}
          >
            Sign Up
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.form}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="Full Name"
              onChange={handleChange}
              style={styles.input}
            />
          )}

          <input
            type="email"
            name="email"
            value={formData.email}
            placeholder="Email Address"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Password"
            onChange={handleChange}
            style={styles.input}
          />

          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              placeholder="Confirm Password"
              onChange={handleChange}
              style={styles.input}
            />
          )}

          <button type="button" onClick={handleSubmit} style={styles.submitBtn}>
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </div>

        <p style={styles.footer}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
              });
            }}
            style={styles.linkBtn}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    position: "fixed",       // Makes the container always fill the viewport
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "#e0f7ff",   // Light blue background
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    overflow: "hidden",     // Prevents scrolling
    padding: 0,             // Removes extra padding
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "48px 56px",
    boxShadow: "0 8px 40px rgba(0, 0, 0, 0.10)",
    width: "100%",
    maxWidth: "550px",  // wider for desktop
    minWidth: "410px",  // will not collapse
    textAlign: "center",
  },
  title: {
    color: "#1e40af",
    fontSize: "36px",
    fontWeight: "700",
    marginBottom: "36px",
  },
  toggle: {
    display: "flex",
    backgroundColor: "#dbeafe",
    borderRadius: "30px",
    padding: "5px",
    marginBottom: "36px",
  },
  toggleButton: {
    flex: 1,
    border: "none",
    padding: "16px 0",
    borderRadius: "25px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "17px",
  },
  activeToggle: {
    background: "linear-gradient(to right, #3b82f6, #38bdf8)",
    color: "#fff",
  },
  inactiveToggle: {
    backgroundColor: "transparent",
    color: "#1e3a8a",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginTop: "12px",
  },
  input: {
    padding: "16px 24px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "16px",
    backgroundColor: "#fff",
    outline: "none",
    fontFamily: "inherit",
    color: "#374151",
  },
  submitBtn: {
    background: "linear-gradient(to right, #3b82f6, #38bdf8)",
    border: "none",
    color: "#fff",
    padding: "16px 0",
    borderRadius: "25px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "17px",
    marginTop: "10px",
  },
  footer: {
    marginTop: "24px",
    fontSize: "16px",
    color: "#4b5563",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#1e40af",
    cursor: "pointer",
    fontWeight: "600",
    marginLeft: "4px",
    fontSize: "16px",
    textDecoration: "none",
  },
  error: {
    color: "#dc2626",
    marginBottom: "14px",
    fontSize: "15px",
    fontWeight: "500",
  },
  backButton: {
    background: "none",
    border: "none",
    color: "#1e40af",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
    padding: "8px 0",
    marginBottom: "20px",
    alignSelf: "flex-start",
  },
  demoInfo: {
    backgroundColor: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
  },
  demoText: {
    color: "#1e40af",
    fontWeight: "600",
    fontSize: "14px",
    margin: "0 0 8px 0",
  },
  demoCredentials: {
    color: "#374151",
    fontSize: "13px",
    margin: "4px 0",
    fontFamily: "monospace",
  },
};