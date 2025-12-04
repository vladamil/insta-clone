import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaCamera } from 'react-icons/fa';
import Image from 'next/image';
import { getValidToken } from '@/utils/getValidToken';
import CreatePostModal from '../posts/CreatePostModal';
import SinglePostModal from '../posts/SinglePostModal';
import PostsPagination from '../posts/PostsPagination';
import Spinner from '../common/Spinner';

import styles from './ProfilePosts.module.css';

export default function ProfilePosts({
   user,
   authLoading,
   refresh,
   triggerRefresh,
}) {
   const [posts, setPosts] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [showCreatePostModal, setShowCreatePostModal] = useState(false);
   const [postIndex, setPostIndex] = useState(null);
   // pagination states
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);

   useEffect(() => {
      if (authLoading) return;

      const token = getValidToken();
      if (!token) return;

      async function fetchPosts() {
         try {
            setLoading(true);
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?._id}/posts?page=${page}&limit=11`,
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
   }, [user, authLoading, refresh, page]);

   // Handle post link for both modal and new page
   const handlePostLink = (e, index) => {
      // Only left click, not middle-click, not ctrl-click, not cmd-click, not right-click
      if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
         e.preventDefault();
         setPostIndex(index);
      }
   };

   // Update posts UI based on creating post
   const handlePostCreated = (newPost) => {
      setPosts((prev) => [newPost, ...prev]); // instantly show it in UI
      triggerRefresh();
   };

   // Update posts UI based on deleting post
   const handlePostDeleted = (deletedId) => {
      setPosts((prev) => prev.filter((p) => p._id !== deletedId));
      setPostIndex(null);
      triggerRefresh();
   };

   if (loading)
      return (
         <div style={{ height: '100vh' }}>
            <Spinner />
         </div>
      );
   if (error) return <div>ERROR: {error}</div>;
   if (!posts) return null;

   // If no posts display button and message
   if (posts.length === 0)
      return (
         <>
            <div className={styles.noPosts}>
               <div className={styles.noPostsIcon}>📷</div>
               <h3>No posts yet</h3>
               <p>Share your first photo or memory!</p>
               <button
                  className={styles.addPostBtn}
                  onClick={() => setShowCreatePostModal(true)}
               >
                  + Create Post
               </button>
            </div>
            {/* Modal for ADDING new post */}
            <CreatePostModal
               isOpen={showCreatePostModal}
               onClose={() => setShowCreatePostModal(false)}
               onPostCreated={handlePostCreated}
            />
         </>
      );

   // If there are posts, mapping them
   return (
      <>
         <div className={styles.grid}>
            <div
               className={styles.addPostCard}
               onClick={() => setShowCreatePostModal(true)}
            >
               <FaCamera size={30} />
               <p className={styles.addPostText}>Add New Post</p>
            </div>

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

         {/* Modal for ADDING new post */}
         <CreatePostModal
            isOpen={showCreatePostModal}
            onClose={() => setShowCreatePostModal(false)}
            onPostCreated={handlePostCreated}
         />
         {/* Modal for VIEWING and DELETING post */}
         {postIndex !== null && (
            <SinglePostModal
               index={postIndex}
               posts={posts}
               onDelete={handlePostDeleted}
               onClose={() => {
                  setPostIndex(null);
                  triggerRefresh();
               }}
            />
         )}
      </>
   );
}
