import React, { useState, useEffect, useCallback } from 'react';
import { Table, Form, Input, Button, Select, Space, Typography, Popconfirm, Card, Row, Col, Modal, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, InfoCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { alumnoService, Alumno } from '../../services/alumnoService';
import { sedeService, Sede } from '../../services/sedeService';
import { gradoService, Grado } from '../../services/gradoService';
import { getCurrentUserId } from '../../services/authService';
import ContactosModal from '../ContactosModal';

const { Title } = Typography;
const { Option } = Select;

// Estado Alumno representation
// const estadoAlumnoOptions = [
//   { value: 1, label: 'Activo', color: 'green' },
//   { value: 2, label: 'Inactivo', color: 'red' },
//   { value: 3, label: 'Retirado', color: 'orange' }
// ];

const Students: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [data, setData] = useState<Alumno[]>([]);
  const [filteredData, setFilteredData] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // State for ContactosModal
  const [contactsModalVisible, setContactsModalVisible] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  
  // Search filters state
  const [searchText, setSearchText] = useState<string>('');
  const [searchCodigo, setSearchCodigo] = useState<string>('');
  const [searchSeccion, setSearchSeccion] = useState<string>('');
  const [selectedSedeId, setSelectedSedeId] = useState<number | null>(null);
  const [selectedGradoId, setSelectedGradoId] = useState<number | null>(null);
  
  // Lookup data
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [loadingSedes, setLoadingSedes] = useState<boolean>(false);
  const [loadingGrados, setLoadingGrados] = useState<boolean>(false);

  // Helper to get full name from alumno properties
  const getFullName = (alumno: Alumno): string => {
    return [
      alumno.primerNombre,
      alumno.segundoNombre,
      alumno.primerApellido,
      alumno.segundoApellido
    ].filter(Boolean).join(' ');
  };

  // Function to apply filters to the data
  const applyFilters = useCallback(() => {
    let filtered = [...data];
    
    // Filter by full name (case-insensitive)
    if (searchText) {
      filtered = filtered.filter(alumno => {
        const fullName = getFullName(alumno).toLowerCase();
        return fullName.includes(searchText.toLowerCase());
      });
    }
    
    // Filter by Codigo (case-insensitive)
    if (searchCodigo) {
      filtered = filtered.filter(alumno => 
        alumno.codigo.toLowerCase().includes(searchCodigo.toLowerCase())
      );
    }
    
    // Filter by Seccion (case-insensitive)
    if (searchSeccion) {
      filtered = filtered.filter(alumno => 
        alumno.seccion?.toLowerCase().includes(searchSeccion.toLowerCase())
      );
    }
    
    // Filter by Sede
    if (selectedSedeId) {
      filtered = filtered.filter(alumno => 
        alumno.sedeId === selectedSedeId
      );
    }
    
    // Filter by Grado
    if (selectedGradoId) {
      filtered = filtered.filter(alumno => 
        alumno.gradoId === selectedGradoId
      );
    }
    
    setFilteredData(filtered);
  }, [data, searchText, searchCodigo, searchSeccion, selectedSedeId, selectedGradoId]);

  // Apply filters when data or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setFetchingData(true);
        
        const [sedesResponse, gradosResponse, alumnosResponse] = await Promise.allSettled([
          sedeService.getAllSedes(),
          gradoService.getAllGrados(),
          alumnoService.getAllAlumnos()
        ]);
        
        // Handle sedes response
        if (sedesResponse.status === 'fulfilled') {
          const response = sedesResponse.value;
          setSedes(Array.isArray(response) ? response : []);
        } else {
          console.error('Error loading sedes:', sedesResponse.reason);
          toast.error('No se pudieron cargar las sedes. Por favor, intente de nuevo más tarde.');
          setSedes([]);
        }
        
        // Handle grados response
        if (gradosResponse.status === 'fulfilled') {
          const response = gradosResponse.value;
          setGrados(Array.isArray(response) ? response : []);
        } else {
          console.error('Error loading grados:', gradosResponse.reason);
          toast.error('No se pudieron cargar los grados. Por favor, intente de nuevo más tarde.');
          setGrados([]);
        }
        
        // Handle alumnos response
        if (alumnosResponse.status === 'fulfilled') {
          const alumnos = alumnosResponse.value;
          
          // Only show active students (estado = 1) by default
          const activeAlumnos = alumnos.filter(alumno => alumno.estado === 1);
          
          // Sort by full name by default
          const sortedAlumnos = [...activeAlumnos].sort((a, b) => {
            const fullNameA = getFullName(a);
            const fullNameB = getFullName(b);
            return fullNameA.localeCompare(fullNameB);
          });
          
          setData(sortedAlumnos);
          setFilteredData(sortedAlumnos);
        } else {
          console.error('Error loading alumnos:', alumnosResponse.reason);
          toast.error('No se pudieron cargar los estudiantes. Por favor, intente de nuevo más tarde.');
          setData([]);
          setFilteredData([]);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Hubo un problema al cargar los datos iniciales. Por favor, intente nuevamente más tarde.');
      } finally {
        setFetchingData(false);
      }
    };
    
    loadData();
  }, []);
  
  // Function to fetch alumnos from API (used for refresh button)
  const fetchAlumnos = async (showToast = true) => {
    try {
      setFetchingData(true);
      const alumnos = await alumnoService.getAllAlumnos();
      
      // Only show active students (estado = 1) by default
      const activeAlumnos = alumnos.filter(alumno => alumno.estado === 1);
      
      // Sort by full name by default
      const sortedAlumnos = [...activeAlumnos].sort((a, b) => {
        const fullNameA = getFullName(a);
        const fullNameB = getFullName(b);
        return fullNameA.localeCompare(fullNameB);
      });
      
      setData(sortedAlumnos);
      setFilteredData(sortedAlumnos);
      
      // Only show toast if parameter is true
      if (showToast) {
        toast.info('Datos actualizados correctamente');
      }
    } catch (error) {
      console.error('Error fetching alumnos:', error);
      toast.error('No se pudieron cargar los estudiantes. Por favor, intente de nuevo más tarde.');
    } finally {
      setFetchingData(false);
    }
  };
  
  // Function to fetch sedes from API
  const fetchSedes = async () => {
    try {
      setLoadingSedes(true);
      const response = await sedeService.getAllSedes();
      // Ensure sedes is always an array
      setSedes(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching sedes:', error);
      toast.error('No se pudieron cargar las sedes. Por favor, intente de nuevo más tarde.');
      setSedes([]); // Set to empty array on error
    } finally {
      setLoadingSedes(false);
    }
  };

  // Function to fetch grados from API
  const fetchGrados = async () => {
    try {
      setLoadingGrados(true);
      const response = await gradoService.getAllGrados();
      // Ensure grados is always an array
      setGrados(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching grados:', error);
      toast.error('No se pudieron cargar los grados. Por favor, intente de nuevo más tarde.');
      setGrados([]); // Set to empty array on error
    } finally {
      setLoadingGrados(false);
    }
  };

  // Handle search form reset
  const handleReset = () => {
    searchForm.resetFields();
    setSearchText('');
    setSearchCodigo('');
    setSearchSeccion('');
    setSelectedSedeId(null);
    setSelectedGradoId(null);
  };

  const handleEdit = (record: Alumno) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ estado: 1 }); // Set default estado to Activo
    setModalVisible(true);
  };
  
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Get current user ID for audit fields
      const currentUserId = getCurrentUserId();
      
      if (!currentUserId) {
        toast.error('Error: No hay un usuario autenticado');
        setLoading(false);
        return;
      }

      if (editingId === null) {
        // Add new student
        const newStudent = {
          ...values,
          estado: 1, // Always set to Activo for new students
          usuarioCreacionId: currentUserId, // Set the creation user ID
        };
        
        const createdStudent = await alumnoService.createAlumno(newStudent);
        setData([...data, createdStudent]);
        toast.success('Estudiante creado con éxito');
      } else {
        // Update existing student
        await alumnoService.updateAlumno(editingId, { 
          ...values, 
          id: editingId,
          usuarioActualizacionId: currentUserId // Set the update user ID
        });
        
        // Refresh the data to get the updated version, but don't show the toast
        await fetchAlumnos(false);
        toast.success('Estudiante actualizado con éxito');
      }

      setModalVisible(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar el estudiante. Por favor, revise los datos e intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      
      // Perform logical delete - set estado to Inactivo (2)
      const alumno = data.find(a => a.id === id);
      if (alumno) {
        const updatedAlumno = { ...alumno, estado: 2 }; // Set to Inactivo
        await alumnoService.updateAlumno(id, updatedAlumno);
        
        // Remove from current view (since we only show active students)
        setData(data.filter(item => item.id !== id));
        setFilteredData(filteredData.filter(item => item.id !== id));
        
        toast.success('Estudiante marcado como inactivo correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar el estudiante:', error);
      toast.error('Error al desactivar el estudiante. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const openContactsModal = (record: Alumno) => {
    setSelectedStudentId(record.id);
    setSelectedStudentName(getFullName(record));
    setContactsModalVisible(true);
  };

  // Columns for the table
  const columns = [
    {
      title: 'Código',
      dataIndex: 'codigo',
      key: 'codigo',
      width: 100,
      sorter: (a: Alumno, b: Alumno) => a.codigo.localeCompare(b.codigo)
    },
    {
      title: 'Nombre Completo',
      key: 'nombreCompleto',
      width: 200,
      render: (_: any, record: Alumno) => getFullName(record),
      sorter: (a: Alumno, b: Alumno) => {
        const fullNameA = getFullName(a);
        const fullNameB = getFullName(b);
        return fullNameA.localeCompare(fullNameB);
      },
      defaultSortOrder: 'ascend' as const
    },
    {
      title: 'Grado',
      key: 'grado',
      dataIndex: 'gradoNombre',
      width: 120,
      sorter: (a: Alumno, b: Alumno) => a.gradoNombre.localeCompare(b.gradoNombre)
    },
    {
      title: 'Sección',
      key: 'seccion',
      dataIndex: 'seccion',
      width: 100,
      render: (seccion: string | undefined | null) => {
        return seccion || '-';
      },
      sorter: (a: Alumno, b: Alumno) => {
        const seccionA = a.seccion || '';
        const seccionB = b.seccion || '';
        return seccionA.localeCompare(seccionB);
      }
    },
    {
      title: 'Observaciones',
      key: 'observaciones',
      dataIndex: 'observaciones',
      width: 150,
      ellipsis: true,
      render: (observaciones: string | undefined | null) => {
        if (!observaciones) return '-';
        return (
          <Tooltip title={observaciones} placement="topLeft">
            <span style={{ cursor: 'pointer', color: '#1890ff' }}>
              {observaciones.length > 20 ? `${observaciones.substring(0, 20)}...` : observaciones}
            </span>
          </Tooltip>
        );
      }
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 140,
      render: (_: any, record: Alumno) => (
        <Space size={0}>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            style={{ padding: '0 4px', fontSize: '12px', marginRight: 4, height: '24px', minWidth: '28px' }}
            onClick={() => handleEdit(record)}
          />
          <Button 
            type="default" 
            icon={<TeamOutlined />} 
            size="small"
            style={{ padding: '0 4px', fontSize: '12px', marginRight: 4, height: '24px', minWidth: '28px' }}
            onClick={() => openContactsModal(record)}
            title="Gestionar contactos"
          />
          <Popconfirm
            title={
              <div>
                <p>¿Está seguro de desactivar este estudiante?</p>
                <p style={{ fontSize: '12px', color: '#ff4d4f' }}>
                  Esto marcará al estudiante como inactivo.
                </p>
              </div>
            }
            onConfirm={() => handleDelete(record.id)}
            okText="Sí, desactivar"
            cancelText="No, cancelar"
            okButtonProps={{ danger: true }}
            icon={<DeleteOutlined style={{ color: 'red' }} />}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
              size="small"
              style={{ padding: '0 4px', fontSize: '12px', height: '24px', minWidth: '28px' }}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Render the search panel
  const renderSearchPanel = () => {
    return (
      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item label="Nombre Completo">
                <Input 
                  placeholder="Buscar por nombre o apellido" 
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item label="Código">
                <Input 
                  placeholder="Buscar por código" 
                  value={searchCodigo}
                  onChange={(e) => setSearchCodigo(e.target.value)}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item label="Sección">
                <Input 
                  placeholder="Buscar por sección" 
                  value={searchSeccion}
                  onChange={(e) => setSearchSeccion(e.target.value)}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item label="Sede">
                <Select 
                  placeholder="Filtrar por sede"
                  value={selectedSedeId}
                  onChange={(value) => setSelectedSedeId(value)}
                  loading={loadingSedes}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {sedes.map(sede => (
                    <Option key={sede.id} value={sede.id}>{sede.nombre}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item label="Grado">
                <Select 
                  placeholder="Filtrar por grado"
                  value={selectedGradoId}
                  onChange={(value) => setSelectedGradoId(value)}
                  loading={loadingGrados}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {grados.map(grado => (
                    <Option key={grado.id} value={grado.id}>{grado.nombre}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Space>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                Limpiar Filtros
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>
    );
  };
  
  return (
    <div className="students-container">
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
      <div className="students-header">
        <Title level={2}>Gestión de Estudiantes</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            Nuevo Estudiante
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => {
              // Refresh all data
              Promise.all([
                fetchSedes(),
                fetchGrados(),
                fetchAlumnos(true) // Explicitly show toast for manual refresh
              ]).catch(error => {
                console.error('Error refreshing data:', error);
                toast.error('Error al refrescar los datos. Por favor, intente nuevamente.');
              });
            }}
            loading={fetchingData}
          >
            Refrescar
          </Button>
        </Space>
      </div>

      {renderSearchPanel()}

      <Table 
        columns={columns} 
        dataSource={filteredData} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
        loading={fetchingData}
        size="small"
      />

      <Modal
        title={editingId === null ? 'Crear Nuevo Estudiante' : 'Editar Estudiante'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setModalVisible(false)}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleSave}
          >
            Guardar
          </Button>,
        ]}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          name="studentForm"
          initialValues={{ estado: 1 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Código"
                name="codigo"
                rules={[{ required: true, message: 'Por favor ingrese el código!' }]}
              >
                <Input placeholder="Ingrese el código del estudiante" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Sede"
                name="sedeId"
                rules={[{ required: true, message: 'Por favor seleccione la sede!' }]}
              >
                <Select 
                  placeholder="Seleccione la sede"
                  loading={loadingSedes}
                  showSearch
                  optionFilterProp="children"
                  onChange={(_value, option: any) => {
                    // When sede is changed, update the sedeNombre field
                    form.setFieldsValue({ 
                      sedeNombre: option.children 
                    });
                  }}
                >
                  {sedes.map(sede => (
                    <Option key={sede.id} value={sede.id}>{sede.nombre}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="sedeNombre" hidden>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Primer Nombre"
                name="primerNombre"
                rules={[{ required: true, message: 'Por favor ingrese el primer nombre!' }]}
              >
                <Input placeholder="Primer nombre" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Segundo Nombre"
                name="segundoNombre"
              >
                <Input placeholder="Segundo nombre (opcional)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Primer Apellido"
                name="primerApellido"
                rules={[{ required: true, message: 'Por favor ingrese el primer apellido!' }]}
              >
                <Input placeholder="Primer apellido" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Segundo Apellido"
                name="segundoApellido"
              >
                <Input placeholder="Segundo apellido (opcional)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Grado"
                name="gradoId"
                rules={[{ required: true, message: 'Por favor seleccione el grado!' }]}
              >
                <Select 
                  placeholder="Seleccione el grado"
                  loading={loadingGrados}
                  showSearch
                  optionFilterProp="children"
                  onChange={(_value, option: any) => {
                    // When grado is changed, update the gradoNombre field
                    form.setFieldsValue({ 
                      gradoNombre: option.children 
                    });
                  }}
                >
                  {grados.map(grado => (
                    <Option key={grado.id} value={grado.id}>{grado.nombre}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="gradoNombre" hidden>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Sección"
                name="seccion"
              >
                <Input placeholder="Ingrese la sección" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Dirección"
                name="direccion"
              >
                <Input.TextArea 
                  placeholder="Ingrese la dirección del estudiante (opcional)" 
                  rows={2}
                  maxLength={255}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Observaciones"
                name="observaciones"
              >
                <Input.TextArea 
                  placeholder="Ingrese observaciones sobre el estudiante (opcional)" 
                  rows={4}
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="estado" hidden>
            <Input type="number" />
          </Form.Item>

          {editingId !== null && (
            <>
              <Row justify="end">
                <Button 
                  icon={<TeamOutlined />} 
                  onClick={() => {
                    if (editingId) {
                      const student = data.find(s => s.id === editingId);
                      if (student) {
                        setSelectedStudentId(editingId);
                        setSelectedStudentName(getFullName(student));
                        setContactsModalVisible(true);
                      }
                    }
                  }}
                  disabled={!editingId}
                >
                  Gestionar Contactos
                </Button>
              </Row>
              <div className="audit-info" style={{ marginTop: 16 }}>
                <Typography.Text type="secondary">
                  <InfoCircleOutlined /> La información de auditoría se actualizará automáticamente al guardar.
                </Typography.Text>
              </div>
            </>
          )}
        </Form>
      </Modal>

      {/* ContactosModal component */}
      <ContactosModal 
        visible={contactsModalVisible}
        onClose={() => setContactsModalVisible(false)}
        alumnoId={selectedStudentId}
        alumnoName={selectedStudentName}
      />
    </div>
  );
};

export default Students;
