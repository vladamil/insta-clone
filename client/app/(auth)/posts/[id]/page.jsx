'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FaVideoSlash } from 'react-icons/fa';

import { getValidToken } from '@/utils/getValidToken';
import DesktopPostPage from '@/components/postPage/DesktopPostPage';
import MobilePostPage from '@/components/postPage/MobilePostPage';
import Spinner from '@/components/common/Spinner';
import StatusPage from '@/components/common/StatusPage';

export default function PostPage() {
   const postId = useParams().id;

   const [post, setPost] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [notFound, setNotFound] = useState(false);

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

            if (!res.ok && res.status === 404) {
               setNotFound(true);
            }

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
   if (notFound)
      return (
         <StatusPage
            title={'Post Not Found'}
            text={'The post doesn’t exist or has been deleted.'}
            icon={<FaVideoSlash />}
            button={true}
         />
      );
   if (error)
      return (
         <StatusPage
            title={'Something Went Wrong'}
            text={`Could not fetch posts (${error}). Please, try again.`}
            icon={<FaVideoSlash />}
            button={true}
         />
      );
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
