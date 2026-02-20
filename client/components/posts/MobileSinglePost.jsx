import { useSwipeable } from 'react-swipeable';
import Image from 'next/image';
import PostLikeButton from './PostLikeButton';
import CommentList from '../comments/CommentList';
import PostDeleteButton from './PostDeleteButton';
import UserLink from '../user/UserLink';

import styles from './MobileSinglePost.module.css';
export default function MobileSinglePost({
   post,
   onClose,
   onDelete,
   handleNext,
   handlePrev,
}) {
   const swipeHandlers = useSwipeable({
      onSwipedLeft: () => handleNext && handleNext(),
      onSwipedRight: () => handlePrev && handlePrev(),
      preventScrollOnSwipe: true,
      trackTouch: true,
      trackMouse: false,
   });

   const date = new Date(post.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
   });

   return (
      <div className={styles.overlay}>
         <div className={styles.modal} {...swipeHandlers}>
            {/* Header */}
            <div className={styles.header}>
               <UserLink user={post.author} />
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

            {/* Likes and Date */}
            <div className={styles.likeWrapper}>
               <PostLikeButton post={post} />
               <p className={styles.date}>{date}</p>
            </div>

            {/* Comments */}
            <div className={styles.commentsSection}>
               <CommentList postId={post._id} />
            </div>

            {/* Delete (if yours) */}
            {onDelete && (
               <PostDeleteButton postId={post._id} onDelete={onDelete} />
            )}
         </div>
      </div>
   );
}
