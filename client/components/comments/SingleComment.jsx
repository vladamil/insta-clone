'use client';
import Image from 'next/image';
import styles from './SingleComment.module.css';

export default function SingleComment({ comment, onReplyClick }) {
   const isReply = Boolean(comment.parentComment);

   return (
      <div className={`${styles.comment} ${isReply ? styles.reply : ''}`}>
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
                  onClick={() => onReplyClick(comment)}
               >
                  Reply
               </button>
            </div>

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
