'use client';

import { useState } from 'react';
import styles from './CommentForm.module.css';

export default function CommentForm({
   mode = 'create',
   onSubmit,
   initialText = '',
   onCancel,
}) {
   const [commentText, setCommentText] = useState(initialText);
   const [loading, setLoading] = useState(false);

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

   const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Form Submited!');
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
