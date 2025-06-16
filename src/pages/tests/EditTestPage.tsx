import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EditTestComponent from './EditTestPageComponent';

// EditTestPage component that uses the TestReviewComponent with routing
const EditTestPage: React.FC = () => {
  const { tfp_sha } = useParams<{ tfp_sha: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/tests');
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
    <EditTestComponent
      tfp_sha={tfp_sha}
      onBack={handleBack}
      showTopBar={true}
    />
  );
};

export default EditTestPage;