import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import styles from './Auth.module.css';
import { loginUser } from '../api/authApi';
import { AppContext } from "../context/AppContext";

const Login = () => {
  const { login, isAuthenticated, user, loading: authLoading } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Auto-login effect
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;
    if (user.role === "admin") navigate("/admin");
    else navigate("/dashboard");
  }, [authLoading, isAuthenticated, user, navigate]);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    // Call login API without forcing admin
    const result = await loginUser({ email, password });

    if (result.role) {
      await login();

      if (result.role === "admin") navigate("/admin");       // admin dashboard
      else navigate("/dashboard");                             // user dashboard
    } else {
      setError(result.error || "Login failed");
    }
  } catch (err) {
    console.error(err);
    setError("Login failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={styles.pageContainer}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.authCard}
      >
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <LogIn size={32} className={styles.icon} />
          </div>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to manage your microgreens.</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
             
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.link}>
              Register here
            </Link>
          </p>
          <div className={styles.demoBox}>
            <p>Demo Admin: admin@gmail.com / Admin1234@</p>
            <p>Demo User: user@test.com / password123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
