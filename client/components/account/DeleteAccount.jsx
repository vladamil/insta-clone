'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

import styles from './AccountSection.module.css';
import PasswordEyeButton from '../common/PasswordEyeButton';

export default function DeleteAccount() {
   const router = useRouter();
   const { getValidToken, logout } = useAuth();
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [message, setMessage] = useState('');

   const handleDelete = async () => {
      if (!password.trim()) {
         setMessage('❌ Please enter your current password');
         return;
      }

      try {
         const token = getValidToken();

         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/account`,
            {
               method: 'DELETE',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify({ password }),
            },
         );

         const data = await res.json();
         if (!res.ok) throw new Error(data.error);

         localStorage.removeItem('token'); // Remove from local storage
         setMessage('✅ Account deleted. Redirecting...');
         setTimeout(() => logout(), 2000); // Redirect after short delay for UX
      } catch (err) {
         setMessage(`❌ ${err.message}`);
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
         <h2>Delete Account</h2>
         <div className={styles.formContainer}>
            <p className={styles.warning}>
               This permanently deletes your account, posts and comments. This
               can&apos;t be undone.
            </p>

            <label className={styles.label} htmlFor="delete-password">
               Current Password:
            </label>
            <div style={{ position: 'relative' }}>
               <input
                  className={styles.input}
                  id="delete-password"
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

            <button className={styles.deleteBtn} onClick={handleDelete}>
               Delete Account
            </button>
            {message && <p className={styles.message}>{message}</p>}
         </div>
      </section>
   );
}
