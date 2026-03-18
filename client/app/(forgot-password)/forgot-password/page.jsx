'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import styles from './ForgotPasswordPage.module.css';

export default function ForgotPasswordPage() {
   const router = useRouter();

   const [emailOrUsername, setEmailOrUsername] = useState('');
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e) => {
      e.preventDefault();

      setError(null);
      setLoading(true);

      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/forgot-password`,
            {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ emailOrUsername }),
            },
         );

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data.error || 'Something went wrong');
         }

         // Always redirect to generic info page
         router.replace('/reset-sent');
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className={styles.wrapper}>
         <div className={styles.card}>
            <Link
               href={'/'}
               className={styles.backBtn}
            >
               <FaArrowLeft size={20} />
            </Link>
            <h1 className={styles.title}>Forgot your password?</h1>
            <p className={styles.description}>
               Enter your email address or username and we’ll send you a link to
               reset your password.
            </p>

            <form onSubmit={handleSubmit}>
               <input
                  type="text"
                  placeholder="Email or Username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  className={styles.input}
               />

               <button
                  type="submit"
                  disabled={loading}
                  className={styles.button}
               >
                  {loading ? 'Sending...' : 'Send reset link'}
               </button>

               {error && <p className={styles.error}>{error}</p>}
            </form>
         </div>
      </div>
   );
}
