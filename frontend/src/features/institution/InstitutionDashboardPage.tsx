
import React from 'react';

const InstitutionDashboardPage: React.FC = () => {
  const metrics = {
    totalStudents: 420,
    averageReadiness: 54.2,
    readyNow: 22,
    almostReady: 48,
    needsFoundation: 30,
  };

  const curriculumGaps = [
    {
      skill: 'Docker & Containerization',
      studentAverage: 24,
      industryTarget: 70,
    },
    {
      skill: 'API Testing & Postman',
      studentAverage: 38,
      industryTarget: 75,
    },
    {
      skill: 'Relational SQL Optimization',
      studentAverage: 44,
      industryTarget: 80,
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <h1>Institution Dashboard</h1>

      <p style={{ color: '#666' }}>
        VIT Chennai - School of Computer Science
      </p>

      {/* Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          marginTop: '30px',
        }}
      >
        <div
          style={{
            padding: '25px',
            border: '1px solid #ddd',
            borderRadius: '12px',
          }}
        >
          <h3>Total Students</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>
            {metrics.totalStudents}
          </p>
        </div>

        <div
          style={{
            padding: '25px',
            border: '1px solid #ddd',
            borderRadius: '12px',
          }}
        >
          <h3>Average Readiness</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>
            {metrics.averageReadiness}%
          </p>
        </div>

        <div
          style={{
            padding: '25px',
            border: '1px solid #ddd',
            borderRadius: '12px',
          }}
        >
          <h3>Ready Now</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>
            {metrics.readyNow}%
          </p>
        </div>
      </div>

      {/* Cohort Distribution */}
      <section style={{ marginTop: '45px' }}>
        <h2>Cohort Readiness</h2>

        <div style={{ marginTop: '20px' }}>
          <p>
            <strong>Ready Now:</strong> {metrics.readyNow}%
          </p>

          <div
            style={{
              width: '100%',
              height: '20px',
              background: '#eee',
              borderRadius: '10px',
            }}
          >
            <div
              style={{
                width: `${metrics.readyNow}%`,
                height: '100%',
                background: '#22c55e',
                borderRadius: '10px',
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <p>
            <strong>Almost Ready:</strong> {metrics.almostReady}%
          </p>

          <div
            style={{
              width: '100%',
              height: '20px',
              background: '#eee',
              borderRadius: '10px',
            }}
          >
            <div
              style={{
                width: `${metrics.almostReady}%`,
                height: '100%',
                background: '#f59e0b',
                borderRadius: '10px',
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <p>
            <strong>Needs Foundation:</strong> {metrics.needsFoundation}%
          </p>

          <div
            style={{
              width: '100%',
              height: '20px',
              background: '#eee',
              borderRadius: '10px',
            }}
          >
            <div
              style={{
                width: `${metrics.needsFoundation}%`,
                height: '100%',
                background: '#ef4444',
                borderRadius: '10px',
              }}
            />
          </div>
        </div>
      </section>

      {/* Curriculum Gaps */}
      <section style={{ marginTop: '45px' }}>
        <h2>Top Curriculum Gaps</h2>

        <div style={{ marginTop: '20px' }}>
          {curriculumGaps.map((gap) => (
            <div
              key={gap.skill}
              style={{
                padding: '20px',
                marginBottom: '15px',
                border: '1px solid #ddd',
                borderRadius: '10px',
              }}
            >
              <h3>{gap.skill}</h3>

              <p>
                Student Average: <strong>{gap.studentAverage}%</strong>
              </p>

              <p>
                Industry Target: <strong>{gap.industryTarget}%</strong>
              </p>

              <p>
                Gap:{' '}
                <strong>
                  {gap.industryTarget - gap.studentAverage}%
                </strong>
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default InstitutionDashboardPage;

