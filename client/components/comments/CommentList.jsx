'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { FaCommentDots } from 'react-icons/fa';
import { getValidToken } from '@/utils/getValidToken';
import SingleComment from './SingleComment';
import CommentForm from './CommentForm';
import Spinner from '@/components/common/Spinner';

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
         const token = getValidToken();
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

      fetchComments();

      return () => {
         cancelledRef.current = true;
      };
   }, [fetchComments]);

   if (loading) return <Spinner />;
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
               <FaCommentDots size={40} style={{ marginBottom: '20px' }} />
               <p>No comments yet — be the first to comment!</p>
            </div>
         ) : (
            <ul className={styles.list}>
               {comments.map((c) => (
                  <SingleComment
                     key={c._id}
                     comment={c}
                     fetchComments={fetchComments}
                  />
               ))}
            </ul>
         )}
      </div>
   );
}
