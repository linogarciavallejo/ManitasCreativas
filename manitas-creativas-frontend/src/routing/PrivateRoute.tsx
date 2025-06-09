import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';
import { message } from 'antd';

interface Props {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  if (!isAuthenticated()) {
    message.info('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PrivateRoute;
