import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TestViewComponent from './TestViewPage';

// TestViewPage component that uses the TestViewComponent with routing
const TestViewPage: React.FC = () => {
  const { tfp_sha } = useParams<{ tfp_sha: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/tests');
  };

  const handleTestComplete = (testId: string) => {
    // Navigate to test review page with the test ID
    navigate(`/tests/review/${tfp_sha}`); // Still use tfp_sha for routing
  };

  if (!tfp_sha) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Test ID is missing
      </div>
    );
  }

  return (
    <TestViewComponent
      tfp_sha={tfp_sha}
      isCompactView={false}
      onBack={handleBack}
      onTestComplete={handleTestComplete}
      showTopBar={true}
    />
  );
};

export default TestViewPage;