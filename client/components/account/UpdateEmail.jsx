'use client';

import { useState } from 'react';

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
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/account/email`,
            {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${sessionStorage.getItem('token')}`,
               },
               body: JSON.stringify({ email }),
            }
         );

         const data = await res.json();
         if (!res.ok) throw new Error(data.error);
         setMessage('✅ Username updated successfully!');
      } catch (err) {
         setMessage(`❌ ${err.message}`);
      }
   };

   return (
      <section>
         <h2>Email</h2>
         <input value={email} onChange={(e) => setEmail(e.target.value)} />
         <button onClick={handleUpdate}>Update Email</button>
         {message && <p>{message}</p>}
      </section>
   );
}
