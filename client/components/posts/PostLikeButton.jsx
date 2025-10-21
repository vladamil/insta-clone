'use client';

import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useState } from 'react';
import styles from './PostLikeButton.module.css';

export default function PostLikeButton({ post }) {
   const [isLiked, setIsLiked] = useState(post.isLiked);
   const [likeCount, setLikeCount] = useState(post.likesCount);
   const [loading, setLoading] = useState(false);

   const handleLikeClick = async () => {
      if (loading) return;
      setLoading(true);

      try {
         const token = sessionStorage.getItem('token');
         if (!token) return;

         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post._id}/${
               isLiked ? 'unlike' : 'like'
            }`,
            {
               method: 'POST',
               headers: { Authorization: `Bearer ${token}` },
            }
         );

         if (!res.ok) throw new Error('Failed to toggle like');

         // temporary optimistic UI update
         setIsLiked((prev) => !prev);
         setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
      } catch (err) {
         console.error('Like toggle failed:', err);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className={styles.actions}>
         <button
            className={styles.likeBtn}
            onClick={handleLikeClick}
            disabled={loading}
         >
            {isLiked ? (
               <FaHeart className={styles.likedIcon} />
            ) : (
               <FaRegHeart className={styles.unlikedIcon} />
            )}
         </button>
         <span className={styles.likeCount}>{likeCount} like(s)</span>
      </div>
   );
}
