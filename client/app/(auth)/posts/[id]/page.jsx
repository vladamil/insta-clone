'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getValidToken } from '@/utils/getValidToken';

import DesktopPostPage from '@/components/postPage/DesktopPostPage';
import MobilePostPage from '@/components/postPage/MobilePostPage';
import Spinner from '@/components/common/Spinner';

export default function PostPage() {
   const postId = useParams().id;

   const [post, setPost] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchPostData = async () => {
         try {
            const token = getValidToken();
            setLoading(true);

            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`,
               {
                  headers: { Authorization: `Bearer ${token}` },
               }
            );
            const data = await res.json();

            if (!res.ok) {
               throw new Error(data.error);
            }

            setPost(data);
         } catch (error) {
            setError(error.message);
            setPost(null);
         } finally {
            setLoading(false);
         }
      };

      fetchPostData();
   }, [postId]);

   if (loading) return <Spinner />;
   if (error) return <div>ERROR: {error}</div>;
   if (!loading && !post) return null;

   return (
      <>
         <div className="desktopModalWrapper">
            <DesktopPostPage post={post} />
         </div>

         <div className="mobileModalWrapper">
            <MobilePostPage post={post} />
         </div>
      </>
   );
}
