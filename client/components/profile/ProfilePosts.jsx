import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CreatePostModal from '../posts/CreatePostModal';
import SinglePostModal from '../posts/SinglePostModal';
import styles from './ProfilePosts.module.css';

export default function ProfilePosts({ user, authLoading, onOpenModal }) {
   const [posts, setPosts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [showModal, setShowModal] = useState(false);

   const router = useRouter();

   useEffect(() => {
      if (authLoading) return;

      if (!user) {
         router.replace('/login');
         return;
      }
      const token = sessionStorage.getItem('token');
      if (!token) return router.replace('/login');

      async function fetchPosts() {
         try {
            setLoading(true);
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.username}/posts`,
               {
                  headers: { Authorization: `Bearer ${token}` },
               }
            );
            const data = await res.json();
            setPosts(data.posts);
         } catch (err) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      }

      fetchPosts();
   }, [user, authLoading]);

   // Callback passed to modal
   const handlePostCreated = (newPost) => {
      setPosts((prev) => [newPost, ...prev]); // instantly show it in UI
   };

   if (loading) return <p>Loading...</p>;
   if (error) return <div>ERROR: {error}</div>;
   if (!posts) return null;

   // If no posts display button and message
   if (posts.length === 0)
      return (
         <div className={styles.noPosts}>
            <div className={styles.noPostsIcon}>📷</div>
            <h3>No posts yet</h3>
            <p>Share your first photo or memory!</p>
            <button className={styles.addPostBtn}>+ Create Post</button>
         </div>
      );

   // If there are posts, mapping them
   return (
      <>
         <div className={styles.grid}>
            <div
               className={styles.addPostCard}
               onClick={() => setShowModal(true)}
            >
               <p>PLUS</p>
               <p className={styles.addPostText}>Add Post</p>
            </div>

            {posts.map((post) => (
               <div key={post._id} className={styles.post}>
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

         {/* Modal for adding new post */}
         <CreatePostModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onPostCreated={handlePostCreated}
         />
         <SinglePostModal post={posts[5]} onDelete={true} />
      </>
   );
}
