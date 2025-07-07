import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { signIn } from '../../services/authService';
import { useNavigate } from "react-router-dom";
import { Usuario } from '../../types/usuario';
import { ToastContainer, toast } from 'react-toastify';
import 'antd/dist/reset.css'; // Import Ant Design styles
import 'react-toastify/dist/ReactToastify.css';
import './SignIn.css';
import logoImage from '../../assets/logo_v1.jpg'; // Import the logo properly

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { codigoUsuario: string; password: string }) => {
    setLoading(true);
    try {
      const user: Usuario = await signIn(values.codigoUsuario, values.password);
      message.success(`Bienvenido, ${user.nombres}!`);
      toast.success(`Bienvenido, ${user.nombres}!`, {
        position: "top-right",
        autoClose: 3000,
      });
      console.log('User signed in:', user);
      console.log('User ID for audit fields:', user.id); // Log the ID that will be used for audit
      navigate('/main'); // Redirect to the main page after successful sign-in
    } catch (err) {
      console.error('Sign in error:', err);
      
      // Display the specific error message from the backend
      let errorMessage = 'Error al iniciar sesión. Inténtelo de nuevo.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'response' in err) {
        const httpError = err as { response: { status: number; data?: { message?: string } } };
        const errorData = httpError.response?.data;
        
        // Provide specific messages based on status code
        switch (httpError.response?.status) {
          case 401:
            errorMessage = errorData?.message || 'Credenciales inválidas. Verifique su código de usuario y contraseña.';
            break;
          case 403:
            errorMessage = errorData?.message || 'Su cuenta no está disponible. Contacte al administrador.';
            break;
          default:
            errorMessage = errorData?.message || 'Error al iniciar sesión. Inténtelo de nuevo.';
            break;
        }
      }
      
      // Show error using both Ant Design message and toast for better visibility
      message.error(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-in-container">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
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
        
        <Form.Item>
          <Button 
            type="link" 
            onClick={() => navigate('/forgot-password')}
            block
            style={{ padding: 0 }}
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SignIn;