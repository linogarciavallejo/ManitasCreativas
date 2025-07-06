import React, { useState, useEffect } from 'react';
import { Select, Button, Table, Space, Typography, message, Tag, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ToastContainer } from 'react-toastify';
import { AlumnoRutaDetailed } from '../../types/routeAssignment';
import { Rubro } from '../../services/rubroService';
import { rubroService } from '../../services/rubroService';
import { routeAssignmentService } from '../../services/routeAssignmentService';
import StudentRouteModal from './StudentRouteModal';
import './RoutesAssignment.css';

const { Title } = Typography;
const { Option } = Select;

const RoutesAssignment: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [transportRubros, setTransportRubros] = useState<Rubro[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<AlumnoRutaDetailed[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<number | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingStudent, setEditingStudent] = useState<AlumnoRutaDetailed | null>(null);

  // Load transport rubros on component mount
  useEffect(() => {
    loadTransportRubros();
  }, []);

  // Load assigned students when route changes
  useEffect(() => {
    if (selectedRoute) {
      loadAssignedStudents(selectedRoute);
    } else {
      setAssignedStudents([]);
    }
  }, [selectedRoute]);

  const loadTransportRubros = async () => {
    try {
      const rubros = await rubroService.getAllRubros();
      const transportRubros = rubros.filter(r => r.esPagoDeTransporte);
      setTransportRubros(transportRubros);
    } catch (error) {
      console.error('Error loading transport rubros:', error);
      message.error('Error al cargar las rutas de transporte');
    }
  };

  const loadAssignedStudents = async (rubroId: number) => {
    setLoading(true);
    try {
      const students = await routeAssignmentService.getStudentsByRoute(rubroId);
      // Sort alphabetically by full name as specified in requirements
      const sortedStudents = students.sort((a, b) => {
        const nameA = a.alumnoCompleto.toLowerCase();
        const nameB = b.alumnoCompleto.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setAssignedStudents(sortedStudents);
    } catch (error) {
      console.error('Error loading assigned students:', error);
      message.error('Error al cargar los estudiantes asignados');
    } finally {
      setLoading(false);
    }
  };

  const handleRouteChange = (value: number) => {
    setSelectedRoute(value);
  };

  const handleAddStudent = () => {
    if (!selectedRoute) {
      message.warning('Por favor selecciona una ruta primero');
      return;
    }
    setModalMode('add');
    setEditingStudent(null);
    setModalVisible(true);
  };

  const handleEditStudent = (student: AlumnoRutaDetailed) => {
    setModalMode('edit');
    setEditingStudent(student);
    setModalVisible(true);
  };  const handleRemoveStudent = async (student: AlumnoRutaDetailed) => {
    try {
      console.log('=== DELETE CONFIRMED ===');
      console.log('Removing student:', student);
      console.log('API call parameters:', { alumnoId: student.alumnoId, rubroTransporteId: student.rubroTransporteId });
      
      const response = await routeAssignmentService.removeStudentFromRoute(student.alumnoId, student.rubroTransporteId);
      console.log('API response:', response);
      console.log('Delete API call succeeded!');
      
      message.success('Estudiante removido exitosamente');
      
      // Reload the assigned students to refresh the table
      if (selectedRoute) {
        console.log('Reloading assigned students for route:', selectedRoute);
        await loadAssignedStudents(selectedRoute);
        console.log('Table reloaded after delete');
      }
    } catch (error) {
      console.error('=== DELETE API ERROR ===');
      console.error('Error removing student:', error);
      // Check if error has response details
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('Error response:', error.response);
      }
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('Error message:', error.message);
      }
      message.error('Error al remover el estudiante');
    }
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    setEditingStudent(null);
    if (selectedRoute) {
      loadAssignedStudents(selectedRoute);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingStudent(null);
  };

  const getSelectedRouteName = () => {
    const route = transportRubros.find(r => r.id === selectedRoute);
    return route?.descripcion || '';
  };  const formatDate = (dateString: string) => {
    // Handle different date formats that might come from the backend
    if (!dateString) return '';
    
    try {
      // Parse the date string as UTC to avoid timezone conversion issues
      let date: Date;
      
      if (dateString.includes('T')) {
        // If it's an ISO string (e.g., "2025-01-01T00:00:00Z"), parse it directly
        date = new Date(dateString);
      } else {
        // If it's just a date (e.g., "2025-01-01"), treat it as local date
        const dateParts = dateString.split('-');
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // months are 0-indexed
          const day = parseInt(dateParts[2]);
          date = new Date(year, month, day);
        } else {
          date = new Date(dateString);
        }
      }
      
      // If still invalid, return empty string
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return '';
      }
      
      // For UTC dates, we want to display the date part without timezone conversion
      let displayDate = date;
      if (dateString.includes('T') && dateString.endsWith('Z')) {
        // For UTC dates, extract the date components directly
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        const day = date.getUTCDate();
        displayDate = new Date(year, month, day);
      }
      
      const formattedDate = displayDate.toLocaleDateString('es-GT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      return formattedDate;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '';
    }
  };

  const columns = [    {
      title: 'No.',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: 'Alumno',
      key: 'alumno',
      render: (record: AlumnoRutaDetailed) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.alumnoCompleto}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Grado: {record.grado} • Sección: {record.seccion} • Sede: {record.sede}
          </div>
        </div>
      ),
    },
    {
      title: 'Fecha Inicio',
      dataIndex: 'fechaInicio',
      key: 'fechaInicio',      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Fecha Fin',
      dataIndex: 'fechaFin',
      key: 'fechaFin',
      width: 120,
      render: (date: string | null) => (
        date ? formatDate(date) : <Tag color="green">Activo</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (record: AlumnoRutaDetailed) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditStudent(record)}
            title="Editar"
          />          <Popconfirm
            title={
              <div>
                <p>¿Está seguro de remover este estudiante de la ruta?</p>
                <p style={{ fontSize: '12px', color: '#ff4d4f' }}>
                  Esta acción no se puede deshacer.
                </p>
              </div>
            }
            onConfirm={() => handleRemoveStudent(record)}
            okText="Sí, remover"
            cancelText="No, cancelar"
            okButtonProps={{ danger: true }}
            icon={<DeleteOutlined style={{ color: 'red' }} />}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Remover"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <div className="routes-assignment">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="routes-assignment-header">
        <Title level={2}>Asignación de Rutas</Title>
        
        <div className="route-filter">
          <Space size="middle" align="center">
            <span style={{ fontWeight: 'bold' }}>Ruta:</span>
            <Select
              placeholder="Selecciona una ruta"
              value={selectedRoute}
              onChange={handleRouteChange}
              style={{ minWidth: 300 }}
              allowClear
            >
              {transportRubros.map(rubro => (
                <Option key={rubro.id} value={rubro.id}>
                  {rubro.descripcion}
                </Option>
              ))}
            </Select>
            
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddStudent}
              disabled={!selectedRoute}
            >
              Agregar Estudiante
            </Button>
          </Space>
        </div>
      </div>

      {selectedRoute && (
        <div className="students-table">
          <Table
            columns={columns}
            dataSource={assignedStudents}
            loading={loading}
            rowKey={(record) => `${record.alumnoId}-${record.rubroTransporteId}`}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} de ${total} estudiantes`,
            }}
            locale={{
              emptyText: selectedRoute 
                ? 'No hay estudiantes asignados a esta ruta' 
                : 'Selecciona una ruta para ver los estudiantes asignados'
            }}
          />
        </div>
      )}

      <StudentRouteModal
        visible={modalVisible}
        mode={modalMode}
        rubroTransporteId={selectedRoute || 0}
        rubroNombre={getSelectedRouteName()}
        initialData={editingStudent ? {
          alumnoId: editingStudent.alumnoId,
          alumnoNombre: editingStudent.alumnoCompleto,
          fechaInicio: editingStudent.fechaInicio,
          fechaFin: editingStudent.fechaFin
        } : undefined}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default RoutesAssignment;
