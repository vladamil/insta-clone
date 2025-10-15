'use client';
import { useState } from 'react';
import Image from 'next/image';
import styles from './SingleComment.module.css';
import CommentForm from './CommentForm';

export default function SingleComment({ comment, onReplyClick }) {
   const [showReplyBox, setShowReplyBox] = useState(false);

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

            <p className={styles.text}>{comment.text}</p>

            <div className={styles.actions}>
               <button
                  className={styles.replyBtn}
                  onClick={() => {
                     setShowReplyBox(true);
                  }}
               >
                  Reply
               </button>
            </div>

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
