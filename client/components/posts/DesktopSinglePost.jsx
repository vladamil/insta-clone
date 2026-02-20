import Image from 'next/image';
import PostLikeButton from './PostLikeButton';
import CommentList from '../comments/CommentList';
import PostDeleteButton from './PostDeleteButton';
import UserLink from '../user/UserLink';

import styles from './DesktopSinglePost.module.css';
export default function DesktopSinglePost({
   post,
   onClose,
   onDelete,
   handleNext,
   handlePrev,
   hasNext,
   hasPrev,
   hasMore,
}) {
   const date = new Date(post.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
   });
   return (
      <div className={styles.overlay}>
         <div className={styles.modal}>
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
                  <UserLink user={post.author} />
                  <button className={styles.closeBtn} onClick={onClose}>
                     ✕
                  </button>
               </div>

               {post.caption && (
                  <p className={styles.caption}>{post.caption}</p>
               )}

               <div className={styles.likeWrapper}>
                  <PostLikeButton post={post} />
                  <p className={styles.date}>{date}</p>
               </div>

               <CommentList postId={post._id} />

               {/* Delete button visible only if allowed */}
               {onDelete && (
                  <PostDeleteButton postId={post._id} onDelete={onDelete} />
               )}
            </div>
         </div>

         {/* Prev/Next Buttons */}
         {hasPrev && (
            <button
               className={`${styles.navBtn} ${styles.prevBtn}`}
               onClick={handlePrev}
            >
               ◀
            </button>
         )}
         {(hasNext || hasMore) && (
            <button
               className={`${styles.navBtn} ${styles.nextBtn}`}
               onClick={handleNext}
            >
               ▶
            </button>
         )}
      </div>
   );
}
