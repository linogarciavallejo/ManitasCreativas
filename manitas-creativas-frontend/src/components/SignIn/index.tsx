import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { signIn } from '../../services/authService';
import { useNavigate } from "react-router-dom";
import 'antd/dist/reset.css'; // Import Ant Design styles
import './SignIn.css';
import logoImage from '../../assets/logo_v1.jpg'; // Import the logo properly

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { codigoUsuario: string; password: string }) => {
    setLoading(true);
    try {
      const user = await signIn(values.codigoUsuario, values.password);
      message.success(`Bienvenido, ${user.nombre}!`);
      console.log('User signed in:', user);
      navigate('/main'); // Redirect to the main page after successful sign-in
      // Handle successful sign-in (e.g., redirect or store user info)
    } catch (err) {
      message.error('Credenciales inválidas. Por favor inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-in-container">
      <img src={logoImage} alt="Logo" className="logo" />
      <Form
        name="signIn"
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        className="sign-in-form"
      >
        <Form.Item
          label="Usuario:"
          name="codigoUsuario"
          rules={[{ required: true, message: 'Por favor ingrese su código de usuario!' }]}
        >
          <Input placeholder="Ingrese su código de usuario" />
        </Form.Item>

        <Form.Item
          label="Contraseña:"
          name="password"
          rules={[{ required: true, message: 'Por favor ingrese su contraseña!' }]}
        >
          <Input.Password placeholder="Ingrese su contraseña" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Ingresar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SignIn;