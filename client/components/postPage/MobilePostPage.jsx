import Image from 'next/image';
import PostLikeButton from '../posts/PostLikeButton';
import UserLink from '../user/UserLink';
import CommentList from '../comments/CommentList';

import styles from './MobilePostPage.module.css';

export default function MobilePostPage({ post }) {
   return (
         <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
               <UserLink user={post.author} />
            </div>

            {/* Image */}
            <div className={styles.imageWrapper}>
               <Image
                  src={post.imageUrl}
                  alt={post.caption || 'Post image'}
                  fill
                  className={styles.image}
               />
            </div>

            {/* Caption */}
            {post.caption && <p className={styles.caption}>{post.caption}</p>}

            {/* Likes */}
            <PostLikeButton post={post} />

            {/* Comments */}
            <div className={styles.commentsSection}>
               <CommentList postId={post._id} />
            </div>
         </div>
   );
}
