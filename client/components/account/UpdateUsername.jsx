'use client';

import { useState } from 'react';

export default function UpdateUsername({ currentUsername }) {
   const [username, setUsername] = useState(currentUsername || '');
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
         setMessage('✅ Username updated successfully!');
      } catch (err) {
         setMessage(`❌ ${err.message}`);
      }
   };

   return (
      <section>
         <h2>Username</h2>
         <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
         />
         <button onClick={handleUpdate}>Update Username</button>
         {message && <p>{message}</p>}
      </section>
   );
}
