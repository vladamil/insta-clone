'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfilePosts from '@/components/profile/ProfilePosts';
import ProfileFollowButton from '@/components/profile/ProfileFollowButton';

export default function ProfilePage() {
   const { username } = useParams();
   const router = useRouter();
   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [posts, setPosts] = useState([]);
   const [postsLoading, setPostsLoading] = useState(true);

   useEffect(() => {
      const fetchUserData = async () => {
         try {
            const token = sessionStorage.getItem('token');
            if (!token) return router.replace('/login');

            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}`,
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
            setLoading(false);
         }
      };

      fetchUserData();
   }, [username]);

   useEffect(() => {
      async function fetchPosts() {
         try {
            const token = sessionStorage.getItem('token');
            if (!token) return router.replace('/login');

            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}/posts`,
               {
                  headers: { Authorization: `Bearer ${token}` },
               }
            );
            const data = await res.json();

            setPosts(data.posts);
         } catch (err) {
            setError(err.message);
         } finally {
            setPostsLoading(false);
         }
      }
      fetchPosts();
   }, [username]);

   if (loading) return <div>LOADING!!!</div>;
   if (error) return <div>{error}</div>;
   if (!loading && !profile) return null;

   return (
      <div>
         <ProfileHeader
            username={profile.username}
            profilePicUrl={profile.profilePicUrl}
            description={profile.description}
         />
         <ProfileStats stats={profile.stats} />
         <ProfileFollowButton profile={profile} setProfile={setProfile} />
         <ProfilePosts posts={posts} loading={postsLoading} />
      </div>
   );
}
