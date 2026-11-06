'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import styles from './AccountSection.module.css';
import PasswordEyeButton from '../common/PasswordEyeButton';

export default function UpdateEmail({ currentEmail }) {
   const [email, setEmail] = useState(currentEmail || '');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [message, setMessage] = useState('');

   const { getValidToken } = useAuth();
   const router = useRouter();

   const handleUpdate = async () => {
      // Validate email address

      if (!email.trim()) {
         setMessage('Email is required');
         return;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
         setMessage('Not a valid e-mail address');
         return;
      }

      if (email.trim().length > 50) {
         setMessage('Email is too long (max 50 characters)');
         return;
      }

      if (!password.trim()) {
         setMessage('Please enter your current password');
         return;
      }

      try {
         const token = getValidToken();

         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/account/email`,
            {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify({ email, password }),
            },
         );

         const data = await res.json();
         if (!res.ok) throw new Error(data.error);
         setMessage('Verification link sent to your new email.');
         router.push('/check-email-change');
      } catch (err) {
         setMessage(`${err.message}`);
      }
   };

   // Auto-clear messages after 3 seconds
   useEffect(() => {
      if (message) {
         const timer = setTimeout(() => {
            setMessage('');
         }, 3000);

         return () => clearTimeout(timer);
      }
   }, [message]);

   return (
      <section className={styles.section}>
         <h2>Email</h2>
         <div className={styles.formContainer}>
            <input
               className={styles.input}
               value={email}
               onChange={(e) => setEmail(e.target.value)}
            />

            <label className={styles.label} htmlFor="email-password">
               Current Password:
            </label>
            <div style={{ position: 'relative' }}>
               <input
                  className={styles.input}
                  id="email-password"
                  value={password}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
               />
               <PasswordEyeButton
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
               />
            </div>

            <button className={styles.btn} onClick={handleUpdate}>
               Update Email
            </button>

            {message && <p className={styles.message}>{message}</p>}
         </div>
      </section>
   );
}
