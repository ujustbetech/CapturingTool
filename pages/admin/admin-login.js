import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin/event/addEvent');
    } catch (err) {
      setError('Invalid email or password');
      console.error('Error logging in:', err);
    }
  };

  return (
    <div className="loginWrapper">
      <form onSubmit={handleLogin} className="loginForm">
        {error && <p className="errorMessage">{error}</p>}

        <div className="inputGroup">
          <label htmlFor="email">Email:<sup>*</sup></label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="inputGroup">
          <label htmlFor="password">Password:<sup>*</sup></label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="loginButton">
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
