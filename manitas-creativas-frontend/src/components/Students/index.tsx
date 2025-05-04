import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, Select, Space, Typography, Popconfirm, message, Card, Row, Col, Tag, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, InfoCircleOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { alumnoService, Alumno } from '../../services/alumnoService';
import { sedeService, Sede } from '../../services/sedeService';
import { gradoService, Grado } from '../../services/gradoService';
import ContactosModal from '../ContactosModal';

const { Title } = Typography;
const { Option } = Select;

// Estado Alumno representation
const estadoAlumnoOptions = [
  { value: 1, label: 'Activo', color: 'green' },
  { value: 2, label: 'Inactivo', color: 'red' },
  { value: 3, label: 'Retirado', color: 'orange' }
];

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

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchSedes(),
        fetchGrados(),
        fetchAlumnos()
      ]);
    };
    
    loadData();
  }, []);

  // Apply filters when data or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [data, searchText, searchCodigo, searchSeccion, selectedSedeId, selectedGradoId]);

  // Function to fetch alumnos from API
  const fetchAlumnos = async () => {
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
    } catch (error) {
      console.error('Error fetching alumnos:', error);
      message.error('No se pudieron cargar los estudiantes');
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
      message.error('No se pudieron cargar las sedes');
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
      message.error('No se pudieron cargar los grados');
      setGrados([]); // Set to empty array on error
    } finally {
      setLoadingGrados(false);
    }
  };

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
  const applyFilters = () => {
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

      if (editingId === null) {
        // Add new student
        const newStudent = {
          ...values,
          estado: 1 // Always set to Activo for new students
        };
        
        const createdStudent = await alumnoService.createAlumno(newStudent);
        setData([...data, createdStudent]);
        message.success('Estudiante creado con éxito');
      } else {
        // Update existing student
        await alumnoService.updateAlumno(editingId, { ...values, id: editingId });
        
        // Refresh the data to get the updated version
        await fetchAlumnos();
        message.success('Estudiante actualizado con éxito');
      }

      setModalVisible(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      message.error('Error al guardar el estudiante');
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
        
        message.success('Estudiante marcado como inactivo correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar el estudiante:', error);
      message.error('Error al eliminar el estudiante');
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
      defaultSortOrder: 'ascend'
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
        console.log('Seccion value:', seccion); // Debug log
        return seccion || '-';
      },
      sorter: (a: Alumno, b: Alumno) => {
        const seccionA = a.seccion || '';
        const seccionB = b.seccion || '';
        return seccionA.localeCompare(seccionB);
      }
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 140, // Increased width to fit the new contact button
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
            onClick={fetchAlumnos}
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
                  onChange={(value, option: any) => {
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
                  onChange={(value, option: any) => {
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
