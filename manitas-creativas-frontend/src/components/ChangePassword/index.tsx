import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Typography } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { makeApiRequest } from '../../services/apiHelper';
import { getCurrentUserId } from '../../services/authService';
import './ChangePassword.css';

const { Title } = Typography;

const ChangePassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: { 
    currentPassword: string; 
    newPassword: string; 
    confirmPassword: string 
  }) => {
    setLoading(true);
    try {
      const userId = getCurrentUserId();
      
      await makeApiRequest('/api/auth/change-password', 'POST', {
        userId: userId,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      
      message.success('Contraseña cambiada exitosamente');
      navigate('/main');
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response: { data?: { message?: string } } };
        const errorMessage = httpError.response?.data?.message || 'Error al cambiar la contraseña';
        message.error(errorMessage);
      } else {
        message.error('Error al cambiar la contraseña');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <Card className="change-password-card">
        <div className="change-password-header">
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/main')}
            className="back-button"
          >
            Volver al menú principal
          </Button>
        </div>
        
        <Title level={3} className="change-password-title">
          Cambiar Contraseña
        </Title>
        
        <Form
          name="changePassword"
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          className="change-password-form"
        >
          <Form.Item
            name="currentPassword"
            rules={[
              { required: true, message: 'Por favor ingresa tu contraseña actual' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Contraseña actual"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            rules={[
              { required: true, message: 'Por favor ingresa la nueva contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nueva contraseña"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Por favor confirma la nueva contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirmar nueva contraseña"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              size="large"
            >
              Cambiar contraseña
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;
