import Image from 'next/image';
import styles from './MobileSinglePost.module.css';
import PostLikeButton from './PostLikeButton';
import CommentList from '../comments/CommentList';
import PostDeleteButton from './PostDeleteButton';

export default function MobileSinglePost({
   post,
   onClose,
   onDelete,
   handleNext,
   handlePrev,
   hasNext,
   hasPrev,
}) {
   return (
      <div className={styles.overlay}>
         <div className={styles.modal}>
            {/* Header */}
            <div className={styles.header}>
               <div className={styles.userRow}>
                  <Image
                     src={post.author.profilePicUrl || '/default-avatar.png'}
                     alt={post.author.username}
                     width={36}
                     height={36}
                     className={styles.avatar}
                  />
                  <span className={styles.username}>
                     {post.author.username}
                  </span>
               </div>

               <button className={styles.closeBtn} onClick={onClose}>
                  ✕
               </button>
            </div>

            {/* Image */}
            <div className={styles.imageWrapper}>
               <Image
                  src={post.imageUrl}
                  alt={post.caption || 'Post image'}
                  fill
                  className={styles.image}
               />
            </div>

            {/* Caption */}
            {post.caption && <p className={styles.caption}>{post.caption}</p>}

            {/* Likes */}
            <PostLikeButton post={post} />

            {/* Comments */}
            <div className={styles.commentsSection}>
               <CommentList postId={post._id} />
            </div>

            {/* Delete (if yours) */}
            {onDelete && (
               <PostDeleteButton postId={post._id} onDelete={onDelete} />
            )}

            {/* Prev/next arrows */}
            {hasPrev && (
               <button className={styles.prevBtn} onClick={handlePrev}>
                  ◀
               </button>
            )}
            {hasNext && (
               <button className={styles.nextBtn} onClick={handleNext}>
                  ▶
               </button>
            )}
         </div>
      </div>
   );
}
