'use client';

import { useState, useEffect } from 'react';

import styles from './AccountSection.module.css';

export default function UpdateDescription({ currentDescription }) {
   const [description, setDesription] = useState(currentDescription || '');
   const [message, setMessage] = useState('');

   const handleUpdate = async () => {
      // Validate description
      if (description.length > 150) {
         setMessage('Description is too long (max 150 characters)');
         return;
      }

      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/account/description`,
            {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
               },
               body: JSON.stringify({ description }),
            }
         );

         const data = await res.json();
         if (!res.ok) throw new Error(data.error);
         setMessage('✅ Description updated successfully!');
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
         <h2>Description</h2>
         <div className={styles.formContainer}>
            <textarea
               className={styles.textarea}
               value={description}
               onChange={(e) => setDesription(e.target.value)}
            />
            <button className={styles.btn} onClick={handleUpdate}>
               Update Description
            </button>
            {message && <p className={styles.message}>{message}</p>}
         </div>
      </section>
   );
}
