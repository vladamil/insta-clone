'use client';
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import MobileSinglePost from './MobileSinglePost';
import DesktopSinglePost from './DesktopSinglePost';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

const SinglePostModal = ({
   index,
   posts,
   onClose,
   onDelete,
   hasMore,
   onDemandFetch,
}) => {
   const [postIndex, setPostIndex] = useState(index);
   // REF flag to show exactly when we should fetch new posts
   const fetchPostsRef = useRef(false);
   useLockBodyScroll(true);

   const post = posts[postIndex];
   if (!post) return;

   const hasPrev = postIndex > 0;
   const hasNext = postIndex < posts.length - 1;
   const atEnd = postIndex === posts.length - 1;

   const handlePrev = () => {
      if (hasPrev) setPostIndex((prev) => prev - 1);
   };

   const handleNext = async () => {
      if (hasNext) setPostIndex((prev) => prev + 1);
      else if (atEnd && hasMore) {
         fetchPostsRef.current = true;
         onDemandFetch();
      }
   };

   // Setting postIndex +1 AFTER new page loads (posts.length changes)
   useEffect(() => {
      if (!fetchPostsRef.current) return;

      if (fetchPostsRef.current) {
         fetchPostsRef.current = false;
         setPostIndex((prev) => prev + 1);
      }
   }, [posts.length]);

   // Using Arrow keys and Esc key to navigate posts
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (e.key === 'ArrowLeft') {
            handlePrev();
         } else if (e.key === 'ArrowRight') {
            handleNext();
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
   }, [handlePrev, handleNext, onClose]);

   console.log(postIndex);
   console.log('Lenght', posts.length - 1);

   const modalContent = (
      <>
         <div className="desktopModalWrapper">
            <DesktopSinglePost
               post={post}
               onClose={onClose}
               handlePrev={handlePrev}
               handleNext={handleNext}
               hasPrev={hasPrev}
               hasNext={hasNext}
               hasMore={hasMore}
               onDelete={onDelete}
            />
         </div>

         <div className="mobileModalWrapper">
            <MobileSinglePost
               post={post}
               onClose={onClose}
               handlePrev={handlePrev}
               handleNext={handleNext}
               onDelete={onDelete}
            />
         </div>
      </>
   );
   return ReactDOM.createPortal(modalContent, document.body);
};

export default SinglePostModal;
