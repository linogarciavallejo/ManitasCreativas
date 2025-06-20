import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, AutoComplete, Button, Typography, Space, message, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        // Pre-fill form for edit mode
        form.setFieldsValue({
          fechaInicio: dayjs(initialData.fechaInicio),
          fechaFin: initialData.fechaFin ? dayjs(initialData.fechaFin) : null,
          alumno: initialData.alumnoNombre
        });        setSelectedStudent({
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
          alumno: ''        });
        setSelectedStudent(null);
        setCodigoInputValue('');
      }
    }
  }, [visible, mode, initialData, form]);

  const handleStudentSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setStudentOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const students = await routeAssignmentService.searchStudents(query);
      setStudentOptions(students);
    } catch (error) {
      console.error('Error searching students:', error);
      message.error('Error al buscar estudiantes');
    } finally {
      setSearchLoading(false);
    }
  };
  const handleStudentSelect = (_value: string, option: AlumnoOption) => {
    setSelectedStudent(option);
    form.setFieldsValue({ alumno: option.label });
  };
  const handleCodigoSearch = async (codigo: string) => {
    if (!codigo.trim()) {
      message.warning('Por favor ingrese un código válido');
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
        };
        
        setSelectedStudent(student);
        form.setFieldsValue({ alumno: student.label });
        setCodigoInputValue('');
        message.success('Estudiante encontrado');
      } else {
        message.error('No se encontró ningún estudiante con ese código');
      }
    } catch (error) {
      console.error('Error searching by código:', error);
      message.error('No se encontró ningún estudiante con ese código');
    } finally {
      setSearchLoading(false);
    }
  };
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (mode === 'add' && !selectedStudent) {
        message.error('Por favor selecciona un estudiante');
        return;
      }

      setLoading(true);

      const assignmentData = {
        alumnoId: mode === 'edit' ? initialData!.alumnoId : selectedStudent!.id,
        rubroTransporteId,
        fechaInicio: values.fechaInicio.format('YYYY-MM-DD'),
        fechaFin: values.fechaFin ? values.fechaFin.format('YYYY-MM-DD') : undefined
      };      if (mode === 'add') {
        // Check if student is already assigned to this route
        try {
          const existingAssignment = await routeAssignmentService.getStudentRouteAssignment(
            assignmentData.alumnoId, 
            assignmentData.rubroTransporteId
          );
          
          if (existingAssignment) {
            message.error('Este estudiante ya está asignado a esta ruta de transporte');
            return;
          }
        } catch (error) {
          // If we get a 404, it means no assignment exists, which is what we want
          const axiosError = error as { response?: { status: number } };
          if (axiosError.response?.status !== 404) {
            console.error('Error checking existing assignment:', error);
            message.error('Error al verificar asignaciones existentes');
            return;
          }
          // 404 is expected when no assignment exists, so we continue
        }

        try {
          await routeAssignmentService.assignStudentToRoute(assignmentData);
          message.success('Estudiante asignado exitosamente');
        } catch (error) {
          console.error('Error assigning student:', error);          // Check if it's a duplicate error from the backend
          const axiosError = error as { response?: { status: number; data?: string } };
          if (axiosError.response?.status === 409 || 
              (axiosError.response?.data && 
               typeof axiosError.response.data === 'string' && 
               axiosError.response.data.includes('already assigned'))) {
            message.error('Este estudiante ya está asignado a esta ruta de transporte');
          } else {
            message.error('Error al asignar el estudiante');
          }
          return;
        }
      } else {
        await routeAssignmentService.updateStudentRouteAssignment(
          assignmentData.alumnoId,
          assignmentData.rubroTransporteId,
          {
            fechaInicio: assignmentData.fechaInicio,
            fechaFin: assignmentData.fechaFin
          }
        );
        message.success('Asignación actualizada exitosamente');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving assignment:', error);
      message.error('Error al guardar la asignación');
    } finally {
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

  return (
    <Modal
      title={mode === 'add' ? 'Agregar Estudiante' : 'Editar Asignación'}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSubmit}>
          {mode === 'add' ? 'Agregar' : 'Guardar'}
        </Button>
      ]}
      width={600}
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
                >
                  <AutoComplete
                    placeholder="Buscar por código, nombre o apellido..."
                    onSearch={handleStudentSearch}
                    onSelect={handleStudentSelect}
                    options={studentOptions}
                    filterOption={false}
                    notFoundContent={searchLoading ? 'Buscando...' : 'No se encontraron estudiantes'}
                    style={{ width: '100%' }}
                    allowClear
                    onClear={() => {
                      setSelectedStudent(null);
                      setStudentOptions([]);
                    }}
                  >
                    <Input prefix={<SearchOutlined />} placeholder="Buscar estudiante..." />
                  </AutoComplete>
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
