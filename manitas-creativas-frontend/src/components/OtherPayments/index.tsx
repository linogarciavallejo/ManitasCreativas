import React, { useState, useEffect } from "react";
import { Form, Input, Button, Upload, message, AutoComplete, Select, InputNumber, DatePicker } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import moment from 'moment';
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

// Add Rubro interface
interface Rubro {
  id: number;
  descripcion: string;
  tipo: number;
  montoPreestablecido: number | null;
  esColegiatura: boolean; // Added esColegiatura property to match backend RubroDto
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

// Fix for error 1: Ensure the file object is properly typed to include 'originFileObj'.
interface CustomFile extends File {
  originFileObj?: File;
}

const { Option } = Select;

const OtherPayments: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [alumnoId, setAlumnoId] = useState<string | null>(null);
  const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null);
  const [typeaheadOptions, setTypeaheadOptions] = useState<AlumnoOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [autoCompleteValue, setAutoCompleteValue] = useState<string>("");
  const [contactos, setContactos] = useState<Contacto[]>([]);
  // Add state for rubros
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [form] = Form.useForm();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-based month number

  // Fetch rubros on component mount
  useEffect(() => {
    const fetchRubros = async () => {
      try {
        const response = await makeApiRequest<Rubro[]>("/rubrosactivos", "GET");
        setRubros(response);
      } catch (error) {
        message.error("Error al cargar los rubros.");
      }
    };
    
    fetchRubros();
  }, []);

  // Search by codigo input
  const handleCodigoSearch = async (codigo: string) => {
    try {
      const response = await makeApiRequest<AlumnoDetails>(`/alumnos/codigo/${codigo}`, "GET");
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
      const response = await makeApiRequest<Alumno[]>(`/alumnos/full`, "GET");
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
      const response = await makeApiRequest<AlumnoDetails>(`/alumnos/codigo/${option.codigo}`, "GET");
      setSelectedCodigo(response.codigo);
      // Update contactos info from the response
      setContactos(response.contactos || []);
      message.success("Alumno seleccionado correctamente.");
    } catch (error) {
      message.error("Error al obtener los datos del alumno seleccionado.");
    }
  };
  
  // Add handler for rubro selection
  const handleRubroChange = (rubroId: string) => {
    const selectedRubro = rubros.find(rubro => rubro.id.toString() === rubroId);
    if (selectedRubro && selectedRubro.montoPreestablecido) {
      form.setFieldsValue({ monto: selectedRubro.montoPreestablecido });
    }
  };

  // Fix for error 2: Adjust the API request to correctly handle the options parameter.
  const handleSubmit = async (values: {
    cicloEscolar: string;
    fechaPago: moment.Moment;
    monto: number;
    medioPago: string;
    mes: string;
    rubroId: string;
    notas?: string;
    imagenesPago?: any[]; // Changed to optional and any[] to handle undefined case
  }) => {
    console.log("Form submitted with values:", values); // Debugging log

    if (!alumnoId) {
      message.error("Por favor seleccione un alumno antes de enviar el pago.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("Id", "0");
      formData.append("Fecha", values.fechaPago.toISOString());
      formData.append("CicloEscolar", values.cicloEscolar);
      formData.append("Monto", values.monto.toString());
      formData.append("MedioPago", values.medioPago);
      formData.append("RubroId", values.rubroId);
      formData.append("AlumnoId", alumnoId);
      formData.append("EsColegiatura", "false"); // Changed: this is OtherPayments, not tuition
      
      // Only add MesColegiatura and AnioColegiatura if needed
      if (values.mes) {
        formData.append("MesColegiatura", values.mes);
        formData.append("AnioColegiatura", new Date().getFullYear().toString());
      }
      
      if (values.notas) formData.append("Notas", values.notas);
      formData.append("UsuarioId", "1"); // Assuming 1 is the logged-in user ID
      
      // Handle file uploads properly, checking for undefined
      if (values.imagenesPago && values.imagenesPago.length > 0) {
        values.imagenesPago.forEach((file, index) => {
          if (file.originFileObj) {
            formData.append(`ImagenesPago[${index}]`, file.originFileObj);
          }
        });
      }

      console.log("Sending payment data to server..."); // Add debug log
      const response = await makeApiRequest<any>("/pagos", "POST", formData);
      console.log("Payment response:", response); // Add debug log

      message.success("¡Pago enviado con éxito!");
    } catch (err) {
      console.error("Error submitting payment:", err); // Add error logging
      message.error("Error al enviar el pago. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payments-container">
      <h2>Realizar un Pago</h2>

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
            placeholder="Buscar por Nombre o Apellido"
            style={{ width: "100%" }}
            allowClear
            onClear={() => {
              setAutoCompleteValue("");
              setTypeaheadOptions([]);
            }}
            fieldNames={{ label: 'label', value: 'value' }}
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
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        className="payments-form"
        initialValues={{
          cicloEscolar: currentYear,
          mes: null, // Changed from currentMonth to null to make "Sin mes específico" the default
          monto: 150,
          fechaPago: moment(),
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
          label="Fecha de Pago"
          name="fechaPago"
          rules={[{ required: true, message: "¡Por favor seleccione la fecha de pago!" }]}
        >
          <DatePicker 
            style={{ width: "100%" }} 
            format="YYYY-MM-DD" 
            placeholder="Seleccione la fecha de pago"
          />
        </Form.Item>
        
        <Form.Item
          label="Rubro"
          name="rubroId"
          rules={[{ required: true, message: "Por favor seleccione un rubro" }]}
        >
          <Select 
            placeholder="Seleccione el rubro" 
            onChange={handleRubroChange}
            loading={rubros.length === 0}
          >
            {rubros
              .filter(rubro => !rubro.esColegiatura) // Filter out rubros with esColegiatura = true
              .map(rubro => (
                <Option key={rubro.id} value={rubro.id.toString()}>
                  {rubro.descripcion}
                </Option>
              ))
            }
          </Select>
        </Form.Item>

        <Form.Item
          label="Mes"
          name="mes"
          rules={[{ required: false }]}
        >
          <Select allowClear placeholder="Seleccione el mes (opcional)">
            <Option value={null}>Sin mes específico</Option>
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

export default OtherPayments;
