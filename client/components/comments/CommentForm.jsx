'use client';

import { useState, useEffect } from 'react';
import { getValidToken } from '@/utils/getValidToken';

import styles from './CommentForm.module.css';

export default function CommentForm({
   mode = 'create',
   fetchComments,
   initialText,
   onCancel,
   postId,
   commentId,
}) {
   const [commentText, setCommentText] = useState(initialText || '');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   //    Depending on mode, button and placeholder text
   const placeholders = {
      create: 'Write a comment...',
      edit: 'Edit your comment...',
      reply: 'Write a reply...',
   };

   const buttonLabels = {
      create: 'Post',
      edit: 'Save',
      reply: 'Reply',
   };

   // Depending on mode, set url, method and body of HTTP request
   let url, method, body;

   if (mode === 'create') {
      url = `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comment`;
      method = 'POST';
      body = { text: commentText };
   } else if (mode === 'reply') {
      url = `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}/reply`;
      method = 'POST';
      body = { text: commentText };
   } else if (mode === 'edit') {
      url = `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`;
      method = 'PATCH';
      body = { text: commentText };
   }

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!commentText.trim()) return;

      if (commentText.trim().length > 300) {
         setError('Comment is too long (max 300 characters)');
         return;
      }

      setLoading(true);
      setError(null);

      try {
         const token = getValidToken();

         const res = await fetch(url, {
            method,
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
         });

         const data = await res.json();
         if (!res.ok) throw new Error(data.error || 'Failed to add comment');

         setCommentText('');
         await fetchComments(); // Refresh comments after success
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   // Automatically clear error after 5s (for display error)
   useEffect(() => {
      if (error) {
         const timer = setTimeout(() => setError(null), 3000);
         return () => clearTimeout(timer);
      }
   }, [error]);

   if (error)
      return <p className={styles.errorMsg}>Something went wrong: {error}.</p>;

   return (
      <form
         className={`${styles.form} ${
            mode === 'reply' ? styles.replyMode : ''
         }`}
         onSubmit={handleSubmit}
      >
         <textarea
            className={styles.textarea}
            placeholder={placeholders[mode]}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
         />
         <div className={styles.actions}>
            {onCancel && (
               <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={onCancel}
               >
                  Cancel
               </button>
            )}
            <button
               type="submit"
               className={styles.submitBtn}
               disabled={loading || !commentText.trim()}
            >
               {buttonLabels[mode]}
            </button>
         </div>
      </form>
   );
}
