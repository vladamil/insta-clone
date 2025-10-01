'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './AuthForm.module.css';

const initialFormData = {
   username: '',
   email: '',
   password: '',
};

export default function RegisterForm() {
   const { register } = useAuth();
   const [formData, setFormData] = useState(initialFormData);
   const [repeatPassword, setRepeatPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');

   const { email, username, password } = formData;
   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

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
      if (!email || !username || !password) {
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

      // Validate email address
      if (!emailRegex.test(email)) {
         setError('Not valid e-mail address');
         setLoading(false);
         return;
      }

      // Validate password strenght
      if (!passwordRegex.test(password)) {
         setError(
            'Password must have at least 8 characters (one uppercase, one lowercase, one number, and one special character)'
         );
         setLoading(false);
         return;
      }

      // Repeat password check
      if (formData.password !== repeatPassword) {
         setError("Passwords don't match");
         setLoading(false);
         return;
      }

      const result = await register(username, email, password);
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
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
         />

         <input
            className={styles.input}
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
         />

         <input
            className={styles.input}
            name="repeatPassword"
            type="password"
            placeholder="Repeat Password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            required
         />
         <br />

         <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
         </button>

         {success && (
            <p className={styles.switch}>
               Registration successful! You can now{' '}
               <Link style={{ textDecoration: 'underline' }} href="/login">
                  login
               </Link>
            </p>
         )}
      </form>
   );
}
