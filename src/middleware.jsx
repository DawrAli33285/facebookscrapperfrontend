import { Navigate, Outlet } from 'react-router-dom';
import React from 'react';
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  
  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  // If token exists, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;