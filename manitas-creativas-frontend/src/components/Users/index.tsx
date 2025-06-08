import React, { useState, useEffect, useCallback } from 'react';
import { Table, Form, Input, Button, Select, Space, Typography, Popconfirm, Card, Row, Col, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usuarioService, Usuario } from '../../services/usuarioService';
import { rolService, Rol } from '../../services/rolService';

const { Title } = Typography;
const { Option } = Select;

// Estado Usuario options
const estadoUsuarioOptions = [
  { value: 'Activo', label: 'Activo', color: 'green' },
  { value: 'Inactivo', label: 'Inactivo', color: 'red' },
  { value: 'Bloqueado', label: 'Bloqueado', color: 'orange' }
];

const Users: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [data, setData] = useState<Usuario[]>([]);
  const [filteredData, setFilteredData] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Search filters state
  const [searchText, setSearchText] = useState<string>('');
  const [searchCodigo, setSearchCodigo] = useState<string>('');
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [selectedRol, setSelectedRol] = useState<string | null>(null);
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
  
  // Lookup data
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loadingRoles, setLoadingRoles] = useState<boolean>(false);

  // Helper to get full name from usuario properties
  const getFullName = (usuario: Usuario): string => {
    return [usuario.nombres, usuario.apellidos].filter(Boolean).join(' ');
  };

  // Function to apply filters to the data
  const applyFilters = useCallback(() => {
    let filtered = [...data];
    
    // Filter by full name (case-insensitive)
    if (searchText) {
      filtered = filtered.filter(usuario => {
        const fullName = getFullName(usuario).toLowerCase();
        return fullName.includes(searchText.toLowerCase());
      });
    }
    
    // Filter by Codigo Usuario (case-insensitive)
    if (searchCodigo) {
      filtered = filtered.filter(usuario => 
        usuario.codigoUsuario.toLowerCase().includes(searchCodigo.toLowerCase())
      );
    }
    
    // Filter by Email (case-insensitive)
    if (searchEmail) {
      filtered = filtered.filter(usuario => 
        usuario.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }
    
    // Filter by Rol
    if (selectedRol) {
      filtered = filtered.filter(usuario => 
        usuario.rol === selectedRol
      );
    }
    
    // Filter by Estado
    if (selectedEstado) {
      filtered = filtered.filter(usuario => 
        usuario.estadoUsuario === selectedEstado
      );
    }
    
    setFilteredData(filtered);
  }, [data, searchText, searchCodigo, searchEmail, selectedRol, selectedEstado]);

  // Apply filters when data or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setFetchingData(true);
        
        const [rolesResponse, usuariosResponse] = await Promise.allSettled([
          rolService.getAllRoles(),
          usuarioService.getAllUsuarios()
        ]);
        
        // Handle roles response
        if (rolesResponse.status === 'fulfilled') {
          const response = rolesResponse.value;
          setRoles(Array.isArray(response) ? response : []);
        } else {
          console.error('Error loading roles:', rolesResponse.reason);
          toast.error('No se pudieron cargar los roles. Por favor, intente de nuevo más tarde.');
          setRoles([]);
        }
          // Handle usuarios response
        if (usuariosResponse.status === 'fulfilled') {
          const usuarios = usuariosResponse.value;
          
          // Show ALL users regardless of their EstadoUsuario
          // Sort by full name by default
          const sortedUsuarios = [...usuarios].sort((a, b) => {
            const fullNameA = getFullName(a);
            const fullNameB = getFullName(b);
            return fullNameA.localeCompare(fullNameB);
          });
          
          setData(sortedUsuarios);
          setFilteredData(sortedUsuarios);
        } else {
          console.error('Error loading usuarios:', usuariosResponse.reason);
          toast.error('No se pudieron cargar los usuarios. Por favor, intente de nuevo más tarde.');
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
    // Function to fetch usuarios from API (used for refresh button)
  const fetchUsuarios = async (showToast = true) => {
    try {
      setFetchingData(true);
      const usuarios = await usuarioService.getAllUsuarios();
      
      // Show ALL users regardless of their EstadoUsuario
      // Sort by full name by default
      const sortedUsuarios = [...usuarios].sort((a, b) => {
        const fullNameA = getFullName(a);
        const fullNameB = getFullName(b);
        return fullNameA.localeCompare(fullNameB);
      });
      
      setData(sortedUsuarios);
      setFilteredData(sortedUsuarios);
      
      // Only show toast if parameter is true
      if (showToast) {
        toast.info('Datos actualizados correctamente');
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      toast.error('No se pudieron cargar los usuarios. Por favor, intente de nuevo más tarde.');
    } finally {
      setFetchingData(false);
    }
  };

  // Function to fetch roles from API (used for refresh button)
  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const roles = await rolService.getAllRoles();
      setRoles(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('No se pudieron cargar los roles. Por favor, intente de nuevo más tarde.');
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ estadoUsuario: 'Activo' });
    setModalVisible(true);
  };
  
  const handleEdit = (record: Usuario) => {
    setEditingId(record.id);
    form.setFieldsValue({
      nombres: record.nombres,
      apellidos: record.apellidos,
      codigoUsuario: record.codigoUsuario,
      email: record.email,
      celular: record.celular,
      password: record.password,
      estadoUsuario: record.estadoUsuario,
      rol: record.rol
    });
    setModalVisible(true);
  };

  const handleReset = () => {
    setSearchText('');
    setSearchCodigo('');
    setSearchEmail('');
    setSelectedRol(null);
    setSelectedEstado(null);
    searchForm.resetFields();
  };
  
  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (editingId === null) {
        // Creating new user
        const newUsuario: Usuario = {
          id: 0, // Will be set by backend
          nombres: values.nombres,
          apellidos: values.apellidos,
          codigoUsuario: values.codigoUsuario,
          email: values.email,
          celular: values.celular,
          password: values.password,
          estadoUsuario: values.estadoUsuario,
          rol: values.rol
        };
        
        await usuarioService.createUsuario(newUsuario);
        toast.success('Usuario creado correctamente');
      } else {
        // Updating existing user
        const updatedUsuario: Usuario = {
          id: editingId,
          nombres: values.nombres,
          apellidos: values.apellidos,
          codigoUsuario: values.codigoUsuario,
          email: values.email,
          celular: values.celular,
          password: values.password,
          estadoUsuario: values.estadoUsuario,
          rol: values.rol
        };
        
        await usuarioService.updateUsuario(editingId, updatedUsuario);
        toast.success('Usuario actualizado correctamente');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchUsuarios(false); // Refresh data without showing toast
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar el usuario. Por favor, revise los datos e intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
    const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      
      // Perform logical delete - set estado to Inactivo
      const usuario = data.find(u => u.id === id);
      if (usuario) {
        const updatedUsuario = { ...usuario, estadoUsuario: 'Inactivo' };
        await usuarioService.updateUsuario(id, updatedUsuario);
        
        // Refresh data to show updated status (since we show all users regardless of status)
        await fetchUsuarios(false);
        
        toast.success('Usuario marcado como inactivo correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      toast.error('Error al desactivar el usuario. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Columns for the table
  const columns = [
    {
      title: 'Código Usuario',
      dataIndex: 'codigoUsuario',
      key: 'codigoUsuario',
      width: 120,
      sorter: (a: Usuario, b: Usuario) => a.codigoUsuario.localeCompare(b.codigoUsuario)
    },    {
      title: 'Nombre Completo',
      key: 'nombreCompleto',
      width: 200,
      render: (_: unknown, record: Usuario) => getFullName(record),
      sorter: (a: Usuario, b: Usuario) => {
        const fullNameA = getFullName(a);
        const fullNameB = getFullName(b);
        return fullNameA.localeCompare(fullNameB);
      },
      defaultSortOrder: 'ascend' as const
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      sorter: (a: Usuario, b: Usuario) => a.email.localeCompare(b.email)
    },
    {
      title: 'Celular',
      dataIndex: 'celular',
      key: 'celular',
      width: 120,
      sorter: (a: Usuario, b: Usuario) => a.celular.localeCompare(b.celular)
    },
    {
      title: 'Rol',
      dataIndex: 'rol',
      key: 'rol',
      width: 120,
      sorter: (a: Usuario, b: Usuario) => a.rol.localeCompare(b.rol)
    },
    {
      title: 'Estado',
      dataIndex: 'estadoUsuario',
      key: 'estadoUsuario',
      width: 100,
      render: (estado: string) => {
        const option = estadoUsuarioOptions.find(opt => opt.value === estado);
        return (
          <span style={{ color: option?.color || 'black' }}>
            {option?.label || estado}
          </span>
        );
      },
      sorter: (a: Usuario, b: Usuario) => a.estadoUsuario.localeCompare(b.estadoUsuario)
    },    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: Usuario) => (
        <Space size={0}>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            style={{ padding: '0 4px', fontSize: '12px', marginRight: 4, height: '24px', minWidth: '28px' }}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title={
              <div>
                <p>¿Está seguro de desactivar este usuario?</p>
                <p style={{ fontSize: '12px', color: '#ff4d4f' }}>
                  Esto marcará al usuario como inactivo.
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
              <Form.Item label="Código Usuario">
                <Input 
                  placeholder="Buscar por código de usuario" 
                  value={searchCodigo}
                  onChange={(e) => setSearchCodigo(e.target.value)}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item label="Email">
                <Input 
                  placeholder="Buscar por email" 
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item label="Rol">
                <Select 
                  placeholder="Filtrar por rol"
                  value={selectedRol}
                  onChange={(value) => setSelectedRol(value)}
                  loading={loadingRoles}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {roles.map(rol => (
                    <Option key={rol.id} value={rol.nombre}>{rol.nombre}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item label="Estado">
                <Select 
                  placeholder="Filtrar por estado"
                  value={selectedEstado}
                  onChange={(value) => setSelectedEstado(value)}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {estadoUsuarioOptions.map(estado => (
                    <Option key={estado.value} value={estado.value}>{estado.label}</Option>
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
    <div className="users-container">
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
      <div className="users-header">
        <Title level={2}>Gestión de Usuarios</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            Nuevo Usuario
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => {
              // Refresh all data
              Promise.all([
                fetchRoles(),
                fetchUsuarios(true) // Explicitly show toast for manual refresh
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
        title={editingId === null ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
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
          name="userForm"
          initialValues={{ estadoUsuario: 'Activo' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Código Usuario"
                name="codigoUsuario"
                rules={[{ required: true, message: 'Por favor ingrese el código de usuario!' }]}
              >
                <Input placeholder="Ingrese el código de usuario" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Por favor ingrese el email!' },
                  { type: 'email', message: 'Por favor ingrese un email válido!' }
                ]}
              >
                <Input placeholder="Ingrese el email" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nombres"
                name="nombres"
                rules={[{ required: true, message: 'Por favor ingrese los nombres!' }]}
              >
                <Input placeholder="Nombres completos" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Apellidos"
                name="apellidos"
                rules={[{ required: true, message: 'Por favor ingrese los apellidos!' }]}
              >
                <Input placeholder="Apellidos completos" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Celular"
                name="celular"
                rules={[{ required: true, message: 'Por favor ingrese el celular!' }]}
              >
                <Input placeholder="Número de celular" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Contraseña"
                name="password"
                rules={[{ required: true, message: 'Por favor ingrese la contraseña!' }]}
              >
                <Input.Password placeholder="Contraseña del usuario" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Rol"
                name="rol"
                rules={[{ required: true, message: 'Por favor seleccione el rol!' }]}
              >
                <Select 
                  placeholder="Seleccione el rol"
                  loading={loadingRoles}
                  showSearch
                  optionFilterProp="children"
                >
                  {roles.map(rol => (
                    <Option key={rol.id} value={rol.nombre}>{rol.nombre}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Estado"
                name="estadoUsuario"
                rules={[{ required: true, message: 'Por favor seleccione el estado!' }]}
              >
                <Select placeholder="Seleccione el estado">
                  {estadoUsuarioOptions.map(estado => (
                    <Option key={estado.value} value={estado.value}>
                      <span style={{ color: estado.color }}>
                        {estado.label}
                      </span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {editingId !== null && (
            <div className="audit-info" style={{ marginTop: 16 }}>
              <Typography.Text type="secondary">
                <InfoCircleOutlined /> La información de auditoría se actualizará automáticamente al guardar.
              </Typography.Text>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
