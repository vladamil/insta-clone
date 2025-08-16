'use client';

import { useState } from 'react';

export default function UpdatePassword() {
   const [oldPassword, setOldPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [message, setMessage] = useState('');

   const handleUpdate = async () => {
      // Validate passwords

      if (!oldPassword.trim() || !newPassword.trim()) {
         setMessage('All fields are required');
         return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (
         !passwordRegex.test(oldPassword) ||
         !passwordRegex.test(newPassword)
      ) {
         setMessage(
            'Password must have at least 8 characters (one uppercase, one lowercase, one number, and one special character)'
         );
         return;
      }

      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/account/password`,
            {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${sessionStorage.getItem('token')}`,
               },
               body: JSON.stringify({ oldPassword, newPassword }),
            }
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

   return (
      <section>
         <h2>Password</h2>
         <label htmlFor="old">Old Password:</label>
         <input
            value={oldPassword}
            type="password"
            name="old"
            onChange={(e) => setOldPassword(e.target.value)}
         />
         <label htmlFor="new">New Password:</label>
         <input
            value={newPassword}
            type="password"
            name="new"
            onChange={(e) => setNewPassword(e.target.value)}
         />
         <button onClick={handleUpdate}>Update Password</button>
         {message && <p>{message}</p>}
      </section>
   );
}
