import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  AutoComplete,
  Select,
  InputNumber,
  Modal,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { makeApiRequest } from "../../services/apiHelper";
import { getCurrentUserId } from "../../services/authService";
import { gradoService } from "../../services/gradoService";
import { rubroService, Rubro } from "../../services/rubroService";
import DatePickerES from "../common/DatePickerES"; // Import our custom DatePicker
import QRCodeModal from "../shared/QRCodeModal";
import PaymentHistoryTable from "../shared/PaymentHistoryTable";
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

// Add Rubro interface - now imported from rubroService

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
    esAnulado?: boolean;
    notas?: string;
  }>;
  contactos: Contacto[];
}

const { Option } = Select;

const OtherPayments: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingRubro, setLoadingRubro] = useState<boolean>(false);
  const [alumnoId, setAlumnoId] = useState<string | null>(null);
  const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null);
  const [typeaheadOptions, setTypeaheadOptions] = useState<AlumnoOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedStudentDetails, setSelectedStudentDetails] =
    useState<AlumnoDetails | null>(null);

  const [autoCompleteValue, setAutoCompleteValue] = useState<string>("");
  const [codigoSearchValue, setCodigoSearchValue] = useState<string>("");
  const [contactos, setContactos] = useState<Contacto[]>([]);
  // Add state for rubros
  const [rubros, setRubros] = useState<Rubro[]>([]); // Add state for selected rubro
  const [selectedRubro, setSelectedRubro] = useState<Rubro | null>(null);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [form] = Form.useForm();

  // QR Code modal state
  const [qrModalVisible, setQrModalVisible] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<{
    id: number;
    fecha: string;
    monto: number;
    rubroDescripcion: string;
    esAnulado?: boolean;
    notas?: string;
  } | null>(null);

  const currentYear = new Date().getFullYear();
  // Fetch rubros on component mount - initially empty until student is selected
  useEffect(() => {
    // Don't fetch rubros on mount, wait for student selection
  }, []);

  // Function to check if all required form fields are filled
  const checkFormValidity = useCallback(() => {
    try {
      const values = form.getFieldsValue();
      const required = ['cicloEscolar', 'fechaPago', 'monto', 'rubroId'];
      
      // Check if all required fields have values
      const hasAllRequiredFields = required.every(field => {
        const value = values[field];
        
        if (field === 'fechaPago') {
          // For DatePicker, be very strict about what constitutes a valid value
          if (!value) return false;
          if (value === null || value === undefined) return false;
          if (typeof value !== 'object') return false;
          if (!value.isValid || typeof value.isValid !== 'function') return false;
          return value.isValid();
        }
        
        // For other fields, check they have meaningful values
        if (value === undefined || value === null || value === '') return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        return true;
      });
      
      const isValid = hasAllRequiredFields && !!alumnoId && !!selectedRubro;
      
      // Force update if the validity state has changed
      if (isValid !== isFormValid) {
        setIsFormValid(isValid);
      }
      
      return isValid;
    } catch (error) {
      console.error('Error in form validation:', error);
      setIsFormValid(false);
      return false;
    }
  }, [form, alumnoId, selectedRubro, isFormValid]);

  // Watch for form field changes
  useEffect(() => {
    checkFormValidity();
    
    // Set up a polling mechanism to check form validity every 100ms
    // This ensures we catch any changes that might not trigger the normal events
    const interval = setInterval(() => {
      checkFormValidity();
    }, 100);
    
    return () => clearInterval(interval);
  }, [checkFormValidity]);

  // Additional effect to watch specifically for form changes
  useEffect(() => {
    // Force a validation check whenever dependencies change
    checkFormValidity();
  }, [alumnoId, selectedRubro, checkFormValidity]);

  // Function to fetch and filter appropriate Rubros for Other Payments
  const fetchRubrosForOtherPayments = async (studentGradoId: number) => {
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

      // Step 3: Filter Rubros for Other Payments
      const otherPaymentRubros = activeRubros.filter(
        (rubro) =>
          // Include rubros that match the student's NivelEducativoId OR wildcard (999)
          (rubro.nivelEducativoId === nivelEducativoId ||
            rubro.nivelEducativoId === 999) &&
          // Exclude colegiatura rubros
          rubro.esColegiatura !== true &&
          // Exclude transport rubros
          rubro.esPagoDeTransporte !== true &&
          // Exclude uniform rubros
          rubro.esPagoDeUniforme !== true
      );

      // Step 4: Update the rubros state
      setRubros(otherPaymentRubros);
      console.log("Filtered rubros for other payments:", otherPaymentRubros);

      if (otherPaymentRubros.length === 0) {
        toast.warning(
          "No se encontraron rubros disponibles para este estudiante."
        );
      }
    } catch (error) {
      console.error("Error fetching appropriate Rubros:", error);
      toast.error(
        "Error al obtener los rubros disponibles para este estudiante."
      );
    } finally {
      setLoadingRubro(false);
    }
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

      // Fetch appropriate rubros for this student
      await fetchRubrosForOtherPayments(response.gradoId);

      // Clear the search input after successful search
      setCodigoSearchValue("");
    } catch {
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
    } catch {
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

      // Fetch appropriate rubros for this student
      await fetchRubrosForOtherPayments(response.gradoId);
      // Success toast removed as requested
    } catch {
      toast.error("Error al obtener los datos del alumno seleccionado.");
    }
  };
  // Add handler for rubro selection
  const handleRubroChange = (rubroId: string) => {
    const selected = rubros.find((rubro) => rubro.id.toString() === rubroId);
    setSelectedRubro(selected || null);
    if (selected && selected.montoPreestablecido) {
      form.setFieldsValue({ monto: selected.montoPreestablecido });
    }
  };
  // Handle form submission
  const handleSubmit = async (values: {
    cicloEscolar: string;
    fechaPago: dayjs.Dayjs;
    monto: number;
    medioPago: string;
    mes: string | null;
    rubroId: string;
    notas?: string;
    imagenesPago?: { originFileObj?: File }[]; // More specific type for uploaded files
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
      formData.append("CicloEscolar", values.cicloEscolar);
      formData.append("Monto", values.monto.toString());
      formData.append("MedioPago", values.medioPago);
      formData.append("RubroId", values.rubroId);
      formData.append("AlumnoId", alumnoId);
      formData.append("EsColegiatura", "false"); // Changed: this is OtherPayments, not tuition

      // Check if the selected rubro is for ID card payment and set the appropriate fields
      if (selectedRubro?.esPagoDeCarnet) {
        formData.append("EsPagoDeCarnet", "true");
        formData.append("EstadoCarnet", "PAGADO");
      } else {
        formData.append("EsPagoDeCarnet", "false");
        formData.append("EstadoCarnet", "");
      }

      // Only add MesColegiatura and AnioColegiatura if needed
      if (values.mes) {
        formData.append("MesColegiatura", values.mes);
        formData.append("AnioColegiatura", new Date().getFullYear().toString());
      }

      if (values.notas) formData.append("Notas", values.notas);

      // Get the current user ID from localStorage and use it for UsuarioCreacionId
      const userId = getCurrentUserId();
      console.log("Current user ID for form submission:", userId);
      formData.append("UsuarioCreacionId", userId.toString());

      // Log FormData entries for debugging
      console.log("FormData contents:");
      for (const pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // Handle file uploads properly, checking for undefined
      if (values.imagenesPago && values.imagenesPago.length > 0) {
        values.imagenesPago.forEach((file, index) => {
          if (file.originFileObj) {
            formData.append(`ImagenesPago[${index}]`, file.originFileObj);
          }
        });
      }

      console.log("Sending payment data to server..."); // Add debug log
      const response = await makeApiRequest<{ id: number }>(
        "/pagos",
        "POST",
        formData
      );
      console.log("Payment response:", response); // Add debug log

      // Show success toast notification
      toast.success("¡Pago enviado con éxito!");

      // Reset form fields but keep student information
      resetFormKeepStudent();
      
      // Refresh student details to show the new payment in history
      await refreshStudentDetails();
    } catch (err) {
      console.error("Error submitting payment:", err); // Add error logging
      toast.error("Error al enviar el pago. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Function to reset only form fields but keep student information
  const resetFormKeepStudent = () => {
    // Reset form fields but preserve student data
    form.resetFields();
    form.setFieldsValue({
      cicloEscolar: currentYear,
      fechaPago: dayjs(),
      medioPago: "1",
      notas: "",
      monto: selectedRubro?.montoPreestablecido || undefined,
      rubroId: selectedRubro?.id?.toString() || undefined,
      imagenesPago: [],
    });
    setIsFormValid(false); // Reset form validation to require user to fill fields again
  };

  // Function to refresh student details to get updated payment history
  const refreshStudentDetails = async () => {
    if (!selectedStudentDetails) return;
    
    try {
      const response = await makeApiRequest<AlumnoDetails>(
        `/alumnos/codigo/${selectedStudentDetails.codigo}`,
        "GET"
      );
      setSelectedStudentDetails(response);
      setContactos(response.contactos || []);
      console.log("Student details refreshed after payment submission");
    } catch (error) {
      console.error("Error refreshing student details:", error);
      // Don't show error to user as this is just for refreshing data
    }
  };

  // QR Code modal handlers
  const handleShowQRCode = (payment: {
    id: number;
    fecha: string;
    monto: number;
    rubroDescripcion: string;
    esAnulado?: boolean;
    notas?: string;
  }) => {
    console.log('[OtherPayments] handleShowQRCode called with payment:', payment);
    setSelectedPayment(payment);
    setQrModalVisible(true);
    console.log('[OtherPayments] QR modal opened for payment ID:', payment.id);
  };

  const handleCloseQRModal = () => {
    setQrModalVisible(false);
    setSelectedPayment(null);
  };

  return (
    <div className="payments-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <h2>Realizar un Pago</h2>

      <div style={{ marginBottom: "20px" }}>
        {" "}
        <Input.Search
          value={codigoSearchValue}
          placeholder="Buscar por Código"
          enterButton="Buscar"
          onSearch={handleCodigoSearch}
          onChange={(e) => setCodigoSearchValue(e.target.value)}
          style={{ marginBottom: "10px" }}
        />{" "}
        <div style={{ marginBottom: "15px" }}>
          <AutoComplete
            value={autoCompleteValue}
            options={typeaheadOptions}
            onSearch={handleTypeaheadSearch}
            onSelect={handleTypeaheadSelect}
            placeholder="Buscar por Nombre o Apellido"
            style={{ width: "100%" }}
            allowClear
            defaultActiveFirstOption={false}
            onClear={() => {
              setAutoCompleteValue("");
              setTypeaheadOptions([]);
              setAlumnoId(null);
              setSelectedStudent(null);
              setSelectedStudentDetails(null);
              setSelectedCodigo(null);
              setContactos([]);
            }}
            fieldNames={{ label: "label", value: "value" }}
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
                setSelectedStudent(null);
                setSelectedStudentDetails(null);
                setAlumnoId(null);
                setSelectedCodigo(null);
                setAutoCompleteValue("");
                setCodigoSearchValue("");
                setTypeaheadOptions([]);
                setContactos([]);
                setRubros([]);
                setSelectedRubro(null);
                form.resetFields();
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
      )}

      {/* Payment History Section */}
      <PaymentHistoryTable
        payments={selectedStudentDetails?.pagos || []}
        onShowQRCode={handleShowQRCode}
        title="Historial de Pagos"
      />

      <Form
        name="payments"
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={checkFormValidity}
        autoComplete="off"
        className="payments-form"
        initialValues={{
          cicloEscolar: currentYear,
          mes: null, // Changed from currentMonth to null to make "Sin mes específico" the default
          monto: 150,
          fechaPago: dayjs().startOf("day"), // Set to start of the current day
          medioPago: "1", // Set "Efectivo" as default
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
            defaultValue={dayjs().startOf('day')}
            onChange={(date) => {
              // Immediately update the form field
              form.setFieldsValue({ fechaPago: date });
              
              // Trigger form field validation immediately
              form.validateFields(['fechaPago']).catch(() => {
                // Ignore validation errors, they will be shown in the UI
              });
              
              // Check validity immediately and with delays
              const checkWithDelay = () => {
                const isValid = checkFormValidity();
                console.log(`Form validity check: ${isValid}, date value:`, date);
              };
              
              checkWithDelay();
              setTimeout(checkWithDelay, 10);
              setTimeout(checkWithDelay, 50);
              setTimeout(checkWithDelay, 100);
              setTimeout(checkWithDelay, 200);
            }}
          />
        </Form.Item>{" "}
        <Form.Item
          label="Rubro"
          name="rubroId"
          rules={[{ required: true, message: "Por favor seleccione un rubro" }]}
        >
          <Select
            placeholder={
              loadingRubro
                ? "Cargando rubros..."
                : selectedStudent
                ? "Seleccione el rubro"
                : "Primero seleccione un estudiante"
            }
            onChange={handleRubroChange}
            loading={loadingRubro}
            disabled={!selectedStudent || loadingRubro}
          >
            {rubros.map((rubro) => (
              <Option key={rubro.id} value={rubro.id.toString()}>
                {rubro.descripcion}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Mes" name="mes" rules={[{ required: false }]}>
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
            parser={(value) => (value ? value.replace(/Q\s?|(,*)/g, "") : "")}
            onKeyPress={(event) => {
              if (!/[0-9.]/.test(event.key)) {
                event.preventDefault();
              }
            }}
          />
        </Form.Item>{" "}
        <Form.Item
          label="Medio de Pago"
          name="medioPago"
          rules={[
            { required: true, message: "¡Por favor ingrese el medio de pago!" },
          ]}
          initialValue="1"
        >
          {" "}
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
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
        >
          <Upload
            name="imagenesPago"
            listType="picture-card"
            beforeUpload={() => false}
            onPreview={(file) => {
              console.log("Preview clicked for file:", file); // Debug log
              console.log("file.url:", file.url); // Debug file URL
              console.log("file.originFileObj:", file.originFileObj); // Debug originFileObj
              console.log("file keys:", Object.keys(file)); // Debug all file properties
              
              // Create a preview URL for the file
              let url = '';
              let createdUrl = false;
              
              try {
                if (file.url) {
                  url = file.url;
                  console.log("Using existing file.url:", url);
                } else if (file.originFileObj) {
                  console.log("Creating URL from originFileObj...");
                  url = URL.createObjectURL(file.originFileObj);
                  createdUrl = true;
                  console.log("Created URL from originFileObj:", url);
                } else if (file instanceof File) {
                  console.log("Creating URL from file directly...");
                  url = URL.createObjectURL(file);
                  createdUrl = true;
                  console.log("Created URL from file:", url);
                }
              } catch (error) {
                console.error("Error creating object URL:", error);
              }
              
              console.log("Final generated URL:", url); // Debug generated URL
              
              if (url) {
                console.log("Opening image in new tab...");
                window.open(url, '_blank');
                
                // Clean up the URL after a short delay
                if (createdUrl && url) {
                  setTimeout(() => {
                    console.log("Cleaning up URL:", url);
                    URL.revokeObjectURL(url);
                  }, 2000);
                }
              } else {
                console.error("No URL available for preview", file);
                // Try window.open as a fallback
                if (file.originFileObj) {
                  const fallbackUrl = URL.createObjectURL(file.originFileObj);
                  window.open(fallbackUrl, '_blank');
                  // Clean up after a delay
                  setTimeout(() => URL.revokeObjectURL(fallbackUrl), 1000);
                } else {
                  Modal.error({
                    title: 'Error',
                    content: 'No se pudo generar una vista previa de la imagen.',
                  });
                }
              }
            }}
            showUploadList={{
              showPreviewIcon: true,
              showRemoveIcon: true,
              showDownloadIcon: false,
            }}
          >
            <Button icon={<UploadOutlined />}>Subir Imágenes de Pago</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            disabled={!isFormValid}
          >
            Enviar Pago
          </Button>
        </Form.Item>
      </Form>

      {/* QR Code Modal */}
      <QRCodeModal
        payment={selectedPayment}
        studentName={selectedStudent || undefined}
        visible={qrModalVisible}
        onClose={handleCloseQRModal}
      />
    </div>
  );
};

export default OtherPayments;
