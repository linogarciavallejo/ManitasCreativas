import React, { useState } from 'react';
import { signIn } from '../../services/AuthService';
//import './SignIn.css';

const SignIn: React.FC = () => {
  const [codigoUsuario, setCodigoUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const user = await signIn(codigoUsuario, contrasena);
      console.log('User signed in:', user);
      // Handle successful sign-in (e.g., redirect or store user info)
    } catch (err) {
      setError('Invalid user code. Please try again.');
    }
  };

  return (
    <div className="sign-in-container">
      <form onSubmit={handleSubmit} className="sign-in-form">
        <h2>Sign In</h2>
        <input
          type="text"
          placeholder="Enter your user code"
          value={codigoUsuario}
          onChange={(e) => setCodigoUsuario(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />
        <button type="submit">Sign In</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default SignIn;