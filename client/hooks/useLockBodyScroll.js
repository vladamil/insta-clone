import { useEffect } from 'react';

export function useLockBodyScroll(openModal) {
   useEffect(() => {
      if (!openModal) return;

      const scrollY = window.scrollY;
      const scrollbarWidth =
         window.innerWidth - document.documentElement.clientWidth;

      // Lock scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      // Prevent layout shift
      if (scrollbarWidth > 0) {
         document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
         // Restore
         document.body.style.position = '';
         document.body.style.top = '';
         document.body.style.width = '';
         document.body.style.paddingRight = '';

         window.scrollTo(0, scrollY);
      };
   }, [openModal]);
}
