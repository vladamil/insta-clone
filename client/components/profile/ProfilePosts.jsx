import { useState } from 'react';
import { useGetInfinitePosts } from '@/hooks/useGetInfinitePosts';
import Link from 'next/link';
import { FaCamera, FaExclamationCircle } from 'react-icons/fa';
import Image from 'next/image';
import CreatePostModal from '../posts/CreatePostModal';
import SinglePostModal from '../posts/SinglePostModal';
import Spinner from '../common/Spinner';
import StatusPage from '../common/StatusPage';

import styles from './ProfilePosts.module.css';

export default function ProfilePosts({ user, triggerRefresh }) {
   const [showCreatePostModal, setShowCreatePostModal] = useState(false);
   const [postIndex, setPostIndex] = useState(null);

   const {
      posts,
      loading,
      page,
      error,
      hasMore,
      loadMoreRef,
      nextPostsBatch,
      refreshPosts,
   } = useGetInfinitePosts({
      buildUrl: (page) =>
         `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?._id}/posts?page=${page}&limit=11`,
   });

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
      triggerRefresh();
      refreshPosts();
   };

   // Update posts UI based on deleting post
   const handlePostDeleted = (deletedId) => {
      setPostIndex(null);
      triggerRefresh();
      refreshPosts();
   };

   if (loading && page === 1)
      return (
         <div style={{ height: '100vh' }}>
            <Spinner />
         </div>
      );
   if (error)
      return (
         <StatusPage
            title={'Something Went Wrong'}
            text={`Could not fetch user posts (${error}). Please try again.`}
            icon={<FaExclamationCircle />}
         />
      );
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

         {/* Sentinel for IntesectionObserver*/}
         {hasMore && <div ref={loadMoreRef} style={{ height: '10px' }} />}

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
               hasMore={hasMore}
               onDemandFetch={nextPostsBatch}
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
