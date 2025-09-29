'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
   const { login, authError } = useAuth();
   const [formData, setFormData] = useState({
      username: '',
      password: '',
   });
   const [loading, setLoading] = useState(false);

   const handleChange = (e) => {
      setFormData((prev) => ({
         ...prev,
         [e.target.name]: e.target.value,
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      await login(formData.username, formData.password);

      setLoading(false);
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

         {authError && <p style={{ color: 'red' }}>❌ {authError}</p>}
      </div>
   );
}
