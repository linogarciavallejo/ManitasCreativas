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
import { rubroService } from "../../services/rubroService";
import { routeAssignmentService } from "../../services/routeAssignmentService";
import { AlumnoRuta } from "../../types/routeAssignment";
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

interface Rubro {
  id: number;
  descripcion: string;
  tipo: number;
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
    esAnulado?: boolean;
    notas?: string;
    cicloEscolar?: number;
    mesColegiatura?: number;
    anioColegiatura?: number;
    esPagoDeTransporte?: boolean;
    rubroId?: number;
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
  const [studentActiveRoutes, setStudentActiveRoutes] = useState<AlumnoRuta[]>([]);
  const [studentHasValidRoute, setStudentHasValidRoute] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [form] = Form.useForm(); // Add Form instance

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

  // Function to check if a route is currently active
  const isRouteActive = (route: AlumnoRuta): boolean => {
    const today = new Date();
    const startDate = new Date(route.fechaInicio);
    
    // Route is active if:
    // 1. Start date is <= today
    // 2. End date is null/undefined (no end date) OR end date is >= today
    const isAfterStart = startDate <= today;
    const isBeforeEnd = !route.fechaFin || new Date(route.fechaFin) >= today;
    
    return isAfterStart && isBeforeEnd;
  };

  // Function to validate student route assignments and set active route
  const validateAndSetStudentRoute = async (studentId: number) => {
    try {
      setLoadingRubro(true);
      
      // Get all route assignments for the student
      const allRoutes = await routeAssignmentService.getStudentAllRouteAssignments(studentId);
      console.log("All routes for student:", allRoutes);
      
      // Filter to get only active routes
      const activeRoutes = allRoutes.filter(route => isRouteActive(route));
      console.log("Active routes for student:", activeRoutes);
      
      setStudentActiveRoutes(activeRoutes);
      console.log("Student active routes set:", studentActiveRoutes); // Use the state for logging
      
      if (activeRoutes.length === 0) {
        // No active routes - student cannot make transport payment
        setStudentHasValidRoute(false);
        setSelectedRubro(null);
        setDinamicRubroId("");
        
        toast.error(
          "Este estudiante no tiene una ruta de transporte activa asignada. " +
          "Por favor, asigne una ruta antes de realizar el pago."
        );
        return false;
      }
      
      // Student has active routes - set the first active route as default
      const primaryRoute = activeRoutes[0];
      setStudentHasValidRoute(true);
      setDinamicRubroId(primaryRoute.rubroTransporteId.toString());
      
      // Find the corresponding rubro in transportRubros
      const matchingRubro = transportRubros.find(r => r.id === primaryRoute.rubroTransporteId);
      if (matchingRubro) {
        setSelectedRubro(matchingRubro);
        
        // Auto-fill the amount if available
        if (matchingRubro.montoPreestablecido) {
          form.setFieldsValue({ monto: matchingRubro.montoPreestablecido });
        }
        
        // Set the route in the form
        form.setFieldsValue({ rubroId: primaryRoute.rubroTransporteId.toString() });
        
        if (activeRoutes.length > 1) {
          toast.info(
            `Este estudiante tiene ${activeRoutes.length} rutas activas. ` +
            `Se ha seleccionado automáticamente: ${matchingRubro.descripcion}`
          );
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error validating student route:", error);
      setStudentHasValidRoute(false);
      toast.error("Error al validar las rutas del estudiante.");
      return false;
    } finally {
      setLoadingRubro(false);
    }
  };
  
  // Add handler for rubro selection (kept for reference but not actively used since routes are auto-selected)
  // const handleRubroChange = (rubroId: string) => {
  //   const selected = transportRubros.find(
  //     (rubro) => rubro.id.toString() === rubroId
  //   );
  //   setSelectedRubro(selected || null);
  //   setDinamicRubroId(rubroId);
  //
  //   if (selected && selected.montoPreestablecido) {
  //     form.setFieldsValue({ monto: selected.montoPreestablecido });
  //   }
  // };

  // Function to get month name for display
  // Update form values when dinamicRubroId changes
  useEffect(() => {
    form.setFieldsValue({ rubroId: dinamicRubroId });
  }, [dinamicRubroId, form]);

  // Function to check if all required form fields are filled
  const checkFormValidity = useCallback(() => {
    try {
      const values = form.getFieldsValue();
      const required = ['cicloEscolar', 'fechaPago', 'monto'];
      
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
      
      const isValid = hasAllRequiredFields && !!alumnoId && !!selectedRubro && studentHasValidRoute;
      
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
  }, [form, alumnoId, selectedRubro, studentHasValidRoute, isFormValid]);

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
  }, [alumnoId, selectedRubro, studentHasValidRoute, checkFormValidity]);

  // Function to reset the form after a successful submission
  const resetForm = () => {
    // Reset form but keep these fields
    form.setFieldsValue({
      cicloEscolar: currentYear,
      fechaPago: dayjs().startOf('day'),
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
    setStudentActiveRoutes([]); // Clear active routes
    setStudentHasValidRoute(false); // Reset route validation
    setIsFormValid(false); // Reset form validation
  };

  // Function to check for duplicate transport payments
  const checkForDuplicateTransportPayment = (cicloEscolar: number, mes: number, rubroId: number): boolean => {
    if (!selectedStudentDetails || !selectedStudentDetails.pagos) {
      return false; // No existing payments to check against
    }

    // Filter for transport payments that are not voided/canceled
    const existingTransportPayments = selectedStudentDetails.pagos.filter(pago => {
      const isTransportPayment = pago.esPagoDeTransporte === true;
      const isNotVoided = pago.esAnulado !== true;
      
      return isTransportPayment && isNotVoided;
    });

    // Check if there's already a payment for this student, school year, month, and rubro
    const duplicatePayment = existingTransportPayments.find(pago => {
      const matchesCiclo = pago.cicloEscolar === cicloEscolar;
      const matchesMes = pago.mesColegiatura === mes;
      const matchesRubro = pago.rubroId === rubroId;
      
      return matchesCiclo && matchesMes && matchesRubro;
    });

    return !!duplicatePayment;
  };

  // Function to reset only form fields but keep student information
  const resetFormKeepStudent = () => {
    // Reset form fields but preserve student data
    form.setFieldsValue({
      cicloEscolar: currentYear,
      fechaPago: dayjs().startOf('day'),
      mes: currentMonth.toString(),
      medioPago: "1",
      notas: "",
      monto: selectedRubro?.montoPreestablecido || undefined,
      rubroId: dinamicRubroId,
      imagenesPago: [],
    });
    setIsFormValid(false); // Reset form validation to require user to fill fields again
  };

  // Function to refresh student details to get updated payment history
  const refreshStudentDetails = async () => {
    if (!selectedStudentDetails) return;
    
    try {
      const response = await makeApiRequest<AlumnoDetails>(
        `/alumnos/${selectedStudentDetails.id}`,
        "GET"
      );
      setSelectedStudentDetails(response);
    } catch (error) {
      console.error("Error refreshing student details:", error);
      // Don't show error to user as this is just for refreshing data
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

      // Validate and set active route for the student
      await validateAndSetStudentRoute(response.id);

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
        `/alumnos/${value}`,
        "GET"
      );
      setSelectedStudentDetails(response);
      setSelectedCodigo(response.codigo);
      // Update contactos info from the response
      setContactos(response.contactos || []);

      // Validate and set active route for the student
      await validateAndSetStudentRoute(parseInt(value));

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

    if (!studentHasValidRoute) {
      toast.error("El estudiante seleccionado no tiene una ruta de transporte activa asignada.");
      return;
    }

    // Check for duplicate transport payment validation
    const cicloEscolar = parseInt(values.cicloEscolar.toString());
    const mes = parseInt(values.mes.toString());
    const rubroId = parseInt(values.rubroId.toString());
    
    if (checkForDuplicateTransportPayment(cicloEscolar, mes, rubroId)) {
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const monthName = monthNames[mes - 1] || mes.toString();
      const rubroDescription = selectedRubro?.descripcion || 'transporte';
      
      toast.error(`Ya existe un pago de ${rubroDescription.toLowerCase()} para ${selectedStudent} en ${monthName} ${cicloEscolar}. No se pueden registrar pagos duplicados para el mismo mes y año escolar.`);
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
      formData.append("EsColegiatura", "false");
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

      // Reset form fields but keep student information
      resetFormKeepStudent();
      
      // Wait for student details to refresh before allowing next payment
      await refreshStudentDetails();
    } catch (err: unknown) {
      console.error("Error details:", err); // Add detailed error logging
      toast.error("Error al enviar el pago. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
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
    console.log('[TransportPayments] handleShowQRCode called with payment:', payment);
    setSelectedPayment(payment);
    setQrModalVisible(true);
    console.log('[TransportPayments] QR modal opened for payment ID:', payment.id);
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

      {/* Payment History Section */}
      <PaymentHistoryTable
        payments={selectedStudentDetails?.pagos || []}
        onShowQRCode={handleShowQRCode}
        title="Historial de Pagos"
        showMonthColumn={true}
        hideConceptoColumn={true}
      />{" "}
      
      {/* Display warning if student has no valid routes */}
      {selectedStudent && !studentHasValidRoute && (
        <div style={{ marginBottom: "20px", padding: "12px", backgroundColor: "#fff2e8", border: "1px solid #ffb366", borderRadius: "6px" }}>
          <div style={{ color: "#d46b08", fontWeight: "bold" }}>⚠️ Atención</div>
          <div style={{ color: "#d46b08", marginTop: "4px" }}>
            Este estudiante no tiene una ruta de transporte activa asignada. 
            Para realizar un pago de transporte, primero debe asignar al estudiante a una ruta activa.
          </div>
        </div>
      )}
      
      <Form
        form={form}
        name="payments"
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={checkFormValidity}
        autoComplete="off"
        className="payments-form"
        initialValues={{
          cicloEscolar: currentYear,
          mes: currentMonth.toString(), // Convert to string to match Option values
          fechaPago: dayjs().startOf('day'),
          medioPago: "1",
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
            defaultValue={dayjs()}
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
          />{" "}
        </Form.Item>
        
        {/* Display assigned route as static text instead of dropdown */}
        {studentHasValidRoute && selectedRubro ? (
          <div style={{ marginBottom: "24px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "500",
              color: "#262626",
              fontSize: "14px"
            }}>
              Ruta de Bus
            </label>
            <div style={{
              padding: "8px 12px",
              backgroundColor: "#f5f5f5",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
              color: "#595959",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{ color: "#52c41a", fontSize: "16px" }}>✓</span>
              <span><strong>{selectedRubro.descripcion}</strong></span>
              <span style={{ color: "#8c8c8c", fontSize: "12px" }}>
                (Asignada automáticamente)
              </span>
            </div>
            <div style={{ 
              marginTop: "4px", 
              fontSize: "12px", 
              color: "#8c8c8c" 
            }}>
              Ruta asignada basada en las asignaciones activas del estudiante
            </div>
          </div>
        ) : !studentHasValidRoute && selectedStudent ? (
          <div style={{ marginBottom: "24px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "500",
              color: "#262626",
              fontSize: "14px"
            }}>
              Ruta de Bus
            </label>
            <div style={{
              padding: "8px 12px",
              backgroundColor: "#fff2e8",
              border: "1px solid #ffb366",
              borderRadius: "6px",
              color: "#d46b08",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{ fontSize: "16px" }}>⚠️</span>
              <span>No hay ruta de bus asignada</span>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "24px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "500",
              color: "#262626",
              fontSize: "14px"
            }}>
              Ruta de Bus
            </label>
            <div style={{
              padding: "8px 12px",
              backgroundColor: "#fafafa",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
              color: "#bfbfbf",
              fontSize: "14px",
              fontStyle: "italic"
            }}>
              Seleccione un estudiante para ver la ruta asignada
            </div>
          </div>
        )}
        
        {/* Hidden field to store the selected route ID */}
        <Form.Item name="rubroId" style={{ display: "none" }}>
          <Input type="hidden" />
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
          {" "}
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading || loadingRubro}
            disabled={!isFormValid}
          >
            {loadingRubro ? "Validando ruta..." : "Enviar Pago"}
          </Button>{" "}
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

export default TransportPayments;
