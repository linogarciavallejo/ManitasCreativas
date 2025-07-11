import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasAdminAccess } from '../services/authService';
import { message } from 'antd';

interface Props {
  children: React.ReactElement;
}

const AdminRoute: React.FC<Props> = ({ children }) => {
  if (!hasAdminAccess()) {
    message.error('Acceso denegado. Solo administradores pueden acceder a esta sección.');
    return <Navigate to="/main" replace />;
  }
  return children;
};

export default AdminRoute;
