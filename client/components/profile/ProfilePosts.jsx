import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './ProfilePosts.module.css';

export default function ProfilePosts({ user, authLoading }) {
   const [posts, setPosts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

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

   if (loading) return <p>Loading...</p>;
   if (error) return <div>ERROR: {error}</div>;
   if (!posts) return null;

   return (
      <div className={styles.grid}>
         <div
            className={styles.addPostCard}
            onClick={() => console.log('OPEN POST MODAL')}
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
   );
}
