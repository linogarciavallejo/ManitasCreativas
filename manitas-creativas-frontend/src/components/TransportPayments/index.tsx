import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  AutoComplete,
  Select,
  InputNumber,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { makeApiRequest } from "../../services/apiHelper";
import { getCurrentUserId } from "../../services/authService";
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
    telefonoTrabajo?: string;
    celular?: string;
    email?: string;
    direccion?: string;
    nit?: string;
  };
  parentesco: string;
}

interface Rubro {
  id: number;
  descripcion: string;
  tipo: string;
  montoPreestablecido?: number;
  esColegiatura: boolean;
  esPagoDeTransporte?: boolean;
}

interface AlumnoDetails {
  id: number;
  codigo: string;
  primerNombre: string;
  segundoNombre: string;
  tercerNombre: string;
  primerApellido: string;
  segundoApellido: string;
  sedeId: number;
  sedeNombre: string;
  gradoId: number;
  gradoNombre: string;
  seccion: string | null;
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

const TransportPayments: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingRubro, setLoadingRubro] = useState<boolean>(false);
  const [alumnoId, setAlumnoId] = useState<string | null>(null);
  const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null);
  const [typeaheadOptions, setTypeaheadOptions] = useState<AlumnoOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedStudentDetails, setSelectedStudentDetails] =
    useState<AlumnoDetails | null>(null);
  const [autoCompleteValue, setAutoCompleteValue] = useState<string>("");
  const [contactos, setContactos] = useState<Contacto[]>([]);
  // Add state for transport rubros
  const [transportRubros, setTransportRubros] = useState<Rubro[]>([]);
  // Add state for selected rubro
  const [selectedRubro, setSelectedRubro] = useState<Rubro | null>(null);
  const [dinamicRubroId, setDinamicRubroId] = useState<string>("1"); // Default to "1" but will be updated
  const [form] = Form.useForm(); // Add Form instance
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-based month number

  // Fetch transport rubros on component mount
  useEffect(() => {
    const fetchTransportRubros = async () => {
      try {
        setLoadingRubro(true);
        const activeRubros = await rubroService.getActiveRubros();
        const transportRubros = activeRubros.filter(
          (rubro) => rubro.esPagoDeTransporte === true
        );
        setTransportRubros(transportRubros);
      } catch (error) {
        console.error("Error fetching transport rubros:", error);
        toast.error("Error al cargar los rubros de transporte.");
      } finally {
        setLoadingRubro(false);
      }
    };

    fetchTransportRubros();
  }, []);

  // Add handler for rubro selection
  const handleRubroChange = (rubroId: string) => {
    const selected = transportRubros.find(
      (rubro) => rubro.id.toString() === rubroId
    );
    setSelectedRubro(selected || null);
    setDinamicRubroId(rubroId);

    if (selected && selected.montoPreestablecido) {
      form.setFieldsValue({ monto: selected.montoPreestablecido });
    }
  };

  // Function to get month name for display
  // Update form values when dinamicRubroId changes
  useEffect(() => {
    form.setFieldsValue({ rubroId: dinamicRubroId });
  }, [dinamicRubroId, form]); // Function to reset the form after a successful submission
  const resetForm = () => {
    // Reset form but keep these fields
    form.setFieldsValue({
      cicloEscolar: currentYear,
      fechaPago: dayjs(),
      mes: currentMonth.toString(),
      medioPago: "1",
      notas: "",
      monto: undefined, // Explicitly set monto to undefined to clear the field
      rubroId: undefined, // Clear rubro selection
      imagenesPago: [],
    });

    // Clear student selection
    setSelectedStudent(null);
    setSelectedStudentDetails(null);
    setAlumnoId(null);
    setSelectedCodigo(null);
    setAutoCompleteValue("");
    setContactos([]);
    setDinamicRubroId("1"); // Reset to default
    setSelectedRubro(null); // Clear selected rubro
  };

  // Search by codigo input
  const handleCodigoSearch = async (codigo: string) => {
    try {
      const response = await makeApiRequest<AlumnoDetails>(
        `/alumnos/codigo/${codigo}`,
        "GET"
      );
      setAlumnoId(response.id.toString());
      setSelectedCodigo(response.codigo);
      setSelectedStudent(
        `${response.primerNombre} ${response.segundoNombre} ${response.tercerNombre} ${response.primerApellido} ${response.segundoApellido}`
          .replace(/\s+/g, ' ')
          .trim()
      ); 
      setSelectedStudentDetails(response);
      // Update contactos info from the response
      setContactos(response.contactos || []);

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
      const response = await makeApiRequest<AlumnoDetails>(
        `/alumnos/codigo/${option.codigo}`,
        "GET"
      );
      setSelectedStudentDetails(response);
      setSelectedCodigo(response.codigo);
      // Update contactos info from the response
      setContactos(response.contactos || []);

      // Success notification removed as it's not necessary
    } catch (error: unknown) {
      console.error("Error fetching student details:", error);
      toast.error("Error al obtener los datos del alumno seleccionado.");
    }
  };

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

      // Set transport payment flag to true
      formData.append("EsPagoDeTransporte", "true");

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
        console.log(pair[0] + ": " + pair[1]);
      }

      const response = await makeApiRequest<{ id: number }>(
        "/pagos",
        "POST",
        formData
      );

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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <h2>Realizar un Pago de Bus</h2>
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
            fieldNames={{ label: "label", value: "value" }}
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
            <strong>Alumno seleccionado:</strong> {selectedStudent}{" "}
            {selectedStudentDetails &&
              (selectedStudentDetails.gradoNombre ||
                selectedStudentDetails.seccion) && (
                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  {selectedStudentDetails.gradoNombre &&
                    `Grado: ${selectedStudentDetails.gradoNombre}`}
                  {selectedStudentDetails.gradoNombre &&
                    selectedStudentDetails.seccion &&
                    " • "}
                  {selectedStudentDetails.seccion &&
                    `Sección: ${selectedStudentDetails.seccion}`}
                </div>
              )}{" "}
            <Button
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
          <ul style={{ paddingLeft: "20px" }}>            {contactos.map((contacto) => (
              <li key={contacto.contactoId}>
                <strong>{contacto.parentesco}:</strong>{" "}
                {contacto.contacto.nombre} — {contacto.contacto.telefonoTrabajo || contacto.contacto.celular || 'Sin teléfono'} —{" "}
                {contacto.contacto.email}
              </li>
            ))}
          </ul>
        </div>
      )}{" "}
      <Form
        form={form}
        name="payments"
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        className="payments-form"
        initialValues={{
          cicloEscolar: currentYear,
          mes: currentMonth.toString(), // Convert to string to match Option values
          fechaPago: dayjs(),
          // Remove rubroId from initial values since it will be selected manually
        }}
      >
        <Form.Item
          label="Ciclo Escolar"
          name="cicloEscolar"
          rules={[
            { required: true, message: "¡Por favor ingrese el ciclo escolar!" },
          ]}
        >
          <Input placeholder="Ingrese el ciclo escolar" />
        </Form.Item>{" "}
        <Form.Item
          label="Fecha de Pago"
          name="fechaPago"
          rules={[
            {
              required: true,
              message: "¡Por favor seleccione la fecha de pago!",
            },
          ]}
        >
          <DatePickerES
            style={{ width: "100%" }}
            placeholder="Seleccione la fecha de pago"
          />{" "}
        </Form.Item>
        <Form.Item
          label="Rubro de Transporte"
          name="rubroId"
          rules={[
            {
              required: true,
              message: "Por favor seleccione un rubro de transporte",
            },
          ]}
        >
          <Select
            placeholder="Seleccione el rubro de transporte"
            onChange={handleRubroChange}
            loading={loadingRubro}
            disabled={loadingRubro}
          >
            {transportRubros.map((rubro) => (
              <Option key={rubro.id} value={rubro.id.toString()}>
                {rubro.descripcion}
              </Option>
            ))}
          </Select>{" "}
        </Form.Item>        <Form.Item label="Mes" name="mes" rules={[{ required: false }]}>
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
            parser={(value) => (value ? value.replace(/Q\s?|(,*)/g, "") : "")}
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
          rules={[
            { required: true, message: "¡Por favor ingrese el medio de pago!" },
          ]}
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
          <Upload
            name="imagenesPago"
            listType="picture"
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />}>Subir Imágenes de Pago</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          {" "}
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading || loadingRubro}
            disabled={!alumnoId || !selectedRubro}
          >
            {loadingRubro ? "Cargando rubros..." : "Enviar Pago"}
          </Button>{" "}
        </Form.Item>
      </Form>
    </div>
  );
};

export default TransportPayments;
