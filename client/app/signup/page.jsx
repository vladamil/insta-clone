'use client';
import { useState } from 'react';

const initialFormData = {
   username: '',
   email: '',
   password: '',
};

export default function SignUpPage() {
   const [formData, setFormData] = useState(initialFormData);
   const [repeatPassword, setRepeatPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');

   const { email, username, password } = formData;
   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

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

      // Repeat password check
      if (formData.password !== repeatPassword) {
         setError("Passwords don't match");
         setLoading(false);
         return;
      }

      try {
         const res = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData), // repeatPassword is NOT included!
         });

         const data = await res.json();
         console.log('HTTP SENT');

         if (!res.ok) throw new Error(data.error || 'Registration failed');

         setSuccess('Registration successful! You can now log in.');
         setFormData(initialFormData);
         setRepeatPassword('');
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div style={{ maxWidth: 400, margin: '0 auto' }}>
         <h1>Register</h1>
         <form onSubmit={handleSubmit}>
            <input
               name="username"
               placeholder="Username"
               value={formData.username}
               onChange={handleChange}
               required
            />
            <br />
            <input
               name="email"
               type="email"
               placeholder="Email"
               value={formData.email}
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
            <input
               name="repeatPassword"
               type="password"
               placeholder="Repeat Password"
               value={repeatPassword}
               onChange={(e) => setRepeatPassword(e.target.value)}
               required
            />
            <br />

            <button type="submit" disabled={loading}>
               {loading ? 'Registering...' : 'Register'}
            </button>
         </form>

         {error && <p style={{ color: 'red' }}>❌ {error}</p>}
         {success && <p style={{ color: 'green' }}>✅ {success}</p>}
      </div>
   );
}
