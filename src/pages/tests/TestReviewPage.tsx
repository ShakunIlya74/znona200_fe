import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TestReviewComponent from './TestReviewPageComponent';

// TestReviewPage component that uses the TestReviewComponent with routing
const TestReviewPage: React.FC = () => {
  const { tfp_sha } = useParams<{ tfp_sha: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/tests');
  };
  const handleTestRecomplete = (testId: string) => {
    // Navigate to test view page to take the test again
    navigate(`/test-view/${testId}`);
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
    <TestReviewComponent
      tfp_sha={tfp_sha}
      isCompactView={false}
      onBack={handleBack}
      onTestRecomplete={handleTestRecomplete}
      showTopBar={true}
    />
  );
};

export default TestReviewPage;