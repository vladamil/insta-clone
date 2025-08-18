export default function ProfilePosts({ posts }) {
   if (!posts || posts.length === 0) return <p>No posts yet!</p>;

   return posts.map((post) => {
      <div key={post._id}>
         <img src={post.imageUrl} alt={post.caption || 'Post image'} />
      </div>;
   });
}
