import { AuthProvider } from '@/context/AuthContext';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
   subsets: ['latin'],
   weight: ['400', '500', '600', '700'],
   display: 'swap',
   variable: '--font-inter',
});

export const metadata = {
   title: 'InstaClone',
   description: 'InstaClone is a modern full-stack social media app inspired by Instagram, featuring user profiles, posts, comments, likes, and infinite scrolling feeds.',
};

export default function RootLayout({ children }) {
   return (
      <html lang="en" className={inter.variable}>
         <body>
            <AuthProvider> {children}</AuthProvider>
         </body>
      </html>
   );
}
