import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, AutoComplete, Card, Row, Col, Typography, Table, Tag, Space } from "antd";
import { SearchOutlined, EyeOutlined, EditOutlined, StopOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';
import { makeApiRequest } from "../../services/apiHelper";
import { gradoService } from "../../services/gradoService";
import { pagoService, Pago } from "../../services/pagoService";
import PaymentDetailsModal from "./PaymentDetailsModal";
import VoidPaymentModal from "./VoidPaymentModal";
import PaymentEditModal from "./PaymentEditModal";

const { Option } = Select;
const { Title } = Typography;

// Interfaces
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
  seccion: string;
  becado: boolean | null;
  becaParcialPorcentaje: number | null;
  observaciones?: string;
  pagos: Array<{
    id: number;
    fecha: string;
    monto: number;
    rubroDescripcion: string;
  }>;
  contactos: Array<{
    alumnoId: number;
    contactoId: number;
    contacto: {
      id: number;
      nombre: string;
      telefono: string;
      email: string;
    };
    parentesco: string;
  }>;
}

interface Grado {
  id: number;
  nombre: string;
  nivelEducativoId: number;
  nivelEducativoNombre: string;
}

const EditPayments: React.FC = () => {
  // State variables
  const [loading, setLoading] = useState<boolean>(false);
  const [alumnoId, setAlumnoId] = useState<string | null>(null);
  const [typeaheadOptions, setTypeaheadOptions] = useState<AlumnoOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<AlumnoDetails | null>(null);
  const [autoCompleteValue, setAutoCompleteValue] = useState<string>("");
  const [grados, setGrados] = useState<Grado[]>([]);
  const [selectedGradoId, setSelectedGradoId] = useState<number | null>(null);
  const [cicloEscolar, setCicloEscolar] = useState<number>(new Date().getFullYear());
  // Add state variable to track which filter is currently active: "grado", "alumno", or null
  const [activeFilter, setActiveFilter] = useState<"grado" | "alumno" | null>(null);
  const [form] = Form.useForm();
  
  // Add state for payment results
  const [payments, setPayments] = useState<Pago[]>([]);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  // Add state for viewing payment details
  const [selectedPayment, setSelectedPayment] = useState<Pago | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState<boolean>(false);
  const [confirmVoidModalVisible, setConfirmVoidModalVisible] = useState<boolean>(false);
  const [voidReason, setVoidReason] = useState<string>("");
  const [isVoiding, setIsVoiding] = useState<boolean>(false);

  // Add state for editing payments
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Fetch grados on component mount
  useEffect(() => {
    const fetchGrados = async () => {
      try {
        const response = await gradoService.getAllGrados();
        setGrados(response);
      } catch (error) {
        console.error("Error fetching grados:", error);
        toast.error("Error al cargar los grados");
      }
    };

    fetchGrados();
  }, []);
  // Search by codigo input
  const handleCodigoSearch = async (codigo: string) => {
    if (!codigo.trim()) {
      toast.warning("Por favor ingrese un código válido");
      return;
    }
      try {
      const response = await makeApiRequest<AlumnoDetails>(`/alumnos/codigo/${codigo}`, "GET");
      setAlumnoId(response.id.toString());
      setSelectedStudent(
        `${response.primerNombre} ${response.segundoNombre} ${response.primerApellido} ${response.segundoApellido}`.trim()
      );
      setSelectedStudentDetails(response);
      
      // Set active filter to "alumno" and clear grado selection
      setActiveFilter("alumno");
      setSelectedGradoId(null);
      form.setFieldsValue({ gradoId: null });
      
      toast.success("Alumno encontrado por código.");
    } catch (error) {
      console.error("Error fetching student by code:", error);
      toast.error("No se encontró ningún alumno con ese código.");
    }
  };

  // Handle typeahead search for alumnos
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
      console.error("Error searching for students:", error);
      toast.error("Error al buscar alumnos.");
    }
  };
  // Handle student selection from typeahead
  const handleTypeaheadSelect = async (value: string, option: AlumnoOption) => {
    setAutoCompleteValue(option.label);
    setAlumnoId(value);
    setSelectedStudent(option.label);
    
    // Set active filter to "alumno" and clear grado selection
    setActiveFilter("alumno");
    setSelectedGradoId(null);
    form.setFieldsValue({ gradoId: null });
    
    try {
      const response = await makeApiRequest<AlumnoDetails>(`/alumnos/codigo/${option.codigo}`, "GET");
      setSelectedStudentDetails(response);
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Error al obtener los datos del alumno seleccionado.");
    }
  };  // Function to reset filters
  const resetFilters = () => {
    form.resetFields();
    setSelectedStudent(null);
    setSelectedStudentDetails(null);
    setAlumnoId(null);
    setAutoCompleteValue("");
    setSelectedGradoId(null);
    setCicloEscolar(new Date().getFullYear());
    setActiveFilter(null); // Reset the active filter state
    // Clear the payments table and reset search state
    setPayments([]);
    setSearchPerformed(false);
  };
    // Handle filter form submission
  const handleFilterSubmit = async () => {
    // Add debugging
    console.log("Debug - handleFilterSubmit values:", {
      cicloEscolar,
      selectedGradoId,
      alumnoId,
      activeFilter,
      selectedStudent
    });
    
    // Validate that we have required filtering criteria
    if (!cicloEscolar) {
      toast.error("Debe seleccionar un ciclo escolar");
      return;
    }
    
    // Check if we have either grado or alumno selected
    if (!selectedGradoId && (!alumnoId || alumnoId.trim() === '')) {
      toast.error("Debe seleccionar un Grado o un Alumno específico");
      return;
    }
    
    console.log("Filter values:", {
      cicloEscolar,
      gradoId: selectedGradoId,
      alumnoId: alumnoId,
      activeFilter
    });
    
    setLoading(true);
    setSearchPerformed(true);
    try {
      const pagos = await pagoService.getPaymentsForEdit(
        cicloEscolar,
        selectedGradoId || undefined,
        alumnoId || undefined
      );
      
      // Ensure that pagos is an array
      const pagosArray = Array.isArray(pagos) ? pagos : [];
      console.log("Pagos response:", pagos); // Debug the API response
      
      setPayments(pagosArray);
      
      if (pagosArray.length === 0) {
        toast.info("No se encontraron pagos con los criterios especificados");
      } else {
        toast.success(`Se encontraron ${pagosArray.length} pagos`);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      let errorMessage = "Error al buscar pagos. Intente nuevamente.";
      if (error instanceof Error) {
        errorMessage += ` (${error.message})`;
      }
      toast.error(errorMessage);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing payment details
  const handleViewPayment = (payment: Pago) => {
    setSelectedPayment(payment);
    setDetailsModalVisible(true);
  };
    // Handle closing the details modal
  const handleCloseDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedPayment(null);
  };

  // Handle opening edit modal
  const handleEditPayment = (payment: Pago) => {
    setSelectedPayment(payment);
    setEditModalVisible(true);
  };

  // Handle closing edit modal
  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setSelectedPayment(null);
  };

  // Handle saving payment edits
  const handleSavePayment = async (pagoId: number, formData: FormData) => {
    setIsUpdating(true);
    try {
      await pagoService.updatePayment(pagoId, formData);
      toast.success('Pago actualizado exitosamente');
      
      // Refresh the payments list
      await handleFilterSubmit();
      
      setEditModalVisible(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Error al actualizar el pago. Intente nuevamente.');
      throw error; // Re-throw to let the modal handle it
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle initiating the void process
  const handleInitiateVoid = () => {
    setConfirmVoidModalVisible(true);
  };
  
  // Handle cancel void
  const handleCancelVoid = () => {
    setConfirmVoidModalVisible(false);
    setVoidReason("");
  };
  
  // Handle confirm void payment
  const handleConfirmVoidPayment = async () => {
    if (!selectedPayment) return;
    
    // Validate reason
    if (!voidReason.trim()) {
      toast.error("Debe ingresar un motivo para anular el pago");
      return;
    }
    
    setIsVoiding(true);
    try {
      // In a future implementation, call actual API to void payment
      // await pagoService.voidPayment(selectedPayment.id, voidReason);
      
      toast.success(`Pago #${selectedPayment.id} anulado correctamente`);
      
      // Refresh the payments list
      await handleFilterSubmit();
      
      // Close modals
      setConfirmVoidModalVisible(false);
      setDetailsModalVisible(false);
      setSelectedPayment(null);
      setVoidReason("");
    } catch (error) {
      console.error("Error voiding payment:", error);
      toast.error("Error al anular el pago. Intente nuevamente.");
    } finally {
      setIsVoiding(false);
    }
  };
  
  return (
    <div className="edit-payments-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Title level={2}>Editar o Anular Pagos</Title>
      
      <Card title="Filtros de Búsqueda" style={{ marginBottom: 20 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFilterSubmit}
          initialValues={{
            cicloEscolar: cicloEscolar
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Ciclo Escolar"
                name="cicloEscolar"
                rules={[{ required: true, message: "¡Ciclo escolar es requerido!" }]}
              >
                <Input 
                  placeholder="Ingrese el ciclo escolar" 
                  type="number" 
                  value={cicloEscolar} 
                  onChange={(e) => setCicloEscolar(Number(e.target.value))} 
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Grado"
                name="gradoId"
              >
                <Select 
                  placeholder="Seleccione el grado"
                  allowClear
                  value={selectedGradoId}
                  onChange={(value) => {
                    setSelectedGradoId(value);
                    // If a grado is selected, set active filter to "grado" and clear alumno selections
                    if (value) {
                      setActiveFilter("grado");                      // Clear alumno-related state
                      setAlumnoId(null);
                      setSelectedStudent(null);
                      setAutoCompleteValue("");
                    } else {
                      // If cleared, reset the active filter
                      setActiveFilter(null);
                    }
                  }}
                  disabled={activeFilter === "alumno"}
                >
                  {grados.map(grado => (
                    <Option key={grado.id} value={grado.id}>{grado.nombre}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Código de Alumno">
                <Input.Search
                  placeholder="Buscar por Código"
                  enterButton={<SearchOutlined />}
                  onSearch={handleCodigoSearch}
                  disabled={activeFilter === "grado"}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item label="Nombre del Alumno">
                <AutoComplete
                  value={autoCompleteValue}
                  options={typeaheadOptions}
                  onSearch={handleTypeaheadSearch}
                  onSelect={handleTypeaheadSelect}
                  placeholder="Buscar por Nombre o Apellido"
                  style={{ width: "100%" }}
                  allowClear
                  disabled={activeFilter === "grado"}
                  onClear={() => {
                    setAutoCompleteValue("");
                    setTypeaheadOptions([]);
                  }}
                  fieldNames={{ label: 'label', value: 'value' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <div style={{ marginBottom: 16 }}>
                <Typography.Text type="secondary">
                  <strong>Nota:</strong> Filtrar por "Ciclo Escolar y Grado" o "Ciclo Escolar y Alumno" son opciones mutuamente excluyentes.
                  {activeFilter === "grado" && (
                    <span style={{ color: "#1890ff" }}> Actualmente filtrando por Grado.</span>
                  )}
                  {activeFilter === "alumno" && (
                    <span style={{ color: "#1890ff" }}> Actualmente filtrando por Alumno.</span>
                  )}
                </Typography.Text>
              </div>
            </Col>
          </Row>          {selectedStudent && (
            <div
              style={{
                marginBottom: "10px",
                padding: "8px",
                backgroundColor: "#f0f5ff",
                borderRadius: "4px",
              }}
            >
              <strong>Alumno seleccionado:</strong> {selectedStudent}
              {selectedStudentDetails && (selectedStudentDetails.gradoNombre || selectedStudentDetails.seccion) && (
                <div style={{ marginTop: '4px', fontSize: '14px', color: '#666' }}>
                  {selectedStudentDetails.gradoNombre && `Grado: ${selectedStudentDetails.gradoNombre}`}
                  {selectedStudentDetails.gradoNombre && selectedStudentDetails.seccion && ' • '}
                  {selectedStudentDetails.seccion && `Sección: ${selectedStudentDetails.seccion}`}
                </div>
              )}
              <Button
                type="link"
                style={{ marginLeft: "10px", padding: "0" }}
                onClick={() => {
                  setSelectedStudent(null);
                  setSelectedStudentDetails(null);
                  setAlumnoId(null);
                  setAutoCompleteValue("");
                  setActiveFilter(null); // Reset the active filter state
                }}
              >
                Limpiar
              </Button>
            </div>
          )}

          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={resetFilters}>
                Limpiar Filtros
              </Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit" loading={loading}>
                Buscar Pagos
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
      
      {/* Results section */}
      <div className="search-results">
        <Card>
          {!searchPerformed ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Title level={4}>Resultados de Búsqueda</Title>
              <p>Utilice los filtros de arriba para buscar pagos.</p>
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Title level={4}>Cargando resultados...</Title>
            </div>
          ) : (
            <>
              <Title level={4}>Resultados de Búsqueda</Title>
              {process.env.NODE_ENV === 'asdf' && (
                <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>Datos para depuración (sólo visible en desarrollo):</h4>
                  <p>Tipo de datos: {typeof payments}</p>
                  <p>Es array: {Array.isArray(payments) ? 'Sí' : 'No'}</p>
                  <p>Longitud: {Array.isArray(payments) ? payments.length : 'N/A'}</p>
                  <p>Datos: {JSON.stringify(payments).substring(0, 100)}...</p>
                </div>
              )}              <Table 
                dataSource={payments} 
                rowKey="id"
                bordered
                locale={{ emptyText: 'No hay pagos para mostrar' }}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
                columns={[
                  {
                    title: 'ID',
                    dataIndex: 'id',
                    key: 'id'
                  },
                  {
                    title: 'Fecha',
                    dataIndex: 'fecha',
                    key: 'fecha',
                    render: (fecha) => fecha ? dayjs(fecha).format('DD/MM/YYYY') : 'N/A'
                  },
                  // Only show Alumno column when activeFilter is not "alumno"
                  ...(activeFilter !== "alumno" ? [{
                    title: 'Alumno',
                    dataIndex: 'alumnoNombre',
                    key: 'alumnoNombre',
                    render: (alumnoNombre: string) => alumnoNombre || 'N/A'
                  }] : []),
                  {
                    title: 'Monto',
                    dataIndex: 'monto',
                    key: 'monto',
                    render: (monto) => typeof monto === 'number' ? `Q. ${monto.toFixed(2)}` : 'N/A'
                  },
                  {
                    title: 'Rubro',
                    dataIndex: 'rubroDescripcion',
                    key: 'rubroDescripcion'
                  },
                  {
                    title: 'Estado',
                    dataIndex: 'esAnulado',
                    key: 'esAnulado',
                    render: (esAnulado) => (
                      <Tag color={esAnulado ? 'red' : 'green'}>
                        {esAnulado ? 'Anulado' : 'Activo'}
                      </Tag>
                    )
                  },
                  {
                    title: 'Acciones',
                    key: 'action',
                    render: (_, record: Pago) => (
                      <Space size="small">
                        <Button 
                          size="small" 
                          icon={<EyeOutlined />} 
                          onClick={() => handleViewPayment(record)}
                          title="Ver detalles"
                        />                        {!record.esAnulado && (
                          <>
                            <Button 
                              size="small" 
                              icon={<EditOutlined />} 
                              onClick={() => handleEditPayment(record)}
                              title="Editar pago"
                            />
                            <Button 
                              size="small" 
                              danger
                              icon={<StopOutlined />} 
                              disabled={true}
                              title="Anular pago (próximamente)"
                            />
                          </>
                        )}
                      </Space>
                    )
                  }
                ]}
              />
            </>
          )}
        </Card>
      </div>        {/* Payment Details Modal */}
      <PaymentDetailsModal
        payment={selectedPayment}
        visible={detailsModalVisible}
        onClose={handleCloseDetailsModal}
        onVoid={handleInitiateVoid}
        activeFilter={activeFilter}
      />

      {/* Payment Edit Modal */}
      <PaymentEditModal
        payment={selectedPayment}
        visible={editModalVisible}
        onClose={handleCloseEditModal}
        onSave={handleSavePayment}
        loading={isUpdating}
      />
      
      {/* Void Payment Modal */}
      <VoidPaymentModal
        visible={confirmVoidModalVisible}
        isLoading={isVoiding}
        voidReason={voidReason}
        onVoidReasonChange={setVoidReason}
        onCancel={handleCancelVoid}
        onConfirm={handleConfirmVoidPayment}
      />
    </div>
  );
};

export default EditPayments;
