import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, AutoComplete, Button, Typography, Space, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { AlumnoOption } from '../../types/routeAssignment';
import { routeAssignmentService } from '../../services/routeAssignmentService';
import { makeApiRequest } from '../../services/apiHelper';

interface StudentByCodigoResponse {
  id: number;
  codigo: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  gradoNombre: string;
  seccion: string;
  sedeNombre: string;
}

const { Text } = Typography;

interface StudentRouteModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  rubroTransporteId: number;
  rubroNombre: string;
  initialData?: {
    alumnoId: number;
    alumnoNombre: string;
    fechaInicio: string;
    fechaFin?: string;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

const StudentRouteModal: React.FC<StudentRouteModalProps> = ({
  visible,
  mode,
  rubroTransporteId,
  rubroNombre,
  initialData,
  onCancel,
  onSuccess
}) => {  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [studentOptions, setStudentOptions] = useState<AlumnoOption[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AlumnoOption | null>(null);
  const [codigoInputValue, setCodigoInputValue] = useState('');
  const [isStudentAlreadyAssigned, setIsStudentAlreadyAssigned] = useState(false);
  const [checkingAssignment, setCheckingAssignment] = useState(false);  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        // Pre-fill form for edit mode        // Parse UTC dates correctly to avoid timezone conversion issues
        const parseUtcDate = (dateString: string) => {
          if (dateString.includes('T') && dateString.endsWith('Z')) {
            // For UTC dates like "2025-01-01T00:00:00Z", extract just the date part
            // and create a local date to avoid timezone conversion
            const datePart = dateString.split('T')[0]; // "2025-01-01"
            console.log('Parsing UTC date:', dateString, '-> date part:', datePart, '-> dayjs result:', dayjs(datePart).format('YYYY-MM-DD'));
            return dayjs(datePart);
          }
          return dayjs(dateString);
        };
        
        form.setFieldsValue({
          fechaInicio: parseUtcDate(initialData.fechaInicio),
          fechaFin: initialData.fechaFin ? parseUtcDate(initialData.fechaFin) : null,
          alumno: initialData.alumnoNombre
        });setSelectedStudent({
          id: initialData.alumnoId,
          value: initialData.alumnoId.toString(),
          label: initialData.alumnoNombre,
          codigo: '',
          primerNombre: '',
          primerApellido: '',
          grado: '',
          seccion: '',
          sede: ''
        });
        setCodigoInputValue('');
      } else {
        // Set default values for add mode
        const currentYear = new Date().getFullYear();
        form.setFieldsValue({
          fechaInicio: dayjs(`${currentYear}-01-01`),
          fechaFin: null,
          alumno: ''        });        setSelectedStudent(null);
        setCodigoInputValue('');
        setIsStudentAlreadyAssigned(false);
      }
    }
  }, [visible, mode, initialData, form]);
  // Function to check if a student is already assigned to this route or any other route
  const checkStudentAssignment = async (studentId: number) => {
    setCheckingAssignment(true);
    try {
      // Get all route assignments for this student
      const allAssignments = await routeAssignmentService.getStudentAllRouteAssignments(studentId);
      
      if (allAssignments.length > 0) {        // Check if student is assigned to the current route
        const currentRouteAssignment = allAssignments.find(assignment => 
          assignment.rubroTransporteId === rubroTransporteId
        );
        
        if (currentRouteAssignment) {
          // Student is assigned to the current route
          setIsStudentAlreadyAssigned(true);
          toast.warning('Este estudiante ya está asignado a esta ruta de transporte.');        } else {
          // Student is assigned to a different route
          setIsStudentAlreadyAssigned(true);
          toast.error('Este estudiante ya está asignado a otra ruta de transporte. Debe remover al estudiante de esa ruta primero antes de asignarlo a esta ruta.');
        }
      } else {
        // Student is not assigned to any route
        setIsStudentAlreadyAssigned(false);
      }
    } catch (error) {
      console.error('Error checking student assignment:', error);
      // On error, assume not assigned to allow user to try
      setIsStudentAlreadyAssigned(false);
    } finally {
      setCheckingAssignment(false);
    }
  };

  const handleStudentSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setStudentOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const students = await routeAssignmentService.searchStudents(query);
      setStudentOptions(students);    } catch (error) {
      console.error('Error searching students:', error);
      toast.error('Error al buscar estudiantes');
    } finally {
      setSearchLoading(false);
    }
  };  const handleStudentSelect = (_value: string, option: AlumnoOption) => {
    setSelectedStudent(option);
    form.setFieldsValue({ alumno: option.label });
    // Check if this student is already assigned to this route
    checkStudentAssignment(option.id);
  };
  const handleCodigoSearch = async (codigo: string) => {    if (!codigo.trim()) {
      toast.warning('Por favor ingrese un código válido');
      return;
    }

    setSearchLoading(true);
    try {      // Get student details by código using the specific endpoint
      const response = await makeApiRequest<StudentByCodigoResponse>(`/alumnos/codigo/${codigo}`, 'GET');
      if (response) {
        const student: AlumnoOption = {
          id: response.id,
          value: response.id.toString(),
          label: `${response.primerApellido} ${response.segundoApellido}, ${response.primerNombre} ${response.segundoNombre}`.trim(),
          codigo: response.codigo,
          primerNombre: response.primerNombre,
          segundoNombre: response.segundoNombre,
          primerApellido: response.primerApellido,
          segundoApellido: response.segundoApellido,
          grado: response.gradoNombre,
          seccion: response.seccion || '',
          sede: response.sedeNombre
        };        setSelectedStudent(student);
        form.setFieldsValue({ alumno: student.label });
        setCodigoInputValue('');
        // Check if this student is already assigned to this route
        checkStudentAssignment(student.id);
      } else {
        toast.error('No se encontró ningún estudiante con ese código');
      }
    } catch (error) {
      console.error('Error searching by código:', error);
      toast.error('No se encontró ningún estudiante con ese código');
    } finally {
      setSearchLoading(false);
    }
  };  const handleSubmit = async () => {
    console.log('=== HANDLE SUBMIT STARTED ===');
    try {
      const values = await form.validateFields();
      console.log('Form values validated:', values);
        if (mode === 'add' && !selectedStudent) {
        console.log('No student selected, showing error');
        toast.error('Por favor selecciona un estudiante');
        return;
      }

      console.log('Setting loading to true');
      setLoading(true);

      const assignmentData = {
        alumnoId: mode === 'edit' ? initialData!.alumnoId : selectedStudent!.id,
        rubroTransporteId,
        fechaInicio: values.fechaInicio.format('YYYY-MM-DD'),
        fechaFin: values.fechaFin ? values.fechaFin.format('YYYY-MM-DD') : undefined
      };
      console.log('Assignment data prepared:', assignmentData);      if (mode === 'add') {
        console.log('=== ADD MODE - ATTEMPTING TO ASSIGN STUDENT ===');
        try {
          const result = await routeAssignmentService.assignStudentToRoute(assignmentData);
          console.log('Assignment successful:', result);
          toast.success('Estudiante asignado exitosamente');
        } catch (error) {
          console.error('=== ERROR ASSIGNING STUDENT ===');
          console.error('Error assigning student:', error);
          // Check if it's a duplicate error from the backend (fallback)
          const axiosError = error as { response?: { status: number; data?: string } };
          console.log('Assignment error details:', {
            status: axiosError.response?.status,
            data: axiosError.response?.data
          });
          if (axiosError.response?.status === 409 || 
              axiosError.response?.status === 400 ||
              (axiosError.response?.data && 
               typeof axiosError.response.data === 'string' && 
               (axiosError.response.data.includes('already assigned') ||
                axiosError.response.data.includes('ya está asignado') ||
                axiosError.response.data.includes('duplicate') ||
                axiosError.response.data.includes('duplicado')))) {
            console.log('=== BACKEND DUPLICATE ERROR DETECTED ===');
            toast.warning('Este estudiante ya está asignado a esta ruta de transporte. No se puede reasignar a la misma ruta.');} else {
            console.log('=== OTHER ASSIGNMENT ERROR ===');
            toast.error('Error al asignar el estudiante');
          }
          return;
        }
      } else {
        console.log('=== EDIT MODE - UPDATING ASSIGNMENT ===');
        await routeAssignmentService.updateStudentRouteAssignment(
          assignmentData.alumnoId,
          assignmentData.rubroTransporteId,
          {
            fechaInicio: assignmentData.fechaInicio,
            fechaFin: assignmentData.fechaFin
          }        );
        toast.success('Asignación actualizada exitosamente');
      }

      console.log('=== CALLING onSuccess ===');
      onSuccess();    } catch (error) {
      console.error('=== TOP LEVEL ERROR ===');
      console.error('Error saving assignment:', error);
      toast.error('Error al guardar la asignación');
    } finally {
      console.log('=== FINALLY BLOCK - SETTING LOADING FALSE ===');
      setLoading(false);
    }
  };
  const handleCancel = () => {
    form.resetFields();
    setSelectedStudent(null);
    setStudentOptions([]);
    setCodigoInputValue('');
    onCancel();
  };

  return (    <Modal
      title={mode === 'add' ? 'Agregar Estudiante' : 'Editar Asignación'}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,        <Button key="save" type="primary" loading={loading} onClick={handleSubmit}
          disabled={loading || !selectedStudent || isStudentAlreadyAssigned || checkingAssignment}>
          {mode === 'add' ? 'Agregar' : 'Guardar'}
        </Button>
      ]}
      width={750}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <Text strong>Ruta: </Text>
          <Text>{rubroNombre}</Text>
        </div>        {mode === 'add' && (
          <>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Código de Alumno">
                  <Input.Search
                    placeholder="Buscar por Código"
                    enterButton={<SearchOutlined />}
                    value={codigoInputValue}
                    onChange={(e) => setCodigoInputValue(e.target.value)}
                    onSearch={handleCodigoSearch}
                    loading={searchLoading}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Nombre del Alumno"
                  name="alumno"
                  rules={[{ required: true, message: 'Por favor selecciona un estudiante' }]}
                >                  <AutoComplete
                    placeholder="Buscar por código, nombre o apellido..."
                    onSearch={handleStudentSearch}
                    onSelect={handleStudentSelect}
                    options={studentOptions}
                    filterOption={false}
                    notFoundContent={searchLoading ? 'Buscando...' : 'No se encontraron estudiantes'}
                    style={{ width: '100%' }}
                    allowClear                    onClear={() => {
                      setSelectedStudent(null);
                      setStudentOptions([]);
                      setIsStudentAlreadyAssigned(false);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {mode === 'edit' && (
          <Form.Item label="Alumno">
            <Input value={initialData?.alumnoNombre} disabled />
          </Form.Item>
        )}

        <Space style={{ width: '100%' }} size="large">
          <Form.Item
            label="Fecha de Inicio"
            name="fechaInicio"
            rules={[{ required: true, message: 'La fecha de inicio es requerida' }]}
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Fecha de Fin"
            name="fechaFin"
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Space>

        {selectedStudent && mode === 'add' && (
          <div style={{ 
            background: '#f5f5f5', 
            padding: 12, 
            borderRadius: 6, 
            marginTop: 16 
          }}>
            <Text strong>Alumno seleccionado:</Text>
            <br />
            <Text>{selectedStudent.label}</Text>
            <br />
            <Text type="secondary">
              Grado: {selectedStudent.grado} - Sección: {selectedStudent.seccion} - Sede: {selectedStudent.sede}
            </Text>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default StudentRouteModal;
