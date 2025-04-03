import React, { useState } from 'react';
import { Form, Input, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
//import './Payments.css';

const OtherPayments: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { cicloEscolar: string; monto: number; medioPago: string; rubroId: string; alumnoId: string; imagenesPago: File[] }) => {
    setLoading(true);
    try {
      // Simular llamada a la API
      console.log('Pago enviado:', values);
      message.success('¡Pago enviado con éxito!');
    } catch (err) {
      message.error('Error al enviar el pago. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payments-container">
      <h2>Realizar un Pago</h2>
      <Form
        name="payments"
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        className="payments-form"
      >
        <Form.Item
          label="Ciclo Escolar"
          name="cicloEscolar"
          rules={[{ required: true, message: '¡Por favor ingrese el ciclo escolar!' }]}
        >
          <Input placeholder="Ingrese el ciclo escolar" />
        </Form.Item>

        <Form.Item
          label="Monto"
          name="monto"
          rules={[{ required: true, message: '¡Por favor ingrese el monto!' }]}
        >
          <Input type="number" placeholder="Ingrese el monto" />
        </Form.Item>

        <Form.Item
          label="Medio de Pago"
          name="medioPago"
          rules={[{ required: true, message: '¡Por favor ingrese el medio de pago!' }]}
        >
          <Input placeholder="Ingrese el medio de pago" />
        </Form.Item>

        <Form.Item
          name="rubroId"
          initialValue={1}
          style={{ display: 'none' }}
        >
          <Input type="hidden" />
        </Form.Item>

        <Form.Item
          label="ID del Alumno"
          name="alumnoId"
          rules={[{ required: true, message: '¡Por favor ingrese el ID del alumno!' }]}
        >
          <Input placeholder="Ingrese el ID del alumno" />
        </Form.Item>

        <Form.Item
          label="Imágenes de Pago"
          name="imagenesPago"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
        >
          <Upload name="imagenesPago" listType="picture" beforeUpload={() => false}>
            <Button icon={<UploadOutlined />}>Subir Imágenes de Pago</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Enviar Pago
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default OtherPayments;
