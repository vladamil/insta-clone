'use client';

import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import UserLink from '../user/UserLink';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

import styles from './UserListModal.module.css';

export default function UserListModal({ isOpen, onClose, title, fetchUsers }) {
   const [users, setUsers] = useState([]);
   const [filtered, setFiltered] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [searchTerm, setSearchTerm] = useState('');

   useLockBodyScroll(isOpen);

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
      const filteredData = users.filter(
         (user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.realname?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFiltered(filteredData);
   }, [searchTerm, users]);

   // Close modal on ESC
   useEffect(() => {
      const handleEsc = (e) => e.key === 'Escape' && onClose();
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
   }, [onClose]);

   if (!isOpen) return null;

   const modalContent = (
      <div className={styles.backdrop} onClick={onClose}>
         <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()} // prevent closing on content click
         >
            <div className={styles.header}>
               <h3 className={styles.title}>{title}</h3>
               <button className={styles.closeBtn} onClick={onClose}>
                  <FaTimes />
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
                        showFullInfo={true}
                        className={styles.userItem}
                     />
                  ))}
            </div>
         </div>
      </div>
   );

   return ReactDOM.createPortal(modalContent, document.body);
}
