'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './PostDeleteButton.module.css';

export default function PostDeleteButton({ postId, onDelete }) {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const { getValidToken } = useAuth();

   const handleDelete = async () => {
      if (!confirm('Are you sure you want to delete this post?')) return;

      try {
         setLoading(true);
         setError(null);
         const token = getValidToken();
         if (!token) throw new Error('Unauthorized: Please log in again.');

         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`,
            {
               method: 'DELETE',
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );

         if (!res.ok) throw new Error('Failed to delete post!');

         onDelete(postId);
      } catch (err) {
         setError(err);
      } finally {
         setLoading(false);
      }
   };

   if (error)
      return (
         <div className={styles.errorBox}>
            <p>{error.message || 'Something went wrong while deleting.'}</p>
            <button className={styles.deleteBtn} onClick={handleDelete}>
               Try Again
            </button>
         </div>
      );

   return (
      <button
         className={styles.deleteBtn}
         onClick={() => handleDelete()}
         disabled={loading}
      >
         {loading ? 'Deleting...' : 'Delete Post'}
      </button>
   );
}
