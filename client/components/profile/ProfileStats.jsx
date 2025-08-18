export default function ProfileStats({ stats }) {
   return (
      <div>
         <div>
            <strong>{stats.posts}</strong> Posts
         </div>
         <div>
            <strong>{stats.followers}</strong> Followers
         </div>
         <div>
            <strong>{stats.following}</strong> Following
         </div>
      </div>
   );
}
