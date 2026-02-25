'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

import styles from './AccountSection.module.css';

export default function UpdateRealname({ currentRealname }) {
   const [realname, setRealname] = useState(currentRealname || '');
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState('');

   const { getValidToken } = useAuth();

   const handleUpdate = async () => {
      if (!realname.trim()) {
         setMessage('Name is required');
         return;
      }

      if (realname.length < 2 || realname.length > 40) {
         setMessage('Full name must be 2–40 characters long');
         return;
      }

      const realnameRegex = /^[\p{L}][\p{L}\s'-]{1,39}$/u;
      if (!realnameRegex.test(realname)) {
         setMessage(
            'Full name may contain letters, spaces and hyphens only (no numbers or symbols)',
         );
         return;
      }

      try {
         const token = getValidToken();

         setLoading(true);
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/account/realname`,
            {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify({ realname }),
            },
         );

         const data = await res.json();
         if (!res.ok) throw new Error(data.error);
         setMessage('Full name updated successfully!');
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
         <h2>Full Name</h2>
         <div className={styles.formContainer}>
            <input
               className={styles.input}
               value={realname}
               onChange={(e) => setRealname(e.target.value)}
            />
            <button
               className={styles.btn}
               onClick={handleUpdate}
               disabled={loading}
            >
               Update Full Name
            </button>

            {message && <p className={styles.message}>{message}</p>}
         </div>
      </section>
   );
}
