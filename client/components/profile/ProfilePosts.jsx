export default function ProfilePosts({ posts, loading }) {
   return <div>POSTS</div>;
   // if (loading) return <p>LOADING POSTS...</p>;
   // if (!posts || posts.length === 0) return <p>No posts yet!</p>;
   // if (posts && !loading)
   //    return (
   //       <div>
   //          <h1>Posts</h1>
   //          <ul>
   //             {posts.map((post) => (
   //                <li key={post._id}>
   //                   <h2>{post.caption}</h2>
   //                   <img
   //                      src={post.imageUrl}
   //                      alt={post.caption}
   //                      style={{ maxWidth: '200px', borderRadius: '8px' }}
   //                   />
   //                </li>
   //             ))}
   //          </ul>
   //       </div>
   //    );
}
