import { useState, useEffect } from 'react';

import styles from './Greetings.module.css';

const prompts = [
   "What's your lens on the world today?",
   'Capture a moment.',
   "Show the world what you're up to!",
   'Ready to share your latest masterpiece?',
   'What are we framing today?',
   'Your feed is waiting for a new story.',
   'What’s inspiring you today?',
   "Making memories? Post 'em!",
   'Share the view.',
   'Capture. Share. Connect.',
];

export default function Greetings({ profile }) {
   const [message, setMessage] = useState('');
   useEffect(() => {
      // Pick a random message
      const randomMessage = prompts[Math.floor(Math.random() * prompts.length)];

      setMessage(randomMessage);
   }, []);

   return (
      <div className={styles.text}>
         <h1>
            Welcome, <span>{profile.username || 'Guest'}</span>!
         </h1>
         <p>{message}</p>
      </div>
   );
}
