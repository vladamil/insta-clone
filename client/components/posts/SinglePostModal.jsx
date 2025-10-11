'use client';
import Image from 'next/image';
import styles from './SinglePostModal.module.css';

const SinglePostModal = ({ post, onClose, onDelete }) => {
   if (!post) return null;

   return (
      <div className={styles.overlay}>
         <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={onClose}>
               X
            </button>

            <div className={styles.imageWrapper}>
               <Image
                  src={post.imageUrl}
                  alt={post.caption || 'Post image'}
                  fill
                  className={styles.image}
               />
            </div>

            <div className={styles.details}>
               <div className={styles.header}>
                  <Image
                     src={post.author.profilePicUrl || '/default-avatar.png'}
                     alt={post.author.username}
                     width={40}
                     height={40}
                     className={styles.avatar}
                  />
                  <span className={styles.username}>
                     {post.author.username}
                  </span>
               </div>

               {post.caption && (
                  <p className={styles.caption}>{post.caption}</p>
               )}

               <div className={styles.actions}>
                  <button className={styles.likeBtn}>
                     ❤️ {post.likes?.length || 0}
                  </button>
                  <button className={styles.commentBtn}>
                     💬 {post.comments?.length || 0}
                  </button>
               </div>

               {/* Delete button visible only if allowed */}
               {onDelete && (
                  <button
                     className={styles.deleteBtn}
                     onClick={() => onDelete(post._id)}
                  >
                     Delete Post
                  </button>
               )}
            </div>
         </div>
      </div>
   );
};

export default SinglePostModal;
