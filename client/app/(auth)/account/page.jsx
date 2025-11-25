'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaCheck } from 'react-icons/fa';

import UpdateProfilePic from '@/components/account/UpdateProfilePic';
import UpdateUsername from '@/components/account/UpdateUsername';
import UpdateEmail from '@/components/account/UpdateEmail';
import UpdateDescription from '@/components/account/UpdateDescription';
import DeleteAccount from '@/components/account/DeleteAccount';
import UpdatePassword from '@/components/account/UpdatePassword';

import styles from './AccountPage.module.css';

export default function AccountPage() {
   const { user, loading, authError } = useAuth();
   const [userData, setUserData] = useState(user);
   const [loadData, setLoadData] = useState(false);
   const [error, setError] = useState(null);
   const router = useRouter();

   useEffect(() => {
      if (loading) return;

      const fetchUserData = async () => {
         try {
            setLoadData(true);
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?._id}`,
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );

            if (!res.ok) throw new Error('Failed to fetch user data');
            const data = await res.json();
            setUserData(data);
         } catch (err) {
            setError(err.message);
         } finally {
            setLoadData(false);
         }
      };

      fetchUserData();
   }, [user, loading]);

   if (loading && !user) return <div>LOADING...</div>;
   if (loadData) return <div>LOADING...</div>;
   if (!loading && !user) return null;
   if (authError || error)
      return (
         <div>
            Error: {authError?.message} {error}
         </div>
      );

   return (
      <div className={styles.accountContainer}>
         <h1 className={styles.title}>Account Settings</h1>

         <div className={styles.sections}>
            <UpdateProfilePic currentPic={userData?.profilePicUrl} />
            <UpdateUsername currentUsername={userData?.username} />
            <UpdateEmail currentEmail={userData?.email} />
            <UpdatePassword />
            <UpdateDescription currentDescription={userData?.description} />
            <DeleteAccount />
         </div>
         <div className={styles.doneContainer}>
            <button
               className={styles.doneBtn}
               onClick={() => {
                  router.push('/profile');
               }}
            >
               <FaCheck size={20} />
               <span>Done</span>
            </button>
         </div>
      </div>
   );
}
