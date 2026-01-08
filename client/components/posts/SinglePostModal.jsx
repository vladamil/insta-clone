'use client';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import MobileSinglePost from './MobileSinglePost';
import DesktopSinglePost from './DesktopSinglePost';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

const SinglePostModal = ({ index, posts, onClose, onDelete }) => {
   const [postIndex, setPostIndex] = useState(index);
   useLockBodyScroll(true);

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
            <DesktopSinglePost
               post={post}
               onClose={onClose}
               handlePrev={handlePrev}
               handleNext={handleNext}
               hasPrev={hasPrev}
               hasNext={hasNext}
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
