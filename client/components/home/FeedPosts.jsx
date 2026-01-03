'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { FaExclamationCircle } from 'react-icons/fa';
import PostsPagination from '../posts/PostsPagination';
import SinglePostModal from '../posts/SinglePostModal';
import Spinner from '../common/Spinner';
import StatusPage from '../common/StatusPage';

import styles from '../profile/ProfilePosts.module.css';

export default function FeedPosts() {
   const [posts, setPosts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [postIndex, setPostIndex] = useState(null);
   const [refresh, setRefresh] = useState(0);

   // pagination states
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);

   const { getValidToken } = useAuth();

   useEffect(() => {
      async function fetchFeedPosts() {
         try {
            setLoading(true);
            const token = getValidToken();

            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/posts/feed?page=${page}&limit=12`,
               {
                  headers: { Authorization: `Bearer ${token}` },
               }
            );
            const data = await res.json();

            if (!res.ok) {
               throw new Error(data.error);
            }

            setPosts(data.posts);
            setTotalPages(data.totalPages);
         } catch (err) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      }
      fetchFeedPosts();
   }, [page, refresh]);

   // Handle post link for both modal and new page
   const handlePostLink = (e, index) => {
      // Only left click, not middle-click, not ctrl-click, not cmd-click, not right-click
      if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
         e.preventDefault();
         setPostIndex(index);
      }
   };

   if (loading)
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
            <div className={styles.noPostsIcon}>📷</div>
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

         {/* PAGINATION BUTTONS */}
         {totalPages > 1 && (
            <PostsPagination
               page={page}
               setPage={setPage}
               totalPages={totalPages}
            />
         )}

         {/* Modal for VIEWING post */}
         {postIndex !== null && (
            <SinglePostModal
               index={postIndex}
               posts={posts}
               onClose={() => {
                  setPostIndex(null);
                  setRefresh((prev) => prev + 0.01);
               }}
            />
         )}
      </>
   );
}
