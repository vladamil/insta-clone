'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import SingleComment from './SingleComment';
import CommentForm from './CommentForm';
import styles from './CommentList.module.css';

export default function CommentList({ postId }) {
   const [comments, setComments] = useState([]);
   const [count, setCount] = useState(0);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const cancelledRef = useRef(false); // Flag to prevent memory leak

   const fetchComments = useCallback(async () => {
      if (!postId) return;

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

         if (!res.ok) throw new Error(data.error || 'Failed to fetch comments');

         if (!cancelledRef.current) {
            setComments(data.comments || []);
            setCount(data.commentsCount || 0);
         }
      } catch (err) {
         if (!cancelledRef.current) setError(err.message);
      } finally {
         if (!cancelledRef.current) setLoading(false);
      }
   }, [postId]);

   useEffect(() => {
      cancelledRef.current = false;

      // const fetchComments = async () => {
      //    setLoading(true);
      //    setError(null);
      //    try {
      //       const token = sessionStorage.getItem('token');
      //       const res = await fetch(
      //          `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comments`,
      //          {
      //             headers: token ? { Authorization: `Bearer ${token}` } : {},
      //          }
      //       );

      //       const data = await res.json();

      //       if (!res.ok)
      //          throw new Error(data.error || 'Failed to fetch comments');

      //       if (!cancelled) {
      //          setComments(data.comments || []);
      //          setCount(data.commentsCount || 0);
      //       }
      //    } catch (err) {
      //       if (!cancelled) setError(err.message);
      //    } finally {
      //       if (!cancelled) setLoading(false);
      //    }
      // };

      // fetchComments();

      // return () => {
      //    cancelled = true;
      // };

      fetchComments();

      return () => {
         cancelledRef.current = true;
      };
   }, [fetchComments]);

   if (loading) return <div className={styles.loading}>Loading comments…</div>;
   if (error) return <div className={styles.error}>Error: {error}</div>;

   return (
      <div className={styles.commentsWrap}>
         <div className={styles.header}>
            <strong>{count}</strong> comment{count === 1 ? '' : 's'}
         </div>

         {/* Form for adding new comment (mode === 'create' /default) */}
         <CommentForm fetchComments={fetchComments} postId={postId} />

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
