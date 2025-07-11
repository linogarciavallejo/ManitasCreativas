import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Typography } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { makeApiRequest } from '../../services/apiHelper';
import './ForgotPassword.css';

const { Title, Text } = Typography;

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
      await makeApiRequest('/api/auth/forgot-password', 'POST', { email: values.email });
      setEmailSent(true);
      message.success('Se ha enviado un enlace de recuperación a tu email');
    } catch (error) {
      message.error('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <Card className="forgot-password-card">
        <div className="forgot-password-header">
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/signin')}
            className="back-button"
          >
            Volver al inicio de sesión
          </Button>
        </div>
        
        {!emailSent ? (
          <>
            <Title level={3} className="forgot-password-title">
              Recuperar Contraseña
            </Title>
            <Text type="secondary" className="forgot-password-description">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
            </Text>
            
            <Form
              name="forgotPassword"
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              className="forgot-password-form"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Por favor ingresa tu email' },
                  { type: 'email', message: 'Por favor ingresa un email válido' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />}
                  placeholder="Ingresa tu email"
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
                  Enviar enlace de recuperación
                </Button>
              </Form.Item>
            </Form>
          </>
        ) : (
          <div className="email-sent-message">
            <Title level={3}>¡Email enviado!</Title>
            <Text>
              Si el email existe en nuestro sistema, recibirás un enlace de recuperación.
              Revisa tu bandeja de entrada y la carpeta de spam.
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
