import React from 'react';
import { Navigate } from 'react-router-dom';

const Home: React.FC = () => {
  // This component only renders for authenticated users,
  // thanks to the ProtectedRoute wrapping it in App.tsx.
  // Its only job is to redirect to the main dashboard.
  return <Navigate to="/dashboard" replace />;
};

export default Home;
