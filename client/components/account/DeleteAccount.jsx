'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteAccount() {
   const router = useRouter();
   const [message, setMessage] = useState('');

   const handleDelete = async () => {
      if (
         !confirm(
            'Are you sure you want to delete your account? This action cannot be undone.'
         )
      )
         return;

      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/account`,
            {
               method: 'DELETE',
               headers: {
                  Authorization: `Bearer ${sessionStorage.getItem('token')}`,
               },
            }
         );

         const data = await res.json();
         if (!res.ok) throw new Error(data.error);

         sessionStorage.removeItem('token'); // Remove session
         setMessage('✅ Account deleted. Redirecting...');
         setTimeout(() => router.replace('/signup'), 1500); // Redirect after short delay for UX
      } catch (err) {
         setMessage(`❌ ${err.message}`);
      }
   };

   return (
      <section>
         <h2>Delete Account</h2>
         <button
            onClick={handleDelete}
            style={{ backgroundColor: 'red', color: 'white' }}
         >
            Delete Account
         </button>
         {message && <p>{message}</p>}
      </section>
   );
}
