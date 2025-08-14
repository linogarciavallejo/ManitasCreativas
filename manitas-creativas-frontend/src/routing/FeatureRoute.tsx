import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isFeatureAvailable } from '../services/authService';
import { message, Spin } from 'antd';

interface Props {
  children: React.ReactElement;
  featureName: string;
  fallbackPath?: string;
}

const FeatureRoute: React.FC<Props> = ({ 
  children, 
  featureName, 
  fallbackPath = "/main" 
}) => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkFeatureAccess = async () => {
      try {
        const available = await isFeatureAvailable(featureName);
        setHasAccess(available);
      } catch (error) {
        console.error(`Error checking feature access for ${featureName}:`, error);
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkFeatureAccess();
  }, [featureName]);

  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        <Spin size="large" tip="Verificando permisos..." />
      </div>
    );
  }

  if (!hasAccess) {
    message.error('Acceso denegado. No tiene permisos para acceder a esta sección.');
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default FeatureRoute;
