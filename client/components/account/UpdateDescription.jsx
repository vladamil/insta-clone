'use client';

import { useState } from 'react';

export default function UpdateDescription({ currentDescription }) {
   const [description, setDesription] = useState(currentDescription || '');
   const [message, setMessage] = useState('');

   const handleUpdate = async () => {
      // Validate bio

      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/account/description`,
            {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${sessionStorage.getItem('token')}`,
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

   return (
      <section>
         <h2>Description</h2>
         <textarea
            value={description}
            onChange={(e) => setDesription(e.target.value)}
            // placeholder={user.description || ''}
         />
         <button onClick={handleUpdate}>Update Description</button>
         {message && <p>{message}</p>}
      </section>
   );
}
