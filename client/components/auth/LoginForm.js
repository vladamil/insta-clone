import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './AuthForm.module.css';

export default function LoginForm({ fromHome, onToggle }) {
   const [formData, setFormData] = useState({
      username: '',
      password: '',
   });
   const [loading, setLoading] = useState(false);
   const [resendLoading, setResendLoading] = useState(false);
   const [showResend, setShowResend] = useState(false);
   const [error, setError] = useState(null);

   const router = useRouter();
   const { login } = useAuth();

   const handleChange = (e) => {
      setFormData((prev) => ({
         ...prev,
         [e.target.name]: e.target.value,
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setShowResend(false);

      const result = await login(formData.username, formData.password);

      if (!result.success) {
         setError(result.message);

         if (result.code === 'EMAIL_NOT_VERIFIED') {
            setShowResend(true);
         }
         setLoading(false);
         return;
      }

      setLoading(false);
      router.replace('/profile');
   };

   const handleResend = async () => {
      setResendLoading(true);
      setError(null);

      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/resend-verification`,
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({ username: formData.username }),
            },
         );

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data.error || 'Login failed');
         }

         router.replace('/check-email');
      } catch (err) {
         setError(err.message);
      } finally {
         setResendLoading(false);
      }
   };

   return (
      <form className={styles.form} onSubmit={handleSubmit}>
         <h2 className={styles.title}>Login</h2>

         {error && <p className={styles.error}>{error}</p>}

         {showResend && (
            <div className={styles.resend}>
               <p className={styles.resendText}>
                  Please check your email for the confirmation link.
               </p>
               <p className={styles.resendText}>
                  Didn't receive it?
                  <button
                     className={styles.resendButton}
                     disabled={resendLoading}
                     onClick={handleResend}
                  >
                     Resend Verification Email
                  </button>
               </p>
            </div>
         )}

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
            Don't have an account?{' '}
            {!fromHome && (
               <Link style={{ textDecoration: 'underline' }} href="/register">
                  Register
               </Link>
            )}
            {/* if from HOME PAGE just toggle view */}
            {fromHome && (
               <span
                  style={{ textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={onToggle}
               >
                  Register
               </span>
            )}
         </p>
      </form>
   );
}
