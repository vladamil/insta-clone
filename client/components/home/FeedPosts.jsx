'use client';

import { useState } from 'react';
import { useGetInfinitePosts } from '@/hooks/useGetInfinitePosts';
import Link from 'next/link';
import Image from 'next/image';
import { FaExclamationCircle, FaCamera } from 'react-icons/fa';
import SinglePostModal from '../posts/SinglePostModal';
import Spinner from '../common/Spinner';
import StatusPage from '../common/StatusPage';

import styles from '../profile/ProfilePosts.module.css';

export default function FeedPosts() {
   const [postIndex, setPostIndex] = useState(null);

   const { posts, loading, page, error, hasMore, loadMoreRef, nextPostsBatch } =
      useGetInfinitePosts({
         buildUrl: (page) =>
            `${process.env.NEXT_PUBLIC_API_URL}/api/posts/feed?page=${page}&limit=12`,
      });

   // Handle post link for both modal and new page
   const handlePostLink = (e, index) => {
      // Only left click, not middle-click, not ctrl-click, not cmd-click, not right-click
      if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
         e.preventDefault();
         setPostIndex(index);
      }
   };

   // Global loading only when first loading posts
   if (loading && page === 1)
      return (
         <div style={{ height: '70vh' }}>
            <Spinner />
         </div>
      );

   if (error)
      return (
         <StatusPage
            title={'Something Went Wrong'}
            text={`An unexpected error occurred (${error}). Please try again.`}
            icon={<FaExclamationCircle />}
         />
      );

   if (!posts) return null;

   // If no posts display message
   if (posts.length === 0 && !loading) {
      return (
         <div className={styles.noPosts}>
            <div className={styles.noPostsIcon}>
               <FaCamera />
            </div>
            <h3>No posts yet</h3>
         </div>
      );
   }

   // If there are posts, mapping them
   return (
      <>
         <div className={styles.grid}>
            {posts.map((post, index) => (
               <Link
                  key={post._id}
                  href={`/posts/${post._id}`}
                  className={styles.post}
                  onClick={(e) => handlePostLink(e, index)}
               >
                  <Image
                     src={post.imageUrl}
                     alt={post.caption || 'Post'}
                     fill
                     sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 400px"
                     className={styles.postImage}
                  />
                  <div className={styles.overlay}>
                     <span>❤️ {post.likesCount}</span>
                     <span>💬 {post.commentsCount}</span>
                  </div>
               </Link>
            ))}
         </div>

         {/* Sentinel for IntesectionObserver*/}
         {hasMore && <div ref={loadMoreRef} style={{ height: '10px' }} />}

         {/* Modal for VIEWING post */}
         {postIndex !== null && (
            <SinglePostModal
               index={postIndex}
               posts={posts}
               hasMore={hasMore}
               onDemandFetch={nextPostsBatch}
               onClose={() => {
                  setPostIndex(null);
               }}
            />
         )}
      </>
   );
}
