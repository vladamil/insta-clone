import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

   if (loading && posts.length === 0) return <p>Loading...</p>;
   if (error && !loading) return <div>ERROR: {error}</div>;
   if (!loading && !posts) return null;

   return <div>YOUR POSTS: {posts.length}</div>;
}
