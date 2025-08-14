import React, { useState, useEffect, useCallback } from 'react';
import { Select, Button, Table, Space, Typography, message, Tag, Popconfirm, Radio } from 'antd';
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
  const [allAssignments, setAllAssignments] = useState<AlumnoRutaDetailed[]>([]);
  const [viewMode, setViewMode] = useState<'by-route' | 'all-assignments'>('by-route');
  const [selectedRoute, setSelectedRoute] = useState<number | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingStudent, setEditingStudent] = useState<AlumnoRutaDetailed | null>(null);

  // Load transport rubros on component mount
  useEffect(() => {
    loadTransportRubros();
  }, []);

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

  const loadAssignedStudents = useCallback(async (rubroId: number) => {
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
  }, []);

  const loadAllAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const allAssignments: AlumnoRutaDetailed[] = [];
      
      // Get assignments for all transport routes
      for (const rubro of transportRubros) {
        const students = await routeAssignmentService.getStudentsByRoute(rubro.id);
        allAssignments.push(...students);
      }
      
      // Sort by student name first, then by route
      const sortedAssignments = allAssignments.sort((a, b) => {
        const nameComparison = a.alumnoCompleto.toLowerCase().localeCompare(b.alumnoCompleto.toLowerCase());
        if (nameComparison !== 0) return nameComparison;
        
        // If same student, sort by route name
        const routeA = transportRubros.find(r => r.id === a.rubroTransporteId)?.descripcion || '';
        const routeB = transportRubros.find(r => r.id === b.rubroTransporteId)?.descripcion || '';
        return routeA.localeCompare(routeB);
      });
      
      setAllAssignments(sortedAssignments);
    } catch (error) {
      console.error('Error loading all assignments:', error);
      message.error('Error al cargar todas las asignaciones');
    } finally {
      setLoading(false);
    }
  }, [transportRubros]);

  // Load assigned students when route changes or view mode changes
  useEffect(() => {
    if (viewMode === 'by-route' && selectedRoute) {
      loadAssignedStudents(selectedRoute);
    } else if (viewMode === 'all-assignments' && transportRubros.length > 0) {
      loadAllAssignments();
    } else {
      setAssignedStudents([]);
      setAllAssignments([]);
    }
  }, [selectedRoute, viewMode, transportRubros, loadAllAssignments, loadAssignedStudents]);

  const handleRouteChange = (value: number) => {
    setSelectedRoute(value);
  };

  const handleViewModeChange = (mode: 'by-route' | 'all-assignments') => {
    setViewMode(mode);
    setSelectedRoute(undefined);
  };

  const handleAddStudent = () => {
    if (viewMode === 'by-route' && !selectedRoute) {
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
      console.log('API call parameters:', { assignmentId: student.id });
      
      const response = await routeAssignmentService.removeStudentFromRoute(student.id);
      console.log('API response:', response);
      console.log('Delete API call succeeded!');
      
      message.success('Estudiante removido exitosamente');
      
      // Reload the appropriate view to refresh the table
      if (viewMode === 'by-route' && selectedRoute) {
        console.log('Reloading assigned students for route:', selectedRoute);
        await loadAssignedStudents(selectedRoute);
        console.log('Table reloaded after delete');
      } else if (viewMode === 'all-assignments') {
        console.log('Reloading all assignments');
        await loadAllAssignments();
        console.log('All assignments table reloaded after delete');
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
    if (viewMode === 'by-route' && selectedRoute) {
      loadAssignedStudents(selectedRoute);
    } else if (viewMode === 'all-assignments') {
      loadAllAssignments();
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

  const getColumnsForView = () => {
    const baseColumns = [
      {
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
    ];

    // Add route column for all-assignments view
    if (viewMode === 'all-assignments') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const routeColumn: any = {
        title: 'Ruta',
        key: 'ruta',
        width: 200,
        render: (_: unknown, record: AlumnoRutaDetailed) => {
          const route = transportRubros.find(r => r.id === record.rubroTransporteId);
          return <span>{route?.descripcion || 'N/A'}</span>;
        },
      };
      baseColumns.push(routeColumn);
    }

    const remainingColumns = [
      {
        title: 'Fecha Inicio',
        dataIndex: 'fechaInicio',
        key: 'fechaInicio',
        width: 120,
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
            />
            <Popconfirm
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

    return [...baseColumns, ...remainingColumns];
  };

  const getTableDataSource = () => {
    return viewMode === 'all-assignments' ? allAssignments : assignedStudents;
  };
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
        
        {/* View Mode Selection */}
        <div style={{ marginBottom: 16 }}>
          <Radio.Group 
            value={viewMode} 
            onChange={(e) => handleViewModeChange(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="by-route">Por Ruta</Radio.Button>
            <Radio.Button value="all-assignments">Todas las Asignaciones</Radio.Button>
          </Radio.Group>
        </div>
        
        {/* Route Filter (only show in by-route mode) */}
        {viewMode === 'by-route' && (
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
        )}

        {/* Add Student Button for all-assignments mode */}
        {viewMode === 'all-assignments' && (
          <div style={{ marginTop: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddStudent}
            >
              Agregar Estudiante
            </Button>
          </div>
        )}
      </div>

      {/* Show table in by-route mode only when route is selected, or always in all-assignments mode */}
      {((viewMode === 'by-route' && selectedRoute) || viewMode === 'all-assignments') && (
        <div className="students-table">
          <Table
            columns={getColumnsForView()}
            dataSource={getTableDataSource()}
            loading={loading}
            rowKey={(record) => record.id.toString()}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} de ${total} ${viewMode === 'all-assignments' ? 'asignaciones' : 'estudiantes'}`,
            }}
            locale={{
              emptyText: viewMode === 'all-assignments' 
                ? 'No hay asignaciones registradas' 
                : (selectedRoute 
                  ? 'No hay estudiantes asignados a esta ruta' 
                  : 'Selecciona una ruta para ver los estudiantes asignados')
            }}
          />
        </div>
      )}

      <StudentRouteModal
        visible={modalVisible}
        mode={modalMode}
        rubroTransporteId={modalMode === 'edit' ? editingStudent?.rubroTransporteId || 0 : (selectedRoute || 0)}
        rubroNombre={modalMode === 'edit' 
          ? transportRubros.find(r => r.id === editingStudent?.rubroTransporteId)?.descripcion || ''
          : getSelectedRouteName()
        }
        initialData={editingStudent ? {
          assignmentId: editingStudent.id,
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
