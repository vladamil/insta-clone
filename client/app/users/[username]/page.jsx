'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfilePosts from '@/components/profile/ProfilePosts';

export default function ProfilePage() {
   const { username } = useParams();
   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchUserData = async () => {
         try {
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}`
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

   if (loading) return <div>LOADING!!!</div>;
   if (error) return <div>{error}</div>;

   return (
      <div>
         <ProfileHeader
            username={profile.username}
            profilePicUrl={profile.profilePicUrl}
            description={profile.description}
         />
         <ProfileStats stats={profile.stats} />
         <ProfilePosts posts={profile.postsPrewiev} />
      </div>
   );
}
