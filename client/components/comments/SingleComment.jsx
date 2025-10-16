'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import styles from './SingleComment.module.css';
import CommentForm from './CommentForm';

export default function SingleComment({ comment, onReplyClick }) {
   const [showReplyBox, setShowReplyBox] = useState(false);
   const [isEditing, setIsEditing] = useState(false);

   const { user } = useAuth();
   const isAuthor = user._id === comment.author._id;

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
                           onClick={() => console.log('Delete clicked!')}
                        >
                           Delete
                        </button>
                     </>
                  )}
               </div>
            )}

            {showReplyBox && (
               <CommentForm
                  mode="reply"
                  onCancel={() => setShowReplyBox(false)}
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
                     />
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
