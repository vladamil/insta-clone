'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { getValidToken } from '@/utils/getValidToken';
import PostLikeButton from '@/components/posts/PostLikeButton';
import CommentList from '@/components/comments/CommentList';
import UserLink from '@/components/user/UserLink';

import styles from '@/components/posts/DesktopSinglePost.module.css';

export default function PostPage() {
   const postId = useParams().id;

   const [post, setPost] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchPostData = async () => {
         try {
            setLoading(true);
            const token = getValidToken();

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

   if (loading) return <p>Loading DATA</p>;
   if (error) return <div>ERROR: {error}</div>;
   if (!loading && !post) return null;

   return (
      <>
         <div className="desktopModalWrapper">
            <div
               style={{
                  display: 'flex',
                  padding: '60px 30px',
                  height: '100vh',
               }}
            >
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
                  </div>

                  {post.caption && (
                     <p className={styles.caption}>{post.caption}</p>
                  )}

                  <PostLikeButton post={post} />

                  <CommentList postId={post._id} />
               </div>
            </div>
         </div>

         <div className="mobileModalWrapper">
            THIS IS MOBILE POST WITH {postId}
         </div>
      </>
   );
}
