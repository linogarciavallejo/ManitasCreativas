import React, { useState } from "react";
import { Form, Input, Button, Upload, message, AutoComplete, Select, InputNumber } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { makeApiRequest } from "../../services/apiHelper";
import "antd/dist/reset.css";

interface Alumno {
  id: number;
  codigo: string;
  fullName: string;
}

interface AlumnoOption {
  value: string;
  label: string;
  codigo: string;
}

interface Contacto {
  alumnoId: number;
  contactoId: number;
  contacto: {
    id: number;
    nombre: string;
    telefono: string;
    email: string;
  };
  parentesco: string;
}

interface AlumnoDetails {
  id: number;
  codigo: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  sedeId: number;
  sedeNombre: string;
  gradoId: number;
  gradoNombre: string;
  becado: boolean | null;
  becaParcialPorcentaje: number | null;
  pagos: any[];
  contactos: Contacto[];
}

const { Option } = Select;

const Tuitions: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [alumnoId, setAlumnoId] = useState<string | null>(null);
  const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null);
  const [typeaheadOptions, setTypeaheadOptions] = useState<AlumnoOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [autoCompleteValue, setAutoCompleteValue] = useState<string>("");
  const [contactos, setContactos] = useState<Contacto[]>([]);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-based month number

  // Search by codigo input
  const handleCodigoSearch = async (codigo: string) => {
    try {
      const response = await makeApiRequest(`/alumnos/codigo/${codigo}`, "GET");
      setAlumnoId(response.id.toString());
      setSelectedCodigo(response.codigo);
      setSelectedStudent(
        `${response.primerNombre} ${response.segundoNombre} ${response.primerApellido} ${response.segundoApellido}`.trim()
      );
      // Update contactos info from the response
      setContactos(response.contactos || []);
      message.success("Alumno encontrado por código.");
    } catch (error) {
      message.error("No se encontró ningún alumno con ese código.");
    }
  };

  const handleTypeaheadSearch = async (query: string) => {
    setAutoCompleteValue(query);
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setTypeaheadOptions([]);
      return;
    }
    try {
      const response: Alumno[] = await makeApiRequest(`/alumnos/full`, "GET", { query: trimmedQuery });
      const filtered = response.filter((alumno) =>
        alumno.fullName.toLowerCase().includes(trimmedQuery.toLowerCase())
      );
      const options = filtered.map((alumno) => ({
        value: alumno.id.toString(),
        label: alumno.fullName,
        codigo: alumno.codigo,
      }));
      setTypeaheadOptions(options);
    } catch (error) {
      message.error("Error al buscar alumnos.");
    }
  };

  const handleTypeaheadSelect = async (value: string, option: AlumnoOption) => {
    setAutoCompleteValue(option.label);
    setAlumnoId(value);
    setSelectedStudent(option.label);
    try {
      const response: AlumnoDetails = await makeApiRequest(`/alumnos/codigo/${option.codigo}`, "GET");
      setSelectedCodigo(response.codigo);
      // Update contactos info from the response
      setContactos(response.contactos || []);
      message.success("Alumno seleccionado correctamente.");
    } catch (error) {
      message.error("Error al obtener los datos del alumno seleccionado.");
    }
  };

  const handleSubmit = async (values: {
    cicloEscolar: string;
    monto: number;
    medioPago: string;
    mes: string;
    notas?: string;
    rubroId: string;
    imagenesPago: File[];
  }) => {
    if (!alumnoId) {
      message.error("Por favor seleccione un alumno antes de enviar el pago.");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...values, alumnoId };
      console.log("Pago enviado:", payload);
      message.success("¡Pago enviado con éxito!");
    } catch (err) {
      message.error("Error al enviar el pago. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payments-container">
      <h2>Realizar un Pago de Colegiatura</h2>

      <div style={{ marginBottom: "20px" }}>
        <Input.Search
          placeholder="Buscar por Código"
          enterButton="Buscar"
          onSearch={handleCodigoSearch}
          style={{ marginBottom: "10px" }}
        />

        <div style={{ marginBottom: "15px" }}>
          <AutoComplete
            value={autoCompleteValue}
            options={typeaheadOptions}
            onSearch={handleTypeaheadSearch}
            onSelect={handleTypeaheadSelect}
            optionLabelProp="label"
            placeholder="Buscar por Nombre o Apellido"
            style={{ width: "100%" }}
            allowClear
            onClear={() => {
              setAutoCompleteValue("");
              setTypeaheadOptions([]);
            }}
          />
        </div>

        {selectedStudent && (
          <div
            style={{
              marginBottom: "10px",
              padding: "8px",
              backgroundColor: "#f0f5ff",
              borderRadius: "4px",
            }}
          >
            <strong>Alumno seleccionado:</strong> {selectedStudent}
            <Button
              type="link"
              style={{ marginLeft: "10px", padding: "0" }}
              onClick={() => {
                setSelectedStudent(null);
                setAlumnoId(null);
                setSelectedCodigo(null);
                setAutoCompleteValue("");
                setContactos([]);
              }}
            >
              Limpiar
            </Button>
          </div>
        )}

        {selectedCodigo && (
          <Input
            value={selectedCodigo}
            readOnly
            style={{ marginBottom: "10px" }}
            placeholder="Código"
          />
        )}
      </div>

      {/* Display contacts info above the Ciclo Escolar input */}
      {contactos.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h3>Contactos</h3>
          <ul style={{ paddingLeft: "20px" }}>
            {contactos.map((contacto) => (
              <li key={contacto.contactoId}>
                <strong>{contacto.parentesco}:</strong> {contacto.contacto.nombre} — {contacto.contacto.telefono} — {contacto.contacto.email}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Form
        name="payments"
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        className="payments-form"
        initialValues={{
          cicloEscolar: currentYear,
          mes: currentMonth,
          monto: 150,
        }}
      >
        <Form.Item
          label="Ciclo Escolar"
          name="cicloEscolar"
          rules={[{ required: true, message: "¡Por favor ingrese el ciclo escolar!" }]}
        >
          <Input placeholder="Ingrese el ciclo escolar" />
        </Form.Item>

        <Form.Item
          label="Mes"
          name="mes"
          rules={[{ required: true, message: "Por favor seleccione el mes" }]}
        >
          <Select>
            <Option value={1}>Enero</Option>
            <Option value={2}>Febrero</Option>
            <Option value={3}>Marzo</Option>
            <Option value={4}>Abril</Option>
            <Option value={5}>Mayo</Option>
            <Option value={6}>Junio</Option>
            <Option value={7}>Julio</Option>
            <Option value={8}>Agosto</Option>
            <Option value={9}>Septiembre</Option>
            <Option value={10}>Octubre</Option>
            <Option value={11}>Noviembre</Option>
            <Option value={12}>Diciembre</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Monto"
          name="monto"
          rules={[{ required: true, message: "¡Por favor ingrese el monto!" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Ingrese el monto"
            formatter={(value) =>
              `Q ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) =>
              value ? value.replace(/Q\s?|(,*)/g, "") : ""
            }
            onKeyPress={(event) => {
              if (!/[0-9.]/.test(event.key)) {
                event.preventDefault();
              }
            }}
          />
        </Form.Item>

        <Form.Item
          label="Medio de Pago"
          name="medioPago"
          rules={[{ required: true, message: "¡Por favor ingrese el medio de pago!" }]}
        >
          <Select placeholder="Seleccione el medio de pago">
            <Option value={1}>Efectivo</Option>
            <Option value={4}>Transferencia Electrónica</Option>
            <Option value={6}>Boleta de Depósito</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Notas" name="notas">
          <Input.TextArea placeholder="Agregar notas sobre el pago" rows={4} />
        </Form.Item>

        <Form.Item name="rubroId" initialValue={1} style={{ display: "none" }}>
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
          <Button type="primary" htmlType="submit" block loading={loading} disabled={!alumnoId}>
            Enviar Pago
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Tuitions;
