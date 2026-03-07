'use client';

import { useState, useEffect } from 'react';

import styles from './AccountSection.module.css';
import PasswordEyeButton from '../common/PasswordEyeButton';
import { useAuth } from '@/context/AuthContext';

export default function UpdatePassword() {
   const [oldPassword, setOldPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [message, setMessage] = useState('');

   // Password display toggle states
   const [showPassword, setShowPassword] = useState(false);
   const [showNewPassword, setShowNewPassword] = useState(false);

   const { getValidToken } = useAuth();

   const handleUpdate = async () => {
      // Validate passwords

      if (!oldPassword.trim() || !newPassword.trim()) {
         setMessage('All fields are required');
         return;
      }

      if (newPassword.trim().length > 64) {
         setMessage('New password is too long (max 64 characters)');
         return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (
         !passwordRegex.test(oldPassword) ||
         !passwordRegex.test(newPassword)
      ) {
         setMessage(
            'Password must have at least 8 characters (one uppercase, one lowercase, one number, and one special character)',
         );
         return;
      }

      try {
         const token = getValidToken();

         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/account/password`,
            {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify({ oldPassword, newPassword }),
            },
         );

         const data = await res.json();
         if (!res.ok) throw new Error(data.error);
         setMessage('✅ Password updated successfully!');
         setOldPassword('');
         setNewPassword('');
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
         <h2>Password</h2>
         <div className={styles.formContainer}>
            <label className={styles.label} htmlFor="old">
               Old Password:
            </label>
            <div style={{ position: 'relative' }}>
               <input
                  className={styles.input}
                  value={oldPassword}
                  type={showPassword ? 'text' : 'password'}
                  name="old"
                  onChange={(e) => setOldPassword(e.target.value)}
               />
               <PasswordEyeButton
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
               />
            </div>

            <label className={styles.label} htmlFor="new">
               New Password:
            </label>
            <div style={{ position: 'relative' }}>
               <input
                  className={styles.input}
                  value={newPassword}
                  type={showNewPassword ? 'text' : 'password'}
                  name="new"
                  onChange={(e) => setNewPassword(e.target.value)}
               />
               <PasswordEyeButton
                  showPassword={showNewPassword}
                  setShowPassword={setShowNewPassword}
               />
            </div>
            <button className={styles.btn} onClick={handleUpdate}>
               Update Password
            </button>

            {message && <p className={styles.message}>{message}</p>}
         </div>
      </section>
   );
}
