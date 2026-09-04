
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InstitutionLoginForm: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }

    setLoading(true);

    // Temporary demo login until backend institution authentication is ready
    localStorage.setItem('institution_token', 'demo-institution-token');

    setTimeout(() => {
      setLoading(false);
      navigate('/institution/dashboard');
    }, 500);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '20px' }}>
      <h1>Institution Login</h1>
      <p>Login to access your institution dashboard.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginTop: '20px' }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="institution@example.com"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '25px',
            padding: '12px 25px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '20px' }}>
        Don't have an institution account?{' '}
        <button onClick={() => navigate('/institution/onboard')}>
          Register Institution
        </button>
      </p>
    </div>
  );
};

export default InstitutionLoginForm;

