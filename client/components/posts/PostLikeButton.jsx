'use client';

import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import styles from './PostLikeButton.module.css';
import UserListModal from '../common/UserListModal';

export default function PostLikeButton({ post }) {
   const [isLiked, setIsLiked] = useState(null);
   const [likeCount, setLikeCount] = useState(0);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const [openLikesList, setOpenLikesList] = useState(false);

   // Fetching fresh post data for likes update
   useEffect(() => {
      setLoading(true);
      const fetchPost = async () => {
         try {
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post._id}`,
               {
                  headers: {
                     Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                  },
               }
            );
            const data = await res.json();
            setIsLiked(data.isLiked);
            setLikeCount(data.likesCount || 0);
         } catch (error) {
            setError(error.message);
         } finally {
            setLoading(false);
         }
      };

      fetchPost();
   }, [post]);

   // Like handler
   const handleLikeClick = async () => {
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
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   if (loading || isLiked === null)
      return <FaHeart className={styles.likedIcon} />;
   if (error) return <p>{error}</p>;

   return (
      <>
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
            <span
               className={styles.likeCount}
               onClick={() => setOpenLikesList(true)}
            >
               {likeCount} like(s)
            </span>
         </div>

         <UserListModal
            isOpen={openLikesList}
            onClose={() => setOpenLikesList(false)}
            title="Likes"
            fetchUsers={() =>
               fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post._id}/likes`,
                  {
                     headers: {
                        Authorization: `Bearer ${sessionStorage.getItem(
                           'token'
                        )}`,
                     },
                  }
               )
            }
         />
      </>
   );
}
