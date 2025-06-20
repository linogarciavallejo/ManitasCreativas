import React, { useState, useEffect } from 'react';
import { Select, Button, Table, Space, Typography, message, Modal, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
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
        const nameA = `${a.alumnoApellidos}, ${a.alumnoNombre}`.toLowerCase();
        const nameB = `${b.alumnoApellidos}, ${b.alumnoNombre}`.toLowerCase();
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
  };

  const handleRemoveStudent = (student: AlumnoRutaDetailed) => {
    Modal.confirm({
      title: '¿Remover de ruta?',
      content: `Esta acción no se puede deshacer.`,
      okText: 'Sí, remover',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await routeAssignmentService.removeStudentFromRoute(student.alumnoId, student.rubroTransporteId);
          message.success('Estudiante removido exitosamente');
          if (selectedRoute) {
            loadAssignedStudents(selectedRoute);
          }
        } catch (error) {
          console.error('Error removing student:', error);
          message.error('Error al remover el estudiante');
        }
      }
    });
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
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT');
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
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveStudent(record)}
            title="Remover"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="routes-assignment">
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
