
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InstitutionRegisterForm: React.FC = () => {
  const navigate = useNavigate();

  const [collegeName, setCollegeName] = useState('');
  const [aisheCode, setAisheCode] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [departments, setDepartments] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!collegeName || !aisheCode || !officerName || !departments) {
      alert('Please fill all fields.');
      return;
    }

    setLoading(true);

    const institutionData = {
      college_name: collegeName,
      aishe_code: aisheCode,
      officer_name: officerName,
      departments: departments
        .split(',')
        .map((department) => department.trim())
        .filter(Boolean),
    };

    // Temporary demo data until backend institution registration is ready
    localStorage.setItem(
      'institution_data',
      JSON.stringify(institutionData)
    );

    localStorage.setItem('institution_token', 'demo-institution-token');

    setTimeout(() => {
      setLoading(false);
      navigate('/institution/dashboard');
    }, 500);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>Institution Onboarding</h1>

      <p>
        Register your college or institution to monitor student readiness.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginTop: '20px' }}>
          <label>College Name</label>
          <input
            type="text"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            placeholder="VIT Chennai"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <label>AISHE Code</label>
          <input
            type="text"
            value={aisheCode}
            onChange={(e) => setAisheCode(e.target.value)}
            placeholder="C-36944"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <label>Officer Name</label>
          <input
            type="text"
            value={officerName}
            onChange={(e) => setOfficerName(e.target.value)}
            placeholder="Dr. Rajesh Kumar"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <label>Departments</label>
          <input
            type="text"
            value={departments}
            onChange={(e) => setDepartments(e.target.value)}
            placeholder="Computer Science, Information Tech, AI & DS"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              boxSizing: 'border-box',
            }}
          />

          <small>
            Separate multiple departments using commas.
          </small>
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
          {loading ? 'Registering...' : 'Register Institution'}
        </button>
      </form>

      <p style={{ marginTop: '20px' }}>
        Already registered?{' '}
        <button onClick={() => navigate('/institution/login')}>
          Login
        </button>
      </p>
    </div>
  );
};

export default InstitutionRegisterForm;

