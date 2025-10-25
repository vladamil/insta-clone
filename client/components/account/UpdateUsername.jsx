'use client';

import { useState, useEffect } from 'react';

import styles from './AccountSection.module.css';

export default function UpdateUsername({ currentUsername }) {
   const [username, setUsername] = useState(currentUsername || '');
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState('');

   const handleUpdate = async () => {
      if (!username.trim()) {
         setMessage('Username is required');
         return;
      }

      if (/\s/.test(username)) {
         setMessage('Username cannot contain spaces');
         return;
      }
      try {
         setLoading(true);
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/account/username`,
            {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${sessionStorage.getItem('token')}`,
               },
               body: JSON.stringify({ username }),
            }
         );

         const data = await res.json();
         if (!res.ok) throw new Error(data.error);
         setMessage('Username updated successfully!');
      } catch (err) {
         setMessage(`${err.message}`);
      } finally {
         setLoading(false);
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
         <h2>Username</h2>
         <div className={styles.formContainer}>
            <input
               className={styles.input}
               value={username}
               onChange={(e) => setUsername(e.target.value)}
            />
            <button
               className={styles.btn}
               onClick={handleUpdate}
               disabled={loading}
            >
               Update Username
            </button>

            {message && <p className={styles.message}>{message}</p>}
         </div>
      </section>
   );
}
