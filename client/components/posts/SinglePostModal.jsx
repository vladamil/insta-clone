'use client';
import { useState } from 'react';
import Image from 'next/image';
import styles from './SinglePostModal.module.css';

const SinglePostModal = ({ index, posts, onClose, onDelete }) => {
   const post = posts[index];
   if (!post) return;

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const handleDelete = async () => {
      if (!confirm('Are you sure you want to delete this post?')) return;

      try {
         setLoading(true);
         setError(null);
         const token = sessionStorage.getItem('token');
         if (!token) throw new Error('Unauthorized: Please log in again.');

         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post._id}`,
            {
               method: 'DELETE',
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );

         if (!res.ok) throw new Error('Failed to delete post!');

         onDelete(post._id);
      } catch (err) {
         setError(err);
         alert('Failed to delete post!');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className={styles.overlay}>
         <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={onClose}>
               X
            </button>

            <div className={styles.imageWrapper}>
               <Image
                  src={post.imageUrl}
                  alt={post.caption || 'Post image'}
                  fill
                  className={styles.image}
               />
            </div>

            <div className={styles.details}>
               <div className={styles.header}>
                  <Image
                     src={post.author.profilePicUrl || '/default-avatar.png'}
                     alt={post.author.username}
                     width={40}
                     height={40}
                     className={styles.avatar}
                  />
                  <span className={styles.username}>
                     {post.author.username}
                  </span>
               </div>

               {post.caption && (
                  <p className={styles.caption}>{post.caption}</p>
               )}

               <div className={styles.actions}>
                  <button className={styles.likeBtn}>
                     ❤️ {post.likes?.length || 0}
                  </button>
                  <button className={styles.commentBtn}>
                     💬 {post.comments?.length || 0}
                  </button>
               </div>

               {/* Delete button visible only if allowed */}
               {onDelete && (
                  <button
                     className={styles.deleteBtn}
                     onClick={() => handleDelete(post._id)}
                     disabled={loading}
                  >
                     {loading ? 'Deleting...' : 'Delete Post'}
                  </button>
               )}
            </div>
         </div>
      </div>
   );
};

export default SinglePostModal;
