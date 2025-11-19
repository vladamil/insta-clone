'use client';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Image from 'next/image';
import CommentList from '../comments/CommentList';
import PostLikeButton from './PostLikeButton';
import styles from './SinglePostModal.module.css';
import PostDeleteButton from './PostDeleteButton';
import MobileSinglePost from './MobileSinglePost';

const SinglePostModal = ({ index, posts, onClose, onDelete }) => {
   const [postIndex, setPostIndex] = useState(index);

   const post = posts[postIndex];
   if (!post) return;

   const hasPrev = postIndex > 0;
   const hasNext = postIndex < posts.length - 1;

   // Using Arrow keys and Esc key to navigate posts
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (e.key === 'ArrowLeft') {
            if (hasPrev) {
               setPostIndex((prev) => prev - 1);
            }
         } else if (e.key === 'ArrowRight') {
            if (hasNext) {
               setPostIndex((prev) => prev + 1);
            }
         } else if (e.key === 'Escape') {
            onClose();
         }
      };

      // Attach listener
      window.addEventListener('keydown', handleKeyDown);

      // Cleanup when modal unmounts
      return () => {
         window.removeEventListener('keydown', handleKeyDown);
      };
   }, [hasPrev, hasNext, onClose]);

   const handlePrev = () => {
      if (hasPrev) setPostIndex((prev) => prev - 1);
   };

   const handleNext = () => {
      if (hasNext) setPostIndex((prev) => prev + 1);
   };

   const modalContent = (
      <>
         <div className="desktopModalWrapper">
            <div className={styles.overlay}>
               {hasPrev && (
                  <button
                     className={`${styles.navBtn} ${styles.prevBtn}`}
                     onClick={handlePrev}
                  >
                     ◀
                  </button>
               )}

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
                           src={
                              post.author.profilePicUrl || '/default-avatar.png'
                           }
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

                     <PostLikeButton post={post} />

                     <CommentList postId={post._id} />

                     {/* Delete button visible only if allowed */}
                     {onDelete && (
                        <PostDeleteButton
                           postId={post._id}
                           onDelete={onDelete}
                        />
                     )}
                  </div>
               </div>
               {hasNext && (
                  <button
                     className={`${styles.navBtn} ${styles.nextBtn}`}
                     onClick={handleNext}
                  >
                     ▶
                  </button>
               )}
            </div>
         </div>
         <div className="mobileModalWrapper">
            <MobileSinglePost
               post={post}
               onClose={onClose}
               handlePrev={handlePrev}
               handleNext={handleNext}
               onDelete={true}
            />
         </div>
      </>
   );
   return ReactDOM.createPortal(modalContent, document.body);
};

export default SinglePostModal;
