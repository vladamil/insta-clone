'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaUserAltSlash } from 'react-icons/fa';
import UserHeader from '@/components/user/UserHeader';
import UserPosts from '@/components/user/UserPosts';
import StatusPage from '@/components/common/StatusPage';

import styles from './UserPage.module.css';

export default function ProfilePage() {
   const { slug } = useParams();
   const id = slug.split('-').pop();

   const [notFound, setNotFound] = useState(false);

   const handleNotFound = (isFound) => {
      setNotFound(isFound);
   };

   if (notFound)
      return (
         <StatusPage
            title={'User Not Found'}
            text={'The user doesn’t exist or has been deleted.'}
            icon={<FaUserAltSlash />}
            action={<Link href="/home">Back Home</Link>}
         />
      );

   return (
      <div className={styles.container}>
         <UserHeader id={id} onNotFound={handleNotFound} />
         <UserPosts id={id} />
      </div>
   );
}
