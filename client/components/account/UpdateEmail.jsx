'use client';

import { useState, useEffect } from 'react';
import { getValidToken } from '@/utils/getValidToken';

import styles from './AccountSection.module.css';

export default function UpdateEmail({ currentEmail }) {
   const [email, setEmail] = useState(currentEmail || '');
   const [message, setMessage] = useState('');

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
               body: JSON.stringify({ email }),
            }
         );

         const data = await res.json();
         if (!res.ok) throw new Error(data.error);
         setMessage('Email updated successfully!');
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
            <button className={styles.btn} onClick={handleUpdate}>
               Update Email
            </button>

            {message && <p className={styles.message}>{message}</p>}
         </div>
      </section>
   );
}
