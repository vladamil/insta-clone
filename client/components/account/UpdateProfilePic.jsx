'use client';

import { useState } from 'react';

export default function UpdateProfilePic({ currentPic }) {
   const [file, setFile] = useState(null);
   const [previewUrl, setPreviewUrl] = useState(currentPic);
   const [message, setMessage] = useState('');

   const handleFileChange = (e) => {
      const selected = e.target.files[0];
      if (selected) {
         setFile(selected);
         setPreviewUrl(URL.createObjectURL(selected)); // Temporary preview
      }
   };

   const handleUpload = async () => {
      if (!file) return;

      const formData = new FormData();
      formData.append('profilePic', file);

      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/account/profile-pic`,
            {
               method: 'PATCH',
               headers: {
                  Authorization: `Bearer ${sessionStorage.getItem('token')}`,
               },
               body: formData,
            }
         );

         const data = await res.json();
         if (!res.ok) throw new Error(data.error);

         setPreviewUrl(data.profilePicUrl); // Instant update from server
         setMessage('✅ Profile picture updated!');
      } catch (err) {
         setMessage(`❌ ${err.message}`);
      }
   };

   return (
      <section>
         <h2>Profile Picture</h2>
         <img
            src={previewUrl || '/default-avatar.png'}
            alt="Profile Picture"
            width="200"
         />
         <input type="file" accept="image/*" onChange={handleFileChange} />
         <button onClick={handleUpload}>Upload</button>
         {message && <p>{message}</p>}
      </section>
   );
}
