'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import styles from './SingleComment.module.css';
import CommentForm from './CommentForm';

export default function SingleComment({
   comment,
   onReplyClick,
   fetchComments,
}) {
   const [showReplyBox, setShowReplyBox] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const [deleteError, setDeleteError] = useState(null);

   const { user } = useAuth();
   const isAuthor = user._id === comment.author._id;

   // Delete comment handler
   const handleDelete = async () => {
      if (
         !confirm(
            'Are you sure you want to delete this comment and all its replies?'
         )
      )
         return;

      try {
         setIsDeleting(true);
         setDeleteError(null);

         const token = sessionStorage.getItem('token');
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${comment._id}`,
            {
               method: 'DELETE',
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );

         const data = await res.json();

         if (!res.ok) throw new Error(data.error || 'Failed to delete comment');

         // Re-fetch all comments after successful delete
         await fetchComments();
      } catch (err) {
         setDeleteError('Failed to delete comment. Please try again.');
      } finally {
         setIsDeleting(false);
      }
   };

   // Automatically clear error after 5s (for display error)
   useEffect(() => {
      if (deleteError) {
         const timer = setTimeout(() => setDeleteError(null), 5000);
         return () => clearTimeout(timer);
      }
   }, [deleteError]);

   return (
      <div className={`${styles.comment}`}>
         <div className={styles.avatarWrapper}>
            <Image
               src={comment.author.profilePicUrl || '/default-avatar.png'}
               alt={comment.author.username}
               width={36}
               height={36}
               className={styles.avatar}
            />
         </div>

         <div className={styles.content}>
            <div className={styles.header}>
               <span className={styles.username}>
                  {comment.author.username}
               </span>
               {comment.replyToUsername && (
                  <span className={styles.replyingTo}>
                     → @{comment.replyToUsername}
                  </span>
               )}
            </div>

            {/* If editing show edit form / if not show comment text */}
            {isEditing ? (
               <CommentForm
                  mode="edit"
                  initialText={comment.text}
                  commentId={comment._id}
                  fetchComments={fetchComments}
                  onCancel={() => setIsEditing(false)}
               />
            ) : (
               <p className={styles.text}>{comment.text}</p>
            )}

            {!isEditing && (
               <div className={styles.actions}>
                  <button
                     className={styles.actionBtn}
                     onClick={() => {
                        setShowReplyBox(true);
                     }}
                  >
                     Reply
                  </button>

                  {isAuthor && (
                     <>
                        <button
                           className={styles.actionBtn}
                           onClick={() => setIsEditing(true)}
                        >
                           Edit
                        </button>
                        <button
                           className={`${styles.actionBtn} ${styles.deleteBtn}`}
                           onClick={handleDelete}
                           disabled={isDeleting}
                        >
                           Delete
                        </button>
                     </>
                  )}
               </div>
            )}
            {deleteError && <p className={styles.errorMsg}>{deleteError}</p>}
            {showReplyBox && (
               <CommentForm
                  mode="reply"
                  onCancel={() => setShowReplyBox(false)}
                  commentId={comment._id}
                  fetchComments={fetchComments}
               />
            )}

            {/* Replies under this comment */}
            {comment.replies?.length > 0 && (
               <div className={styles.repliesContainer}>
                  {comment.replies.map((reply) => (
                     <SingleComment
                        key={reply._id}
                        comment={reply}
                        onReplyClick={onReplyClick}
                        fetchComments={fetchComments}
                     />
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
