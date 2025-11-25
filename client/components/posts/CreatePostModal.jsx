'use client';

import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FaTimes, FaCamera } from 'react-icons/fa';
import Image from 'next/image';
import styles from './CreatePostModal.module.css';

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
   const [selectedFile, setSelectedFile] = useState(null);
   const [previewUrl, setPreviewUrl] = useState(null);
   const [caption, setCaption] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   // Close modal on ESC
   useEffect(() => {
      const handleEsc = (e) => {
         if (e.key === 'Escape') {
            onClose();
         }
      };

      document.addEventListener('keydown', handleEsc);

      return () => document.removeEventListener('keydown', handleEsc);
   }, [onClose]);

   if (!isOpen) return null;

   const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         setSelectedFile(file);
         setPreviewUrl(URL.createObjectURL(file));
      }
   };

   const handleSubmit = async () => {
      try {
         setLoading(true);
         setError(null);

         const token = localStorage.getItem('token');
         if (!token) throw new Error('Unauthorized: Please log in again.');

         const formData = new FormData();
         formData.append('postImage', selectedFile);
         formData.append('caption', caption);

         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/posts`,
            {
               method: 'POST',
               headers: {
                  Authorization: `Bearer ${token}`,
               },
               body: formData,
            }
         );

         const data = await res.json();
         if (!res.ok) throw new Error(data.error || 'Failed to create post.');

         // success – reset and close modal
         setSelectedFile(null);
         setPreviewUrl(null);
         setCaption('');
         onClose();
         onPostCreated(data); // optimistic update (adding post) in UI
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   const handleRemoveImage = () => {
      setSelectedFile(null);
      setPreviewUrl(null);
   };

   const modalContent = (
      <div className={styles.overlay}>
         <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={onClose}>
               <FaTimes />
            </button>

            <h2 className={styles.title}>Create New Post</h2>

            {!previewUrl ? (
               <label className={styles.uploadBox}>
                  <input
                     type="file"
                     accept="image/*"
                     onChange={handleFileChange}
                     hidden
                  />
                  <FaCamera size={60} />
                  <p>Click to upload image</p>
               </label>
            ) : (
               <div className={styles.preview}>
                  <Image
                     src={previewUrl}
                     alt="Preview"
                     fill
                     className={styles.image}
                  />
                  <button
                     hidden={loading}
                     onClick={handleRemoveImage}
                     className={styles.removeBtn}
                  >
                     X
                  </button>
               </div>
            )}

            <textarea
               placeholder="Write a caption... (optional)"
               value={caption}
               onChange={(e) => setCaption(e.target.value)}
               className={styles.caption}
            />

            {error && <p className={styles.error}>{error}</p>}

            <button
               onClick={handleSubmit}
               className={styles.submitBtn}
               disabled={!selectedFile || loading}
            >
               {loading ? 'Posting...' : 'Post'}
            </button>
         </div>
      </div>
   );

   return ReactDOM.createPortal(modalContent, document.body);
}
