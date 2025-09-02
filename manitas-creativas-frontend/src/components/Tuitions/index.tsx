import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { rubroService } from "../../services/rubroService";
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
    esColegiatura?: boolean;
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
  const [selectedStudentDetails, setSelectedStudentDetails] =
    useState<AlumnoDetails | null>(null);
  const [autoCompleteValue, setAutoCompleteValue] = useState<string>("");
  const [codigoSearchValue, setCodigoSearchValue] = useState<string>("");
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [dinamicRubroId, setDinamicRubroId] = useState<string>("1");
  const [hasValidRubro, setHasValidRubro] = useState<boolean>(false);
  const [rubroValidationComplete, setRubroValidationComplete] = useState<boolean>(false);
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
  const currentMonth = new Date().getMonth() + 1;

  // Refs for debouncing
  const cicloLookupTimeout = useRef<number | undefined>(undefined);
  const isUpdatingRubro = useRef<boolean>(false);

  // Update form values when dinamicRubroId changes
  useEffect(() => {
    form.setFieldsValue({ rubroId: dinamicRubroId });
  }, [dinamicRubroId, form]);

  // Helper to get the tuition rubro matching Nivel + Ciclo
  const findTuitionRubro = useCallback(async (nivelEducativoId: number, cicloEscolar: number) => {
    const activeRubros = await rubroService.getActiveRubros();
    const tuitionRubros = activeRubros.filter(r =>
      r.nivelEducativoId === nivelEducativoId && r.esColegiatura === true && r.cicloEscolar === cicloEscolar
    );
    if (tuitionRubros.length === 0) return null;
    return tuitionRubros.find(r => r.montoPreestablecido !== undefined) || tuitionRubros[0];
  }, []);

  // Function to check if all required form fields are filled
  const checkFormValidity = useCallback(() => {
    try {
      const values = form.getFieldsValue();
      const required = ['cicloEscolar', 'fechaPago', 'monto'];
      
      const hasAllRequiredFields = required.every(field => {
        const value = values[field];
        
        if (field === 'fechaPago') {
          if (!value) return false;
          if (value === null || value === undefined) return false;
          // For dayjs objects, check if it's valid
          if (typeof value === 'object' && value.isValid && typeof value.isValid === 'function') {
            return value.isValid();
          }
          // For other date representations, just check if it exists
          return true;
        }
        
        if (value === undefined || value === null || value === '') return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        return true;
      });
      
      const isValid = hasAllRequiredFields && !!alumnoId && hasValidRubro && !loadingRubro;
      
      if (isValid !== isFormValid) {
        setIsFormValid(isValid);
      }
      
      return isValid;
    } catch (error) {
      console.error('Error in form validation:', error);
      setIsFormValid(false);
      return false;
    }
  }, [form, alumnoId, hasValidRubro, isFormValid, loadingRubro]);

  // Watch for form field changes
  useEffect(() => {
    checkFormValidity();
    
    const interval = setInterval(() => {
      checkFormValidity();
    }, 100);
    
    return () => clearInterval(interval);
  }, [checkFormValidity]);

  useEffect(() => {
    checkFormValidity();
  }, [alumnoId, hasValidRubro, loadingRubro, checkFormValidity]);

  // Debounced function to fetch rubro based on ciclo escolar
  const debouncedFetchRubro = useCallback(async (cicloEscolar: string | number) => {
    if (cicloLookupTimeout.current) {
      clearTimeout(cicloLookupTimeout.current);
    }

    cicloLookupTimeout.current = window.setTimeout(async () => {
      const ciclo = parseInt(cicloEscolar.toString());
      
      // Validate ciclo escolar
      if (isNaN(ciclo) || ciclo < 2000 || ciclo > 2100) {
        console.log('Invalid ciclo escolar, skipping rubro fetch');
        return;
      }

      if (!selectedStudentDetails?.gradoId) {
        console.log('No student selected or gradoId missing, skipping rubro fetch');
        return;
      }

      try {
        setLoadingRubro(true);
        setRubroValidationComplete(false);
        isUpdatingRubro.current = true;

        console.log(`Fetching rubro for ciclo: ${ciclo}, gradoId: ${selectedStudentDetails.gradoId}`);

        const gradoDetails = await gradoService.getGradoById(selectedStudentDetails.gradoId);
        const nivelEducativoId = gradoDetails.nivelEducativoId;
        
        if (!nivelEducativoId) {
          console.warn('No nivelEducativoId found for grado');
          setHasValidRubro(false);
          setDinamicRubroId("");
          return;
        }

        const rubro = await findTuitionRubro(nivelEducativoId, ciclo);
        
        if (!rubro) {
          console.warn(`No tuition rubro found for ciclo ${ciclo} and nivel ${nivelEducativoId}`);
          setHasValidRubro(false);
          setDinamicRubroId("");
          
          // Clear monto field when no rubro is found
          form.setFieldsValue({ 
            rubroId: "",
            monto: undefined 
          });
          
          toast.error(`No se encontró un rubro de colegiatura para el ciclo escolar ${ciclo}.`);
          return;
        }

        console.log(`Found rubro: ${rubro.id}, monto: ${rubro.montoPreestablecido}`);
        
        // Update states
        setHasValidRubro(true);
        setDinamicRubroId(rubro.id.toString());
        
        // Update form fields in a batch to ensure consistency
        const newValues: { rubroId: string; monto?: number } = {
          rubroId: rubro.id.toString()
        };
        
        if (rubro.montoPreestablecido) {
          newValues.monto = rubro.montoPreestablecido;
        }
        
        form.setFieldsValue(newValues);
        
        // Force form validation after update
        setTimeout(() => {
          form.validateFields(['rubroId', 'monto']).catch(() => {
            // Ignore validation errors
          });
        }, 100);
        
        console.log('Rubro and form updated successfully');
        
        // Show success toast when rubro is found and applied
        toast.success(`El rubro de colegiatura ${ciclo} fue encontrado y aplicado.`);
        
      } catch (error) {
        console.error('Error fetching rubro:', error);
        setHasValidRubro(false);
        setDinamicRubroId("");
        form.setFieldsValue({ 
          rubroId: "",
          monto: undefined 
        });
        toast.error('Error al buscar rubro por ciclo escolar.');
      } finally {
        setLoadingRubro(false);
        setRubroValidationComplete(true);
        isUpdatingRubro.current = false;
      }
    }, 500); // 500ms debounce delay
  }, [findTuitionRubro, form, selectedStudentDetails?.gradoId]);

  // Handle ciclo escolar changes
  const handleCicloEscolarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Update form field immediately
    form.setFieldsValue({ cicloEscolar: value });
    
    // If we have a selected student, trigger debounced rubro fetch
    if (selectedStudentDetails?.gradoId && value.trim()) {
      debouncedFetchRubro(value);
    }
  }, [form, selectedStudentDetails?.gradoId, debouncedFetchRubro]);

  // Function to fetch the appropriate RubroId for a student's grade
  const fetchRubroIdForGrado = async (studentGradoId: number) => {
    if (!studentGradoId) {
      console.error("No GradoId provided");
      setRubroValidationComplete(true);
      return;
    }

    try {
      setLoadingRubro(true);
      setRubroValidationComplete(false);

      const gradoDetails = await gradoService.getGradoById(studentGradoId);
      const nivelEducativoId = gradoDetails.nivelEducativoId;

      if (!nivelEducativoId) {
        console.error("No NivelEducativoId found for Grado:", studentGradoId);
        setHasValidRubro(false);
        setRubroValidationComplete(true);
        return;
      }

      const cicloFromForm = parseInt((form.getFieldValue('cicloEscolar') ?? currentYear).toString());
      const selectedRubro = await findTuitionRubro(nivelEducativoId, cicloFromForm);

      if (!selectedRubro) {
        console.warn(
          "No matching tuition Rubro found for NivelEducativoId and ciclo:",
          nivelEducativoId,
          cicloFromForm
        );
        setHasValidRubro(false);
        setDinamicRubroId("");
        setRubroValidationComplete(true);
        return;
      }

      setDinamicRubroId(selectedRubro.id.toString());
      setHasValidRubro(true);
      setRubroValidationComplete(true);
      console.log("Selected RubroId for tuition payment:", selectedRubro.id);

      form.setFieldsValue({ rubroId: selectedRubro.id.toString() });

      if (selectedRubro.montoPreestablecido) {
        form.setFieldsValue({ monto: selectedRubro.montoPreestablecido });
      }
    } catch (error) {
      console.error("Error fetching appropriate RubroId:", error);
      setHasValidRubro(false);
      setDinamicRubroId("");
      setRubroValidationComplete(true);
    } finally {
      setLoadingRubro(false);
    }
  };

  // Function to reset the form after a successful submission
  const resetForm = () => {
    form.setFieldsValue({
      cicloEscolar: currentYear,
      fechaPago: dayjs(),
      mes: currentMonth.toString(),
      medioPago: "1",
      notas: "",
      monto: undefined,
      imagenesPago: [],
    });

    setSelectedStudent(null);
    setAlumnoId(null);
    setSelectedCodigo(null);
    setSelectedStudentDetails(null);
    setAutoCompleteValue("");
    setCodigoSearchValue("");
    setTypeaheadOptions([]);
    setContactos([]);
    setDinamicRubroId("1");
    setHasValidRubro(false);
    setRubroValidationComplete(false);
    form.setFieldsValue({ rubroId: "1" });
  };

  // Function to check for duplicate tuition payments
  const checkForDuplicatePayment = (cicloEscolar: number, mes: number): boolean => {
    if (!selectedStudentDetails || !selectedStudentDetails.pagos) {
      return false;
    }

    const existingTuitionPayments = selectedStudentDetails.pagos.filter(pago => 
      pago.esColegiatura === true && 
      pago.esAnulado !== true
    );

    const duplicatePayment = existingTuitionPayments.find(pago => 
      pago.cicloEscolar === cicloEscolar && 
      pago.mesColegiatura === mes
    );

    return !!duplicatePayment;
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
      setContactos(response.contactos || []);

      const studentGradoId = response.gradoId;
      if (studentGradoId) {
        await fetchRubroIdForGrado(studentGradoId);
      }

      setCodigoSearchValue("");
    } catch (error: unknown) {
      console.error("Error fetching student by code:", error);
      toast.error("No se encontró ningún alumno con ese código.");
    }
  };

  const handleTypeaheadSearch = async (query: string) => {
    console.log("handleTypeaheadSearch called with query:", query);
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

  const handleAutoCompleteFocus = () => {
    console.log("AutoComplete focused");
    if (!autoCompleteValue.trim()) {
      setTypeaheadOptions([]);
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
      setSelectedCodigo(response.codigo);
      setSelectedStudentDetails(response);
      setContactos(response.contactos || []);

      const studentGradoId = response.gradoId;
      if (studentGradoId) {
        await fetchRubroIdForGrado(studentGradoId);
      }
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
    console.log("Form submitted with values:", values);

    // Prevent submission if rubro is still being updated
    if (isUpdatingRubro.current || loadingRubro) {
      toast.warning("Por favor espere mientras se valida el rubro de colegiatura.");
      return;
    }

    if (!alumnoId) {
      toast.error("Por favor seleccione un alumno antes de enviar el pago.");
      return;
    }

    if (!hasValidRubro) {
      toast.error("No se puede procesar el pago: no hay un rubro de colegiatura válido para este estudiante.");
      return;
    }

    // Validate that we have the expected monto value
    console.log("Submitted monto value:", values.monto);
    console.log("Current form monto value:", form.getFieldValue('monto'));

    const cicloEscolar = parseInt(values.cicloEscolar.toString());
    const mes = parseInt(values.mes.toString());
    
    if (checkForDuplicatePayment(cicloEscolar, mes)) {
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const monthName = monthNames[mes - 1] || mes.toString();
      
      toast.error(`Ya existe un pago de colegiatura para ${selectedStudent} en ${monthName} ${cicloEscolar}. No se pueden registrar pagos duplicados para el mismo mes y año escolar.`);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("Id", "0");
      formData.append("Fecha", dayjs().toISOString()); // Use current date and time instead of form date
      formData.append("CicloEscolar", values.cicloEscolar.toString());
      formData.append("Monto", values.monto.toString());
      formData.append("MedioPago", values.medioPago.toString());
      formData.append("MesColegiatura", values.mes.toString());
      formData.append("RubroId", values.rubroId);
      formData.append("AlumnoId", alumnoId);
      formData.append("EsColegiatura", "true");
      formData.append("AnioColegiatura", new Date().getFullYear().toString());
      if (values.notas) formData.append("Notas", values.notas);

      const userId = getCurrentUserId();
      formData.append("UsuarioCreacionId", userId.toString());

      if (values.imagenesPago && Array.isArray(values.imagenesPago)) {
        values.imagenesPago.forEach((file, index) => {
          if (file.originFileObj) {
            formData.append(`ImagenesPago[${index}]`, file.originFileObj);
          }
        });
      }

      console.log("Sending API request to /pagos with FormData");

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

      toast.success("¡Pago enviado con éxito! Puedes generar tu código QR desde la tabla de pagos abajo.");
      console.log("Pago enviado:", response);

      // Refresh student data to show the new payment
      if (selectedStudentDetails && selectedCodigo) {
        try {
          console.log("Refreshing student data after payment submission...");
          const updatedResponse = await makeApiRequest<AlumnoDetails>(
            `/alumnos/codigo/${selectedCodigo}`,
            "GET"
          );
          console.log("Updated student data:", updatedResponse);
          console.log("Updated payments:", updatedResponse.pagos);
          setSelectedStudentDetails(updatedResponse);
        } catch (error) {
          console.error("Error refreshing student data:", error);
        }
      }

      // Reset the form after successful submission but keep student selected
      form.setFieldsValue({
        cicloEscolar: currentYear,
        fechaPago: dayjs(),
        mes: currentMonth.toString(),
        medioPago: "1",
        notas: "",
        monto: undefined,
        imagenesPago: [],
      });
    } catch (err: unknown) {
      console.error("Error details:", err);
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
    console.log('[Tuitions] handleShowQRCode called with payment:', payment);
    setSelectedPayment(payment);
    setQrModalVisible(true);
    console.log('[Tuitions] QR modal opened for payment ID:', payment.id);
  };

  const handleCloseQRModal = () => {
    setQrModalVisible(false);
    setSelectedPayment(null);
  };

  return (
    <div className="payments-container">
      <style>{`
        @keyframes fadeInSlideDown {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <h2>Realizar un Pago de Colegiatura</h2>
      <div style={{ marginBottom: "20px" }}>
        <Input.Search
          value={codigoSearchValue}
          placeholder="Buscar por Código"
          enterButton="Buscar"
          onSearch={handleCodigoSearch}
          onChange={(e) => setCodigoSearchValue(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
        <div style={{ marginBottom: "15px" }}>
          <AutoComplete
            value={autoCompleteValue}
            options={typeaheadOptions}
            onSearch={handleTypeaheadSearch}
            onSelect={handleTypeaheadSelect}
            onFocus={handleAutoCompleteFocus}
            placeholder="Buscar por Nombre o Apellido"
            style={{ width: "100%" }}
            allowClear
            defaultActiveFirstOption={false}
            onClear={() => {
              setAutoCompleteValue("");
              setTypeaheadOptions([]);
              setAlumnoId(null);
              setSelectedStudent(null);
              setSelectedCodigo(null);
              setSelectedStudentDetails(null);
              setHasValidRubro(false);
              setRubroValidationComplete(false);
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
              )}
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
      
      {/* Display error when student doesn't have valid rubro - only after validation is complete */}
      {selectedStudent && rubroValidationComplete && !hasValidRubro && (
        <div 
          style={{ 
            marginBottom: "20px", 
            padding: "12px", 
            backgroundColor: "#fff2e8", 
            border: "1px solid #ffb366", 
            borderRadius: "6px",
            opacity: 1,
            transition: "all 0.3s ease-in-out",
            animation: "fadeInSlideDown 0.4s ease-out"
          }}
        >
          <div style={{ color: "#d46b08", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>⚠️</span>
            <span>Error de Configuración</span>
          </div>
          <div style={{ color: "#d46b08", marginTop: "8px", lineHeight: "1.4" }}>
            No se encontró un rubro de colegiatura válido para este estudiante. 
            <br />
            <span style={{ fontSize: "14px", fontWeight: "normal" }}>
              Contacte al administrador del sistema para configurar correctamente el rubro para su grado académico.
            </span>
          </div>
        </div>
      )}

      {/* Show loading state for rubro validation */}
      {selectedStudent && loadingRubro && (
        <div 
          style={{ 
            marginBottom: "20px", 
            padding: "12px", 
            backgroundColor: "#f6ffed", 
            border: "1px solid #b7eb8f", 
            borderRadius: "6px",
            opacity: 1,
            transition: "all 0.3s ease-in-out"
          }}
        >
          <div style={{ color: "#52c41a", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>🔄</span>
            <span>Validando configuración de colegiatura...</span>
          </div>
        </div>
      )}
      
      {/* Display contacts info above the Ciclo Escolar input */}
      {contactos.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h3>Contactos</h3>
          <ul style={{ paddingLeft: "20px" }}>
            {contactos.map((contacto) => (
              <li key={contacto.contactoId}>
                <strong>{contacto.parentesco}:</strong>{" "}
                {contacto.contacto.nombre} — {contacto.contacto.telefonoTrabajo || contacto.contacto.celular || 'Sin teléfono'} —{" "}
                {contacto.contacto.email}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Display recent tuition payments */}
      {selectedStudent && selectedStudentDetails && (
        <PaymentHistoryTable
          payments={selectedStudentDetails.pagos || []}
          onShowQRCode={handleShowQRCode}
          title="Pagos de Colegiatura Recientes"
          showStatusColumn={true}
          showMonthColumn={true}
          hideConceptoColumn={true}
          showEmptyState={true}
          filterFunction={(pago) => 
            pago.esColegiatura === true
          }
        />
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
          fechaPago: dayjs(),
          mes: currentMonth.toString(),
          rubroId: dinamicRubroId,
        }}
      >
        <Form.Item
          label="Ciclo Escolar"
          name="cicloEscolar"
          rules={[
            { required: true, message: "¡Por favor ingrese el ciclo escolar!" },
          ]}
        >
          <Input 
            placeholder="Ingrese el ciclo escolar" 
            onChange={handleCicloEscolarChange}
            disabled={loadingRubro}
            addonAfter={loadingRubro ? "🔄" : null}
          />
        </Form.Item>
        
        <Form.Item
          name="rubroId"
          initialValue={dinamicRubroId}
          style={{ display: "none" }}
        >
          <Input type="hidden" disabled={loadingRubro} />
        </Form.Item>

        <Form.Item
          name="fechaPago"
          initialValue={dayjs()}
          style={{ display: "none" }}
        >
          <Input type="hidden" />
        </Form.Item>

        <Form.Item label="Mes" name="mes" rules={[{ required: false }]}>
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
            disabled={loadingRubro}
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
            console.log("Upload event:", e);
            return Array.isArray(e) ? e : e?.fileList;
          }}
          initialValue={[]}
        >
          <Upload
            name="imagenesPago"
            listType="picture-card"
            beforeUpload={() => false}
            onPreview={(file) => {
              console.log("Preview clicked for file:", file);
              console.log("file.url:", file.url);
              console.log("file.originFileObj:", file.originFileObj);
              console.log("file keys:", Object.keys(file));
              
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
              
              console.log("Final generated URL:", url);
              
              if (url) {
                console.log("Opening modal with URL:", url);
                console.log("Opening image in new tab...");
                window.open(url, '_blank');
                
                if (createdUrl && url) {
                  setTimeout(() => {
                    console.log("Cleaning up URL:", url);
                    URL.revokeObjectURL(url);
                  }, 2000);
                }
              } else {
                console.error("No URL available for preview", file);
                if (file.originFileObj) {
                  const fallbackUrl = URL.createObjectURL(file.originFileObj);
                  window.open(fallbackUrl, '_blank');
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
            loading={loading || loadingRubro}
            disabled={!isFormValid}
          >
            {loadingRubro ? "Validando rubro..." : "Enviar Pago"}
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

export default Tuitions;
