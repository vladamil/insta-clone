'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import UserHeader from '@/components/user/UserHeader';
// import ProfilePosts from '@/components/user/ProfilePosts';
// import ProfileFollowButton from '@/components/user/ProfileFollowButton';

import styles from './UserPage.module.css';

export default function ProfilePage() {
   const { slug } = useParams();
   const router = useRouter();

   // const [posts, setPosts] = useState([]);
   // const [postsLoading, setPostsLoading] = useState(true);

   const id = slug.split('-').pop();

   // useEffect(() => {
   //    async function fetchPosts() {
   //       try {
   //          const token = sessionStorage.getItem('token');
   //          if (!token) return router.replace('/login');

   //          const res = await fetch(
   //             `${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/posts`,
   //             {
   //                headers: { Authorization: `Bearer ${token}` },
   //             }
   //          );
   //          const data = await res.json();

   //          setPosts(data.posts);
   //       } catch (err) {
   //          setError(err.message);
   //       } finally {
   //          setPostsLoading(false);
   //       }
   //    }
   //    fetchPosts();
   // }, [username]);

   // if (loading) return <div>LOADING!!!</div>;
   // if (error) return <div>{error}</div>;
   // if (!loading && !profile) return null;

   return (
      <div className={styles.container}>
         <UserHeader id={id} />
      </div>
   );
}
