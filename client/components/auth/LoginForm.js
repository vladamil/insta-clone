import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './AuthForm.module.css';

export default function AuthForm() {
   const [formData, setFormData] = useState({
      username: '',
      password: '',
   });
   const [loading, setLoading] = useState(false);

   const { login, authError } = useAuth();

   const handleChange = (e) => {
      setFormData((prev) => ({
         ...prev,
         [e.target.name]: e.target.value,
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      await login(formData.username, formData.password);

      setLoading(false);
   };

   return (
      <form className={styles.form} onSubmit={handleSubmit}>
         <h2 className={styles.title}>Login</h2>

         {authError && <p className={styles.error}>{authError}</p>}

         <input
            className={styles.input}
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
         />

         <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
         />

         <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
         </button>

         <p className={styles.switch}>
            Don't have an account? <Link href="/register">Register</Link>
         </p>
      </form>
   );
}
