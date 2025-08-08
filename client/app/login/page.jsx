'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/constants';

export default function LoginPage() {
   const [formData, setFormData] = useState({
      username: '',
      password: '',
   });
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');
   const router = useRouter();

   const handleChange = (e) => {
      setFormData((prev) => ({
         ...prev,
         [e.target.name]: e.target.value,
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess('');

      try {
         const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               username: formData.username.trim().toLowerCase(),
               password: formData.password.trim(),
            }),
         });

         const data = await res.json();
         if (!res.ok) throw new Error(data.error || 'Login failed');

         // Save the token into session storage
         sessionStorage.setItem('token', data.token);

         setSuccess('Login successful!');
         setFormData({ username: '', password: '' });

         // Redirect after login
         router.replace('/account');
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div style={{ maxWidth: 400, margin: '0 auto' }}>
         <h1>Login</h1>
         <form onSubmit={handleSubmit}>
            <input
               name="username"
               type="text"
               placeholder="Username"
               value={formData.username}
               onChange={handleChange}
               required
            />
            <br />
            <input
               name="password"
               type="password"
               placeholder="Password"
               value={formData.password}
               onChange={handleChange}
               required
            />
            <br />

            <button type="submit" disabled={loading}>
               {loading ? 'Logging in...' : 'Login'}
            </button>
         </form>

         {error && <p style={{ color: 'red' }}>❌ {error}</p>}
         {success && <p style={{ color: 'green' }}>✅ {success}</p>}
      </div>
   );
}
