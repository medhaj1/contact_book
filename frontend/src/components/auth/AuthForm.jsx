import { useState } from "react";

export default function AuthForm({ isLogin, onBack, onLogin, onSwitch }) {
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

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (isLogin) {
      onLogin(email, password);
    } else {
      alert("Registered successfully!");
      onSwitch(); // switch to login view
    }
  };

  return (
    <div style={styles.container}>
      <h2>{isLogin ? "Login" : "Register"}</h2>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {!isLogin && (
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        )}

        <button type="submit" style={styles.button}>
          {isLogin ? "Login" : "Register"}
        </button>
      </form>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={onBack} style={styles.link}>
          ← Back
        </button>
        <button onClick={onSwitch} style={{ ...styles.link, marginLeft: "1rem" }}>
          {isLogin ? "Need to Register?" : "Already have an account?"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    maxWidth: "400px",
    margin: "2rem auto",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  button: {
    padding: "0.6rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  link: {
    background: "none",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    textDecoration: "underline",
  },
  error: {
    color: "red",
    marginBottom: "1rem",
  },
};



