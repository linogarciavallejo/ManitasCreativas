import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../services/authService';
import { message } from 'antd';

interface Props {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const user = getCurrentUser();
  
  if (!isAuthenticated()) {
    // Check if it's due to inactive status or session expiry
    if (user && user.estadoUsuario !== 'Activo') {
      message.error('Su cuenta ha sido desactivada. Contacte al administrador.');
    } else {
      message.info('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
    }
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PrivateRoute;
