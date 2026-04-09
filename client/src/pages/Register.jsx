import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import styles from './Auth.module.css';
import { registerUser } from '../api/authApi';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (email) => {
    // Indian email format: anything@domain.com or .in
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    // 10 digit Indian mobile number
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phone);
  };

  const validatePassword = (password) => {
    // Minimum 8 chars, at least one uppercase, one lowercase, one digit, one special char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let validationErrors = {};

    if (!formData.name.trim()) validationErrors.name = 'Full name is required.';
    if (!validateEmail(formData.email)) validationErrors.email = 'Enter a valid Indian email.';
    if (!validatePhone(formData.phone)) validationErrors.phone = 'Enter a valid 10-digit Indian phone number.';
    if (!validatePassword(formData.password)) validationErrors.password = 'Password must be 8+ chars, with uppercase, lowercase, number & special char.';
    if (formData.password !== formData.confirmPassword) validationErrors.confirmPassword = 'Passwords do not match.';

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const { confirmPassword, ...dataToSend } = formData;
      const response = await registerUser(dataToSend);
      console.log('Registration successful', response);
      alert('Registration successful');
      navigate('/login');
    } catch (err) {
      console.error('Registration failed:', err);
      setErrors({ general: err.response?.data?.detail || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    setErrors({...errors, [e.target.name]: ''}); // remove error on change
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
            <UserPlus size={32} className={styles.icon} />
          </div>
          <h2 className={styles.title}>Create Account</h2>
          <p className={styles.subtitle}>Join us to start your healthy journey.</p>
        </div>

        {errors.general && (
          <div className={styles.errorBox}>{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} style={{ gap: '1.25rem' }}>
          {/* Name */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              placeholder="John Doe"
            />
            {errors.name && <p style={{color: 'red', fontSize: '0.85rem'}}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="you@example.com"
            />
            {errors.email && <p style={{color: 'red', fontSize: '0.85rem'}}>{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={styles.input}
              placeholder="9876543210"
            />
            {errors.phone && <p style={{color: 'red', fontSize: '0.85rem'}}>{errors.phone}</p>}
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="••••••••"
            />
            {errors.password && <p style={{color: 'red', fontSize: '0.85rem'}}>{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={styles.input}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p style={{color: 'red', fontSize: '0.85rem'}}>{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;


















// import React, { useState, useContext } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { UserPlus } from 'lucide-react';
// import styles from './Auth.module.css';
// import { registerUser } from '../api/authApi';


// const Register = () => {
//   const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '',phone: '' });
//   const[loading,setLoading]=useState(false)
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match.');
//       return;
//     }
//     setLoading(true)
//     try{
//          const { confirmPassword, ...dataToSend } = formData;
//       const response= await registerUser(dataToSend)
//       console.log('registration successful',response)
//       alert('registration successful')
//       navigate('/login')
//      } catch (err) {
//       console.error('Registration failed:', err);
//       setError(err.response?.data?.detail || 'Registration failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={styles.pageContainer}>
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className={styles.authCard}
//       >
//         <div className={styles.header}>
//           <div className={styles.iconContainer}>
//             <UserPlus size={32} className={styles.icon} />
//           </div>
//           <h2 className={styles.title}>Create Account</h2>
//           <p className={styles.subtitle}>Join us to start your healthy journey.</p>
//         </div>

//         {error && (
//           <div className={styles.errorBox}>
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className={styles.form} style={{gap: '1.25rem'}}>
//           <div className={styles.inputGroup}>
//             <label className={styles.label}>Full Name</label>
//             <input 
//               type="text" 
//               required
//               value={formData.name}
//               onChange={(e) => setFormData({...formData, name: e.target.value})}
//               className={styles.input}
//               placeholder="John Doe"
//             />
//           </div>

//           <div className={styles.inputGroup}>
//             <label className={styles.label}>Email Address</label>
//             <input 
//               type="email" 
//               required
//               value={formData.email}
//               onChange={(e) => setFormData({...formData, email: e.target.value})}
//               className={styles.input}
//               placeholder="you@example.com"
//             />
//           </div>
          
//             <div className={styles.inputGroup}>
//             <label className={styles.label}>Phone</label>
//             <input 
//               type="text" 
//               required
//               value={formData.phone}
//               onChange={(e) => setFormData({...formData, phone: e.target.value})}
//               className={styles.input}
//               placeholder="Enter phone number"
              
//             />
//           </div>

//           <div className={styles.inputGroup}>
//             <label className={styles.label}>Password</label>
//             <input 
//               type="password" 
//               required
//               value={formData.password}
//               onChange={(e) => setFormData({...formData, password: e.target.value})}
//               className={styles.input}
//               placeholder="••••••••"
//               minLength={6}
//             />
//           </div>

          

//           <div className={styles.inputGroup}>
//             <label className={styles.label}>Confirm Password</label>
//             <input 
//               type="password" 
//               required
//               value={formData.confirmPassword}
//               onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
//               className={styles.input}
//               placeholder="••••••••"
//               minLength={6}
//             />
//           </div>

//           <button type="submit" className={styles.submitBtn} disabled={loading}>
//   {loading ? "Registering..." : "Create Account"}
// </button>
//         </form>

//         <div className={styles.footer}>
//           <p className={styles.footerText}>
//             Already have an account?{' '}
//             <Link to="/login" className={styles.link}>
//               Sign In
//             </Link>
//           </p>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Register;
