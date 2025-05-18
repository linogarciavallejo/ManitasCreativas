import React, { useState, useEffect } from "react";
import { Form, Input, Button, Upload, AutoComplete, Select, InputNumber } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { makeApiRequest } from "../../services/apiHelper";
import { getCurrentUserId } from "../../services/authService";
import { gradoService } from "../../services/gradoService";
import { rubroService } from "../../services/rubroService";
import DatePickerES from "../common/DatePickerES"; // Import our custom DatePicker
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
  observaciones?: string;
  pagos: Array<{
    id: number;
    fecha: string;
    monto: number;
    rubroDescripcion: string;
    // Add other payment fields as needed
  }>;
  contactos: Contacto[];
}

const { Option } = Select;

const Tuitions: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingRubro, setLoadingRubro] = useState<boolean>(false);
  const [alumnoId, setAlumnoId] = useState<string | null>(null);
  const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null);
  const [typeaheadOptions, setTypeaheadOptions] = useState<AlumnoOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [autoCompleteValue, setAutoCompleteValue] = useState<string>("");
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [dinamicRubroId, setDinamicRubroId] = useState<string>("1"); // Default to "1" but will be updated
  const [gradoId, setGradoId] = useState<number | null>(null);
  const [form] = Form.useForm(); // Add Form instance

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-based month number
  
  // Function to get month name for display
  const getMonthNameByNumber = (monthNumber: number): string => {
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return monthNames[(monthNumber - 1) % 12]; // Convert 1-based to 0-based index with safety check
  };

  // Update form values when dinamicRubroId changes
  useEffect(() => {
    form.setFieldsValue({ rubroId: dinamicRubroId });
  }, [dinamicRubroId, form]);

  // Function to fetch the appropriate RubroId for a student's grade
  const fetchRubroIdForGrado = async (studentGradoId: number) => {
    if (!studentGradoId) {
      console.error("No GradoId provided");
      return;
    }

    try {
      setLoadingRubro(true);
      
      // Step 1: Get the Grado details to find the NivelEducativoId
      const gradoDetails = await gradoService.getGradoById(studentGradoId);
      const nivelEducativoId = gradoDetails.nivelEducativoId;
      
      if (!nivelEducativoId) {
        console.error("No NivelEducativoId found for Grado:", studentGradoId);
        return;
      }
      
      // Step 2: Get all active Rubros
      const activeRubros = await rubroService.getActiveRubros();
      
      // Step 3: Filter Rubros for the matching NivelEducativoId and EsColegiatura=true
      const tuitionRubros = activeRubros.filter(rubro => 
        rubro.nivelEducativoId === nivelEducativoId && rubro.esColegiatura === true
      );
      
      if (tuitionRubros.length === 0) {
        console.warn("No matching tuition Rubro found for NivelEducativoId:", nivelEducativoId);
        toast.warning("No se encontró un rubro de colegiatura para este estudiante. Se usará el valor predeterminado.");
        return;
      }
      
      // If multiple matches, preferably take the one with montoPreestablecido
      const selectedRubro = tuitionRubros.find(r => r.montoPreestablecido !== undefined) || tuitionRubros[0];
      
      // Step 4: Update the RubroId state and form value
      setDinamicRubroId(selectedRubro.id.toString());
      console.log("Selected RubroId for tuition payment:", selectedRubro.id);
      
      // Update the form's rubroId field with the dynamic value
      form.setFieldsValue({ rubroId: selectedRubro.id.toString() });
      
      // Optionally pre-fill the monto if available
      if (selectedRubro.montoPreestablecido) {
        // Update the form's monto field if a predefined amount exists
        form.setFieldsValue({ monto: selectedRubro.montoPreestablecido });
      }
    } catch (error) {
      console.error("Error fetching appropriate RubroId:", error);
      toast.error("Error al obtener el rubro de colegiatura. Se usará el valor predeterminado.");
    } finally {
      setLoadingRubro(false);
    }
  };  // Function to reset the form after a successful submission
  const resetForm = () => {    // Reset form but keep these fields
    form.setFieldsValue({
      cicloEscolar: currentYear,
      fechaPago: dayjs(),
      mes: currentMonth.toString(),
      medioPago: "1",
      notas: "",
      monto: undefined, // Explicitly set monto to undefined to clear the field
      imagenesPago: []
    });
    
    // Clear student selection
    setSelectedStudent(null);
    setAlumnoId(null);
    setSelectedCodigo(null);
    setAutoCompleteValue("");
    setContactos([]);
    setDinamicRubroId("1"); // Reset to default
    form.setFieldsValue({ rubroId: "1" });
  };

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
      
      // Set gradoId and fetch appropriate RubroId
      const studentGradoId = response.gradoId;
      setGradoId(studentGradoId);
      
      // Call the function to fetch the correct RubroId for this student's grade
      if (studentGradoId) {
        await fetchRubroIdForGrado(studentGradoId);
      }      
      // No need for toast notification when student is found by code
    } catch (error: unknown) {
      console.error("Error fetching student by code:", error);
      toast.error("No se encontró ningún alumno con ese código.");
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
    } catch (error: unknown) {
      console.error("Error searching for students:", error);
      toast.error("Error al buscar alumnos.");
    }
  };

  const handleTypeaheadSelect = async (value: string, option: AlumnoOption) => {
    setAutoCompleteValue(option.label);
    setAlumnoId(value);
    setSelectedStudent(option.label);
    try {
      const response = await makeApiRequest<AlumnoDetails>(`/alumnos/codigo/${option.codigo}`, "GET");      setSelectedCodigo(response.codigo);
      // Update contactos info from the response
      setContactos(response.contactos || []);
      
      // Set gradoId and fetch appropriate RubroId
      const studentGradoId = response.gradoId;
      setGradoId(studentGradoId);
      
      // Call the function to fetch the correct RubroId for this student's grade
      if (studentGradoId) {
        await fetchRubroIdForGrado(studentGradoId);
      }
      
      // Success notification removed as it's not necessary
    } catch (error: unknown) {
      console.error("Error fetching student details:", error);
      toast.error("Error al obtener los datos del alumno seleccionado.");
    }  };

  const handleSubmit = async (values: {
    cicloEscolar: string | number;
    fechaPago: dayjs.Dayjs;
    monto: number;
    medioPago: string;
    mes: string | number;
    notas?: string;
    rubroId: string;
    imagenesPago?: { originFileObj?: File }[];
  }) => {
    console.log("Form submitted with values:", values); // Debugging log

    if (!alumnoId) {
      toast.error("Por favor seleccione un alumno antes de enviar el pago.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("Id", "0");
      formData.append("Fecha", values.fechaPago.toISOString());
      formData.append("CicloEscolar", values.cicloEscolar.toString());
      formData.append("Monto", values.monto.toString());
      formData.append("MedioPago", values.medioPago.toString());
      formData.append("MesColegiatura", values.mes.toString());
      formData.append("RubroId", values.rubroId);
      formData.append("AlumnoId", alumnoId);
      formData.append("EsColegiatura", "true");
      formData.append("AnioColegiatura", new Date().getFullYear().toString());
      if (values.notas) formData.append("Notas", values.notas);
      
      // Get the current user ID from localStorage and use it for UsuarioCreacionId
      const userId = getCurrentUserId();
      console.log("Current user ID for form submission:", userId); // Debug log for user ID
      
      // Append the user ID for the UsuarioCreacionId field
      formData.append("UsuarioCreacionId", userId.toString());
      // The old code was using "UsuarioId" with a hardcoded "1", which doesn't match the API's requirements
      
      // Check if imagenesPago exists and is an array before iterating
      if (values.imagenesPago && Array.isArray(values.imagenesPago)) {
        values.imagenesPago.forEach((file, index) => {
          if (file.originFileObj) {
            formData.append(`ImagenesPago[${index}]`, file.originFileObj);
          }
        });
      }
      
      console.log("Sending API request to /pagos with FormData"); // Debug log
      
      // Log FormData entries for debugging
      console.log("FormData contents:");
      for (const pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const response = await makeApiRequest<{ id: number }>("/pagos", "POST", formData);

      toast.success("¡Pago enviado con éxito!");
      console.log("Pago enviado:", response);
      
      // Reset the form after successful submission
      resetForm();
    } catch (err: unknown) {
      console.error("Error details:", err); // Add detailed error logging
      toast.error("Error al enviar el pago. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payments-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
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
            placeholder="Buscar por Nombre o Apellido"
            style={{ width: "100%" }}
            allowClear
            fieldNames={{ label: 'label', value: 'value' }}
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
            <strong>Alumno seleccionado:</strong> {selectedStudent}            <Button
              type="link"
              style={{ marginLeft: "10px", padding: "0" }}
              onClick={() => {
                resetForm();
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
      )}      <Form
        form={form}
        name="payments"
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        className="payments-form"        initialValues={{
          cicloEscolar: currentYear,
          mes: currentMonth.toString(), // Convert to string to match Option values
          fechaPago: dayjs(),
          rubroId: dinamicRubroId, // Initialize with the dynamic RubroId
        }}
      >
        <Form.Item
          label="Ciclo Escolar"
          name="cicloEscolar"
          rules={[{ required: true, message: "¡Por favor ingrese el ciclo escolar!" }]}
        >
          <Input placeholder="Ingrese el ciclo escolar" />
        </Form.Item>        <Form.Item
          label="Fecha de Pago"
          name="fechaPago"
          rules={[{ required: true, message: "¡Por favor seleccione la fecha de pago!" }]}
        >
          <DatePickerES 
            style={{ width: "100%" }}
            placeholder="Seleccione la fecha de pago"
          />
        </Form.Item>

        <Form.Item 
          name="rubroId" 
          initialValue={dinamicRubroId} 
          style={{ display: "none" }}
        >
          <Input 
            type="hidden" 
            disabled={loadingRubro}
          />
        </Form.Item>        <Form.Item
          label="Mes"
          name="mes"
          rules={[{ required: false }]}
        >
          <Select>
            <Option value="1">Enero</Option>
            <Option value="2">Febrero</Option>
            <Option value="3">Marzo</Option>
            <Option value="4">Abril</Option>
            <Option value="5">Mayo</Option>
            <Option value="6">Junio</Option>
            <Option value="7">Julio</Option>
            <Option value="8">Agosto</Option>
            <Option value="9">Septiembre</Option>
            <Option value="10">Octubre</Option>
            <Option value="11">Noviembre</Option>
            <Option value="12">Diciembre</Option>
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
          initialValue="1"
        >
          <Select placeholder="Seleccione el medio de pago">
            <Option value="1">Efectivo</Option>
            <Option value="2">Tarjeta de Crédito</Option>
            <Option value="3">Tarjeta de Débito</Option>
            <Option value="4">Transferencia Bancaria</Option>
            <Option value="5">Cheque</Option>
            <Option value="6">Boleta de Depósito</Option>
            <Option value="7">Pago Móvil</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Notas" name="notas">
          <Input.TextArea placeholder="Agregar notas sobre el pago" rows={4} />
        </Form.Item>        
        
        <Form.Item
          label="Imágenes de Pago"
          name="imagenesPago"
          valuePropName="fileList"
          getValueFromEvent={(e) => {
            console.log("Upload event:", e); // Debug log for upload event
            return Array.isArray(e) ? e : e?.fileList;
          }}
          initialValue={[]}
        >
          <Upload name="imagenesPago" listType="picture" beforeUpload={() => false}>
            <Button icon={<UploadOutlined />}>Subir Imágenes de Pago</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            loading={loading || loadingRubro} 
            disabled={!alumnoId}
          >
            {loadingRubro ? "Obteniendo rubro..." : "Enviar Pago"}
          </Button>        </Form.Item>
      </Form>
    </div>
  );
};

export default Tuitions;
