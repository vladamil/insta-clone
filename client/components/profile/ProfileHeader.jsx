export default function ProfileHeader({
   username,
   profilePicUrl,
   description,
}) {
   return (
      <div>
         <img src={profilePicUrl || ''} alt={username} width={200} />
         <div>
            <h2>{username}</h2>
            <p>{description || 'No description yet.'}</p>
         </div>
      </div>
   );
}
