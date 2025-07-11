import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { makeApiRequest } from '../../services/apiHelper';
import './ResetPassword.css';

const { Title, Text } = Typography;

const ResetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (values: { newPassword: string; confirmPassword: string }) => {
    setLoading(true);
    try {
      await makeApiRequest('/api/auth/reset-password', 'POST', {
        token: token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      
      message.success('Contraseña restablecida exitosamente');
      navigate('/signin');
    } catch (error) {
      message.error('Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="reset-password-container">
        <Card>
          <Title level={3}>Enlace inválido</Title>
          <Text>El enlace de recuperación no es válido o ha expirado.</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <Card className="reset-password-card">
        <Title level={3} className="reset-password-title">
          Restablecer Contraseña
        </Title>
        
        <Form
          name="resetPassword"
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          className="reset-password-form"
        >
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
              { required: true, message: 'Por favor confirma la contraseña' },
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
              placeholder="Confirmar contraseña"
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
              Restablecer contraseña
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;
