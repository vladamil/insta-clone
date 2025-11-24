'use client';

import { useParams } from 'next/navigation';

export default function PostPage() {
   const postId = useParams().id;

   return (
      <>
         <div className="desktopModalWrapper">
            THIS IS DESKTOP POST WITH {postId}
         </div>

         <div className="mobileModalWrapper">
            THIS IS MOBILE POST WITH {postId}
         </div>
      </>
   );
}
