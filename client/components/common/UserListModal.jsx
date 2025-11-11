'use client';

import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './UserListModal.module.css';
import UserLink from '../user/UserLink';

export default function UserListModal({
   isOpen,
   onClose,
   title,
   fetchUsers, // () => Promise<users[]>
}) {
   const [users, setUsers] = useState([]);
   const [filtered, setFiltered] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [searchTerm, setSearchTerm] = useState('');

   // Fetch when modal opens
   useEffect(() => {
      if (!isOpen) return;
      setLoading(true);
      setError(null);
      setUsers([]);
      setFiltered([]);

      fetchUsers()
         .then((res) => res.json())
         .then((data) => {
            setUsers(data);
            setFiltered(data);
         })
         .catch((err) => setError('Failed to load users.'))
         .finally(() => setLoading(false));
   }, [isOpen, fetchUsers]);

   // Local search filter
   useEffect(() => {
      const filteredData = users.filter((u) =>
         u.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFiltered(filteredData);
   }, [searchTerm, users]);

   // Close modal on ESC
   useEffect(() => {
      const handleEsc = (e) => e.key === 'Escape' && onClose();
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
   }, [onClose]);

   console.log(users);
   if (!isOpen) return null;

   return ReactDOM.createPortal(
      <div className={styles.backdrop} onClick={onClose}>
         <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()} // prevent closing on content click
         >
            <div className={styles.header}>
               <h3>{title}</h3>
               <button className={styles.closeBtn} onClick={onClose}>
                  ✕
               </button>
            </div>

            <input
               type="text"
               className={styles.searchInput}
               placeholder="Search..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className={styles.content}>
               {loading && <p className={styles.infoText}>Loading...</p>}
               {error && <p className={styles.errorText}>{error}</p>}

               {!loading && !error && filtered.length === 0 && (
                  <p className={styles.infoText}>No users found.</p>
               )}

               {!loading &&
                  !error &&
                  filtered.map((user) => (
                     <UserLink
                        key={user._id}
                        user={user}
                        className={styles.userItem}
                     />
                  ))}
            </div>
         </div>
      </div>,
      document.body
   );
}
