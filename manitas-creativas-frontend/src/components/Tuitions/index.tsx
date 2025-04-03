import React, { useState } from 'react';
import { Form, Input, Button, Upload, message, AutoComplete } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import 'antd/dist/reset.css';

const Tuitions: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [alumnoId, setAlumnoId] = useState<string | null>(null);
  const [typeaheadOptions, setTypeaheadOptions] = useState<{ value: string; label: string }[]>([]);

  const handleCodigoSearch = async (codigo: string) => {
    try {
      const response = await axios.get(`/alumnos/codigo/${codigo}`);
      setAlumnoId(response.data.id);
      message.success('Alumno encontrado por código.');
    } catch (error) {
      message.error('No se encontró ningún alumno con ese código.');
    }
  };

  const handleTypeaheadSearch = async (query: string) => {
    try {
      const response = await axios.get(`/alumnos/search`, { params: { query } });
      const options = response.data.map((alumno: { id: string; nombres: string; apellidos: string }) => ({
        value: alumno.id,
        label: `${alumno.nombres} ${alumno.apellidos}`,
      }));
      setTypeaheadOptions(options);
    } catch (error) {
      message.error('Error al buscar alumnos.');
    }
  };

  const handleTypeaheadSelect = (value: string) => {
    setAlumnoId(value);
    message.success('Alumno seleccionado por nombres y apellidos.');
  };

  const handleSubmit = async (values: { cicloEscolar: string; monto: number; medioPago: string; rubroId: string; imagenesPago: File[] }) => {
    if (!alumnoId) {
      message.error('Por favor seleccione un alumno antes de enviar el pago.');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...values, alumnoId };
      console.log('Pago enviado:', payload);
      message.success('¡Pago enviado con éxito!');
    } catch (err) {
      message.error('Error al enviar el pago. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payments-container">
      <h2>Realizar un Pago de Colegiatura</h2>

      <div style={{ marginBottom: '20px' }}>
        <Input.Search
          placeholder="Buscar por Código"
          enterButton="Buscar"
          onSearch={handleCodigoSearch}
          style={{ marginBottom: '10px' }}
        />

        <AutoComplete
          options={typeaheadOptions}
          onSearch={handleTypeaheadSearch}
          onSelect={handleTypeaheadSelect}
          placeholder="Buscar por Nombres y Apellidos"
          style={{ width: '100%' }}
        />
      </div>

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

export default Tuitions;
