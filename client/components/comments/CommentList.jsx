'use client';

import { useEffect, useState } from 'react';
import SingleComment from './SingleComment';
import styles from './CommentList.module.css';

export default function Comments({ postId }) {
   const [comments, setComments] = useState([]); // top-level comments (each may have .replies array)
   const [count, setCount] = useState(0);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   // Creating comment states
   const [commentText, setCommentText] = useState('');
   const [creating, setCreating] = useState(false);
   const [createError, setCreateError] = useState(null);

   // UI-only submit handler
   const handleCreateSubmit = (e) => {
      e.preventDefault();
      setCreateError(null);

      if (!commentText.trim()) {
         setCreateError('Comment cannot be empty');
         return;
      }

      // UI-only behavior: show creating state briefly and log to console
      setCreating(true);
      console.log('Comment Created!', { postId, text: commentText });

      // Simulate short delay to show button disabled state — then clear input
      setTimeout(() => {
         setCommentText('');
         setCreating(false);
      }, 400);
   };

   useEffect(() => {
      if (!postId) return;
      let cancelled = false;

      const fetchComments = async () => {
         setLoading(true);
         setError(null);
         try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comments`,
               {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
               }
            );

            const data = await res.json();
            if (!res.ok)
               throw new Error(data.error || 'Failed to fetch comments');

            if (!cancelled) {
               setComments(data.comments || []);
               setCount(
                  data.commentsCount ||
                     (data.comments && data.comments.length) ||
                     0
               );
            }
         } catch (err) {
            if (!cancelled) setError(err.message);
         } finally {
            if (!cancelled) setLoading(false);
         }
      };

      fetchComments();

      return () => {
         cancelled = true;
      };
   }, [postId]);

   console.log(createError);

   if (loading) return <div className={styles.loading}>Loading comments…</div>;
   if (error) return <div className={styles.error}>Error: {error}</div>;

   return (
      <div className={styles.commentsWrap}>
         <div className={styles.header}>
            <strong>{count}</strong> comment{count === 1 ? '' : 's'}
         </div>

         <form className={styles.createBox} onSubmit={handleCreateSubmit}>
            <textarea
               value={commentText}
               onChange={(e) => setCommentText(e.target.value)}
               placeholder="Write a comment..."
               rows={2}
               className={styles.textarea}
               disabled={creating}
            />

            <div className={styles.createActions}>
               <button
                  type="button"
                  className={`${styles.btn} ${styles.ghost}`}
                  onClick={() => setCommentText('')}
                  disabled={creating || !commentText.trim()}
               >
                  Clear
               </button>

               <button
                  type="submit"
                  className={`${styles.btn} ${styles.primary}`}
                  disabled={creating || !commentText.trim()}
               >
                  {creating ? 'Posting…' : 'Post'}
               </button>
            </div>

            {createError && (
               <div className={styles.createError}>{createError}</div>
            )}
         </form>

         {comments.length === 0 ? (
            <div className={styles.empty}>
               No comments yet — be the first to comment!
            </div>
         ) : (
            <ul className={styles.list}>
               {comments.map((c) => (
                  <SingleComment key={c._id} comment={c} />
               ))}
            </ul>
         )}
      </div>
   );
}
