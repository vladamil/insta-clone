'use client';

import { useState } from 'react';
import styles from './CommentForm.module.css';

export default function CommentForm({
   mode = 'create',
   fetchComments,
   initialText,
   onCancel,
   postId,
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

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!commentText.trim()) return;

      setLoading(true);
      setError(null);

      try {
         const token = sessionStorage.getItem('token');
         if (!token) return;

         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comment`,
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify({ text: commentText }),
            }
         );

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
