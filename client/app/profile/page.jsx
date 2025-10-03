'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
   const [profile, setProfile] = useState(null);
   const [posts, setPosts] = useState([]);
   const [loadingProfile, setLoadingProfile] = useState(true);
   const [loadingPosts, setLoadingPosts] = useState(true);
   const [error, setError] = useState(null);

   const { user, logout, loading: authLoading } = useAuth();
   const router = useRouter();

   useEffect(() => {
      if (authLoading) return;

      if (!user) {
         router.replace('/login');
         return;
      }

      const token = sessionStorage.getItem('token');
      if (!token) return router.replace('/login');

      const fetchUserData = async () => {
         try {
            setLoadingProfile(true);
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.username}`,
               {
                  headers: { Authorization: `Bearer ${token}` },
               }
            );
            const data = await res.json();

            if (!res.ok) {
               throw new Error(data.error);
            }

            setProfile(data);
         } catch (error) {
            setError(error.message);
            setProfile(null);
         } finally {
            setLoadingProfile(false);
         }
      };

      async function fetchPosts() {
         try {
            setLoadingPosts(true);

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
            setLoadingPosts(false);
         }
      }

      fetchUserData();
      fetchPosts();
   }, [user, authLoading]);

   console.log(error);

   if (loadingProfile && !profile) return <p>Loading...</p>;
   if (error && !loadingProfile) return <div>ERROR: {error}</div>;
   if (!loadingProfile && !profile) return null;

   return (
      <div>
         <div>Hello, {profile.username}</div>
         <div>You have {posts.length} posts</div>
         <button onClick={logout}>Logout</button>
      </div>
   );
}
