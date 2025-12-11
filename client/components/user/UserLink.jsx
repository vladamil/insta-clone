'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './UserLink.module.css';

export default function UserLink({
   user,
   showFullInfo = true,
   onClick,
   className = '',
}) {
   if (!user) return null;

   const path = `/users/${user.username}-${user._id}`;
   const avatar = user.profilePicUrl || '/default-avatar.png';

   return (
      <Link
         href={path}
         onClick={onClick}
         className={`${styles.link} ${className}`}
      >
         <div className={styles.avatarWrapper}>
            <Image
               src={avatar}
               alt={user.username}
               width={40}
               height={40}
               className={styles.avatar}
            />
         </div>

         <div className={styles.info}>
            <span className={styles.username}>{user.username}</span>
            {showFullInfo && (
               <span className={styles.fullName}>{user.realname}</span>
            )}
         </div>
      </Link>
   );
}
