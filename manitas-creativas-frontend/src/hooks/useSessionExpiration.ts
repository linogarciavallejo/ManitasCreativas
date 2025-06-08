import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';
import { message } from 'antd';

const SESSION_CHECK_INTERVAL_MS = 60 * 1000; // 1 minute

const useSessionExpiration = (): void => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkExpiry = () => {
      if (!isAuthenticated()) {
        message.info('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
        navigate('/', { replace: true });
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, SESSION_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [navigate, location]);
};

export default useSessionExpiration;
