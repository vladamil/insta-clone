'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import PostsPagination from '../posts/PostsPagination';
import SinglePostModal from '../posts/SinglePostModal';

import styles from '../profile/ProfilePosts.module.css';

export default function UserPosts({ id }) {
   const [posts, setPosts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [postIndex, setPostIndex] = useState(null);
   const [refresh, setRefresh] = useState(0);

   // pagination states
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);

   useEffect(() => {
      async function fetchPosts() {
         try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            if (!token) return;

            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/posts?page=${page}&limit=12`,
               {
                  headers: { Authorization: `Bearer ${token}` },
               }
            );
            const data = await res.json();

            setPosts(data.posts);
            setTotalPages(data.totalPages);
         } catch (err) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      }
      fetchPosts();
   }, [id, page, refresh]);

   if (loading) return <p>Loading...</p>;
   if (error) return <div>ERROR: {error}</div>;
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
               <div
                  key={post._id}
                  className={styles.post}
                  onClick={() => {
                     setPostIndex(index);
                  }}
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
               </div>
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
