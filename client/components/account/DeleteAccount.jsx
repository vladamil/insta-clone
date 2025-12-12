'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

import styles from './AccountSection.module.css';

export default function DeleteAccount() {
   const router = useRouter();
   const { getValidToken, logout } = useAuth();
   const [message, setMessage] = useState('');

   const handleDelete = async () => {
      if (
         !confirm(
            'Are you sure you want to delete your account? This action cannot be undone.'
         )
      )
         return;

      try {
         const token = getValidToken();

         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/account`,
            {
               method: 'DELETE',
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
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

   return (
      <section className={styles.section}>
         <h2>Delete Account</h2>
         <div className={styles.formContainer}>
            <button className={styles.deleteBtn} onClick={handleDelete}>
               Delete Account
            </button>
            {message && <p className={styles.message}>{message}</p>}
         </div>
      </section>
   );
}
