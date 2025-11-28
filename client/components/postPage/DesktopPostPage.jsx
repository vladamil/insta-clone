import Image from 'next/image';
import PostLikeButton from '../posts/PostLikeButton';
import UserLink from '../user/UserLink';
import CommentList from '../comments/CommentList';

import styles from './DesktopPostPage.module.css';

export default function DesktopPostPage({ post }) {
   return (
      <div className={styles.container}>
         <div className={styles.imageWrapper}>
            <Image
               src={post.imageUrl}
               alt={post.caption || 'Post image'}
               fill
               className={styles.image}
            />
         </div>
         <div className={styles.details}>
            <div className={styles.header}>
               <UserLink user={post.author} />
            </div>

            {post.caption && <p className={styles.caption}>{post.caption}</p>}

            <PostLikeButton post={post} />

            <CommentList postId={post._id} />
         </div>
      </div>
   );
}
