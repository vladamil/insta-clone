import Image from 'next/image';
import PostLikeButton from '../posts/PostLikeButton';
import UserLink from '../user/UserLink';
import CommentList from '../comments/CommentList';

import styles from './DesktopPostPage.module.css';

export default function DesktopPostPage({ post }) {
   const date = new Date(post.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
   });

   return (
      <div className={styles.container}>
         <div className={styles.imageWrapper}>
            <Image
               src={post.imageUrl}
               alt={post.caption || 'Post image'}
               fill
               className={styles.image}
               sizes="1200px"
            />
         </div>
         <div className={styles.details}>
            <div className={styles.header}>
               <UserLink user={post.author} />
            </div>

            {post.caption && <p className={styles.caption}>{post.caption}</p>}

            <div className={styles.likeWrapper}>
               <PostLikeButton post={post} />
               <p className={styles.date}>{date}</p>
            </div>

            <CommentList postId={post._id} />
         </div>
      </div>
   );
}
