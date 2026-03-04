'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import PasswordEyeButton from '../common/PasswordEyeButton';
import styles from './AuthForm.module.css';

const initialFormData = {
   username: '',
   realname: '',
   email: '',
   password: '',
};

export default function RegisterForm({ fromHome, onToggle }) {
   const { register } = useAuth();
   const [formData, setFormData] = useState(initialFormData);
   const [repeatPassword, setRepeatPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');
   // Password visibility toggle states
   const [showPassword, setShowPassword] = useState(false);
   const [showRepeatPassword, setShowRepeatPassword] = useState(false);

   const router = useRouter();

   const { email, username, realname, password } = formData;
   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
   const realnameRegex = /^[\p{L}][\p{L}\s'-]{1,39}$/u;

   // Redirect to Check Email page if success is true
   useEffect(() => {
      if (success) {
         router.replace('/check-email');
      }
   }, [success, router]);

   const handleChange = (e) => {
      setFormData((prev) => ({
         ...prev,
         [e.target.name]: e.target.value,
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess('');

      // Empty fields checks
      if (!email || !username || !realname || !password) {
         setError('All fields are required');
         setLoading(false);
         return;
      }

      // Validate username (no empty spaces)
      if (/\s/.test(username)) {
         setError('Username cannot contain spaces');
         setLoading(false);
         return;
      }

      // Validate username lenght
      if (username.length < 3 || username.length > 20) {
         setError('Username must be 3–20 characters long');
         setLoading(false);
         return;
      }

      // Validate real name lenght
      if (realname.length < 2 || realname.length > 40) {
         setError('Full name must be between 2 and 40 characters');
         setLoading(false);
         return;
      }

      // Validate real name text
      if (!realnameRegex.test(realname)) {
         setError(
            'Real name may contain letters, spaces and hyphens only (no numbers or symbols)',
         );
         setLoading(false);
         return;
      }

      // Validate email address
      if (!emailRegex.test(email)) {
         setError('Not valid e-mail address');
         setLoading(false);
         return;
      }

      // Validate email lenght
      if (email.trim().length > 50) {
         setError('Email is too long (max 50 characters)');
         setLoading(false);
         return;
      }

      // Validate password strenght
      if (!passwordRegex.test(password)) {
         setError(
            'Password must have at least 8 characters (one uppercase, one lowercase, one number, and one special character)',
         );
         setLoading(false);
         return;
      }

      // Validate password lenght
      if (password.trim().length > 64) {
         setError('Password is too long (max 64 characters)');
         setLoading(false);
         return;
      }

      // Repeat password check
      if (formData.password !== repeatPassword) {
         setError("Passwords don't match");
         setLoading(false);
         return;
      }

      const result = await register(username, realname, email, password);
      if (result.success) {
         setSuccess(result.message);
         setFormData(initialFormData);
         setRepeatPassword('');
      } else {
         setError(result.message);
      }
      setLoading(false);
   };

   return (
      <form className={styles.form} onSubmit={handleSubmit}>
         <h1 className={styles.title}>Register</h1>
         {error && <p className={styles.error}> {error}</p>}
         <input
            className={styles.input}
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
         />
         <input
            className={styles.input}
            name="realname"
            placeholder="Full name"
            value={formData.realname}
            onChange={handleChange}
            required
         />

         <input
            className={styles.input}
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
         />

         <div style={{ position: 'relative' }}>
            <input
               className={styles.input}
               type={showPassword ? 'text' : 'password'}
               name="password"
               placeholder="Password"
               value={formData.password}
               onChange={handleChange}
               required
            />
            <PasswordEyeButton
               showPassword={showPassword}
               setShowPassword={setShowPassword}
               style={{ transform: 'translateY(-1rem)' }}
            />
         </div>

         <div style={{ position: 'relative' }}>
            <input
               className={styles.input}
               type={showRepeatPassword ? 'text' : 'password'}
               name="repeatPassword"
               placeholder="Repeat Password"
               value={repeatPassword}
               onChange={(e) => setRepeatPassword(e.target.value)}
               required
            />
            <PasswordEyeButton
               showPassword={showRepeatPassword}
               setShowPassword={setShowRepeatPassword}
               style={{ transform: 'translateY(-1rem)' }}
            />
         </div>
         <br />

         <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
         </button>

         {/* DEFAULT REGISTER MESSAGE */}
         {!success && (
            <p className={styles.switch}>
               Already have an account? You can{' '}
               {!fromHome && (
                  <Link style={{ textDecoration: 'underline' }} href="/login">
                     Login
                  </Link>
               )}
               {/* if from HOME PAGE just toggle view */}
               {fromHome && (
                  <span
                     style={{ textDecoration: 'underline', cursor: 'pointer' }}
                     onClick={onToggle}
                  >
                     Login
                  </span>
               )}
            </p>
         )}
      </form>
   );
}
