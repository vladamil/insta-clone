'use client';

import { useEffect, useState } from 'react';
// import CommentItem from './CommentItem';
import styles from './CommentList.module.css';

export default function Comments({ postId }) {
   const [comments, setComments] = useState([]); // top-level comments (each may have .replies array)
   const [count, setCount] = useState(0);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

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

   if (loading) return <div className={styles.loading}>Loading comments…</div>;
   if (error) return <div className={styles.error}>Error: {error}</div>;

   return (
      <div className={styles.commentsWrap}>
         <div className={styles.header}>
            <strong>{count}</strong> comment{count === 1 ? '' : 's'}
         </div>

         {comments.length === 0 ? (
            <div className={styles.empty}>
               No comments yet — be the first to comment!
            </div>
         ) : (
            <ul className={styles.list}>
               {comments.map((c) => (
                  // <CommentItem key={c._id || c.id} comment={c} level={0} />
                  <div key={c._id}>
                     <h3>{c.author.username}</h3>
                     <p>{c.text}</p>
                  </div>
               ))}
            </ul>
         )}
      </div>
   );
}
