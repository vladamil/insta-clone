'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Spinner from '@/components/common/Spinner';
import styles from '../forgot-password/ForgotPasswordPage.module.css';

export default function ResetPasswordPage() {
   const searchParams = useSearchParams();
   const router = useRouter();

   const token = searchParams.get('token');

   const [loading, setLoading] = useState(true);
   const [isValid, setIsValid] = useState(false);
   const [error, setError] = useState('');

   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [submitError, setSubmitError] = useState('');

   // Validate token on mount
   useEffect(() => {
      if (!token) {
         setError('Reset link is invalid.');
         setLoading(false);
         return;
      }

      const validateToken = async () => {
         try {
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/validate-reset-token`,
               {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token }),
               },
            );

            if (!res.ok) {
               throw new Error('Invalid or expired token');
            }

            setIsValid(true);
         } catch (err) {
            setError('Reset link is invalid or expired.');
         } finally {
            setLoading(false);
         }
      };

      validateToken();
   }, [token]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitError('');
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

      if (!password.trim() || !confirmPassword.trim()) {
         setSubmitError('All fields are required');
         return;
      }

      if (!passwordRegex.test(password)) {
         setSubmitError(
            'Password must have at least 8 characters (one uppercase, one lowercase, one number, and one special character)',
         );
         return;
      }

      if (password.trim().length > 64) {
         setSubmitError('New password is too long (max 64 characters)');
         return;
      }

      if (password !== confirmPassword) {
         setSubmitError('Passwords do not match.');
         return;
      }

      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/reset-password`,
            {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ token, password }),
            },
         );

         if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Reset failed');
         }

         router.push('/login?reset=success');
      } catch (err) {
         setSubmitError(err.message);
      }
   };

   if (loading) {
      return (
         <div className={styles.wrapper}>
            <Spinner />
         </div>
      );
   }

   if (error) {
      return (
         <div className={styles.wrapper}>
            <div className={styles.card}>
               <h2 className={styles.title}>Error</h2>
               <p className={styles.description}>{error}</p>

               <Link href="/home" className={styles.button}>
                  Back to Home
               </Link>
            </div>
         </div>
      );
   }

   if (isValid) {
      return (
         <div className={styles.wrapper}>
            <div className={styles.card}>
               <h2 className={styles.title}>Set a new password</h2>
               <p className={styles.description}>
                  Please enter and confirm your new password below to finish
                  resetting your account.
               </p>

               <form className={styles.form} onSubmit={handleSubmit}>
                  <input
                     className={styles.input}
                     type="password"
                     placeholder="New password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                  />

                  <input
                     className={styles.input}
                     type="password"
                     placeholder="Confirm password"
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     required
                  />

                  <button className={styles.button} type="submit">
                     Reset Password
                  </button>
                  {submitError && <p className={styles.error}>{submitError}</p>}
               </form>
            </div>
         </div>
      );
   }
}
