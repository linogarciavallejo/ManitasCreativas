import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Space,
  Popconfirm,
  Typography,
  Card,
  Row,
  Col,
  Tag,
  InputNumber,
  Input
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  ClearOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { rubroUniformeDetalleService, RubroUniformeDetalle, RubroUniformeDetalleCreate } from '../../../services/rubroUniformeDetalleService';
import { rubroService, Rubro } from '../../../services/rubroService';
import { uniformService, PrendaUniformeSimple } from '../../../services/uniformService';
import { ColumnsType } from 'antd/es/table';
import './UniformsConfiguration.css';

const { Title } = Typography;
const { Option } = Select;

const UniformsConfiguration: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [data, setData] = useState<RubroUniformeDetalle[]>([]);
  const [filteredData, setFilteredData] = useState<RubroUniformeDetalle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Filter states
  const [searchText, setSearchText] = useState<string>('');
  const [selectedRubroId, setSelectedRubroId] = useState<number | null>(null);
  const [selectedSexo, setSelectedSexo] = useState<string | null>(null);
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null);
  const [precioMin, setPrecioMin] = useState<number | null>(null);
  const [precioMax, setPrecioMax] = useState<number | null>(null);
  
  // Form validation state
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  
  // Lookup data
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [prendas, setPrendas] = useState<PrendaUniformeSimple[]>([]);
  const [loadingRubros, setLoadingRubros] = useState<boolean>(false);
  const [loadingPrendas, setLoadingPrendas] = useState<boolean>(false);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchRubros(),
        fetchPrendas(),
        fetchRubroUniformeDetalles()
      ]);
    };
    
    loadData();
  }, []);

  // Apply filters when data or filter criteria change
  const applyFilters = useCallback(() => {
    let filtered = [...data];
    
    // Filter by rubro or prenda descripcion (case-insensitive)
    if (searchText) {
      filtered = filtered.filter(item => 
        item.rubroDescripcion.toLowerCase().includes(searchText.toLowerCase()) ||
        item.prendaUniformeDescripcion.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Filter by rubro
    if (selectedRubroId) {
      filtered = filtered.filter(item => item.rubroId === selectedRubroId);
    }
    
    // Filter by sexo
    if (selectedSexo) {
      filtered = filtered.filter(item => item.prendaUniformeSexo === selectedSexo);
    }
    
    // Filter by talla
    if (selectedTalla) {
      filtered = filtered.filter(item => item.prendaUniformeTalla === selectedTalla);
    }
    
    // Filter by precio min
    if (precioMin !== null) {
      filtered = filtered.filter(item => item.prendaUniformePrecio >= precioMin);
    }
    
    // Filter by precio max
    if (precioMax !== null) {
      filtered = filtered.filter(item => item.prendaUniformePrecio <= precioMax);
    }
    
    // Filter out deleted items
    filtered = filtered.filter(item => !item.esEliminado);
    
    setFilteredData(filtered);
  }, [data, searchText, selectedRubroId, selectedSexo, selectedTalla, precioMin, precioMax]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Function to fetch rubro uniforme detalles from API
  const fetchRubroUniformeDetalles = async () => {
    try {
      setFetchingData(true);
      const detalles = await rubroUniformeDetalleService.getActiveRubroUniformeDetalles();
      setData(detalles);
    } catch (error) {
      console.error('Error fetching rubro uniforme detalles:', error);
      toast.error('Error al cargar las configuraciones de uniformes');
    } finally {
      setFetchingData(false);
    }
  };

  // Function to fetch rubros from API
  const fetchRubros = async () => {
    try {
      setLoadingRubros(true);
      const rubrosData = await rubroService.getAllRubros();
      // Filter only uniform-type rubros
      const uniformRubros = rubrosData.filter(rubro => rubro.esPagoDeUniforme === true);
      setRubros(uniformRubros);
    } catch (error) {
      console.error('Error fetching rubros:', error);
      toast.error('Error al cargar los rubros');
    } finally {
      setLoadingRubros(false);
    }
  };

  // Function to fetch prendas from API
  const fetchPrendas = async () => {
    try {
      setLoadingPrendas(true);
      const prendasData = await uniformService.getAllPrendasUniformeSimple();
      setPrendas(prendasData.filter(prenda => !prenda.esEliminado));
    } catch (error) {
      console.error('Error fetching prendas:', error);
      toast.error('Error al cargar las prendas de uniforme');
    } finally {
      setLoadingPrendas(false);
    }
  };

  // Handle search form reset
  const handleReset = () => {
    searchForm.resetFields();
    setSearchText('');
    setSelectedRubroId(null);
    setSelectedSexo(null);
    setSelectedTalla(null);
    setPrecioMin(null);
    setPrecioMax(null);
  };

  // Function to validate required form fields
  const validateForm = () => {
    const rubroId = form.getFieldValue('rubroId');
    const prendaUniformeId = form.getFieldValue('prendaUniformeId');
    
    const isValid = Boolean(
      rubroId !== undefined && 
      rubroId !== null && 
      prendaUniformeId !== undefined && 
      prendaUniformeId !== null
    );
    
    setIsFormValid(isValid);
  };

  // Get unique values for filters
  const getUniqueSexos = () => {
    const sexos = [...new Set(data.map(item => item.prendaUniformeSexo))];
    return sexos.filter(Boolean);
  };

  const getUniqueTallas = () => {
    const tallas = [...new Set(data.map(item => item.prendaUniformeTalla))];
    return tallas.filter(Boolean);
  };

  // Columns for the table
  const columns: ColumnsType<RubroUniformeDetalle> = [
    {
      title: 'Rubro',
      dataIndex: 'rubroDescripcion',
      key: 'rubroDescripcion',
      width: '25%',
      sorter: (a, b) => a.rubroDescripcion.localeCompare(b.rubroDescripcion),
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Prenda',
      dataIndex: 'prendaUniformeDescripcion',
      key: 'prendaUniformeDescripcion',
      width: '25%',
      sorter: (a, b) => a.prendaUniformeDescripcion.localeCompare(b.prendaUniformeDescripcion),
    },
    {
      title: 'Sexo',
      dataIndex: 'prendaUniformeSexo',
      key: 'prendaUniformeSexo',
      width: '10%',
      render: (sexo: string) => (
        <Tag color={sexo === 'Masculino' ? 'blue' : sexo === 'Femenino' ? 'pink' : 'purple'}>
          {sexo}
        </Tag>
      ),
      sorter: (a, b) => a.prendaUniformeSexo.localeCompare(b.prendaUniformeSexo),
    },
    {
      title: 'Talla',
      dataIndex: 'prendaUniformeTalla',
      key: 'prendaUniformeTalla',
      width: '8%',
      align: 'center',
      render: (talla: string) => talla === '*' ? 'Todas' : talla,
      sorter: (a, b) => a.prendaUniformeTalla.localeCompare(b.prendaUniformeTalla),
    },
    {
      title: 'Precio',
      dataIndex: 'prendaUniformePrecio',
      key: 'prendaUniformePrecio',
      width: '12%',
      align: 'right',
      render: (precio: number) => `Q${precio.toFixed(2)}`,
      sorter: (a, b) => a.prendaUniformePrecio - b.prendaUniformePrecio,
    },
    {
      title: 'Fecha Creación',
      dataIndex: 'fechaCreacion',
      key: 'fechaCreacion',
      width: '12%',
      render: (fecha: string) => new Date(fecha).toLocaleDateString(),
      sorter: (a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime(),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: '8%',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="¿Está seguro de eliminar esta configuración?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
            okType="danger"
          >
            <Button
              type="link"
              icon={<DeleteOutlined />}
              size="small"
              danger
              title="Eliminar"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Render the search panel
  const renderSearchPanel = () => (
    <Card style={{ marginBottom: 16 }}>
      <Form
        form={searchForm}
        layout="horizontal"
        onValuesChange={() => {
          const values = searchForm.getFieldsValue();
          setSearchText(values.searchText || '');
          setSelectedRubroId(values.rubroId || null);
          setSelectedSexo(values.sexo || null);
          setSelectedTalla(values.talla || null);
          setPrecioMin(values.precioMin || null);
          setPrecioMax(values.precioMax || null);
        }}
      >
        <Row gutter={16}>
          <Col span={5}>
            <Form.Item label="Buscar" name="searchText">
              <Input
                placeholder="Buscar por rubro o prenda"
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Rubro" name="rubroId">
              <Select placeholder="Seleccionar rubro" allowClear loading={loadingRubros}>
                {rubros.map(rubro => (
                  <Option key={rubro.id} value={rubro.id}>{rubro.descripcion}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Sexo" name="sexo">
              <Select placeholder="Sexo" allowClear>
                {getUniqueSexos().map(sexo => (
                  <Option key={sexo} value={sexo}>{sexo}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Talla" name="talla">
              <Select placeholder="Talla" allowClear>
                {getUniqueTallas().map(talla => (
                  <Option key={talla} value={talla}>{talla === '*' ? 'Todas' : talla}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Precio Min" name="precioMin">
              <InputNumber
                placeholder="0.00"
                min={0}
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Precio Max" name="precioMax">
              <InputNumber
                placeholder="0.00"
                min={0}
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item>
              <Button
                type="default"
                icon={<ClearOutlined />}
                onClick={handleReset}
                style={{ marginTop: 30 }}
              >
                Limpiar
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
    setIsFormValid(false);
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await rubroUniformeDetalleService.deleteRubroUniformeDetalle(id, 'Eliminado desde la interfaz de usuario', 1);
      toast.success('Configuración eliminada exitosamente');
      await fetchRubroUniformeDetalles();
    } catch (error) {
      console.error('Error deleting rubro uniforme detalle:', error);
      toast.error('Error al eliminar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Check if combination already exists
      const exists = await rubroUniformeDetalleService.existsRubroUniformeDetalle(values.rubroId, values.prendaUniformeId);
      if (exists && editingId === null) {
        toast.error('Esta combinación de rubro y prenda ya existe');
        return;
      }

      const configData: RubroUniformeDetalleCreate = {
        rubroId: values.rubroId,
        prendaUniformeId: values.prendaUniformeId
      };

      if (editingId) {
        await rubroUniformeDetalleService.updateRubroUniformeDetalle(editingId, configData, 1);
        toast.success('Configuración actualizada exitosamente');
      } else {
        await rubroUniformeDetalleService.createRubroUniformeDetalle(configData, 1);
        toast.success('Configuración creada exitosamente');
      }

      setModalVisible(false);
      await fetchRubroUniformeDetalles();
    } catch (error) {
      console.error('Error saving rubro uniforme detalle:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uniforms-configuration-container">
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
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={2}>
              <SettingOutlined style={{ marginRight: 8 }} />
              Configuración de Uniformes
            </Title>
            <p style={{ color: '#666', marginBottom: 0 }}>
              Asocie prendas de uniforme con rubros de pago para definir qué elementos incluye cada categoría
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchRubroUniformeDetalles}
              loading={fetchingData}
            >
              Actualizar
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
            >
              Nueva Configuración
            </Button>
          </Space>
        </div>

        {renderSearchPanel()}

        <Card>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={fetchingData}
            pagination={{
              total: filteredData.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} de ${total} configuraciones`,
            }}
            scroll={{ x: 1000 }}
            size="small"
          />
        </Card>

        <Modal
          title={editingId ? 'Editar Configuración' : 'Nueva Configuración de Uniforme'}
          open={modalVisible}
          onOk={handleSave}
          onCancel={() => setModalVisible(false)}
          width={600}
          okText="Guardar"
          cancelText="Cancelar"
          confirmLoading={loading}
          okButtonProps={{ disabled: !isFormValid }}
        >
          <Form
            form={form}
            layout="vertical"
            onValuesChange={validateForm}
          >
            <Form.Item
              label="Rubro de Pago"
              name="rubroId"
              rules={[{ required: true, message: 'Por favor seleccione un rubro' }]}
            >
              <Select
                placeholder="Seleccione el rubro de pago"
                loading={loadingRubros}
                showSearch
                optionFilterProp="children"
              >
                {rubros.map(rubro => (
                  <Option key={rubro.id} value={rubro.id}>
                    {rubro.descripcion} - Q{rubro.montoPreestablecido?.toFixed(2) || '0.00'}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Prenda de Uniforme"
              name="prendaUniformeId"
              rules={[{ required: true, message: 'Por favor seleccione una prenda' }]}
            >
              <Select
                placeholder="Seleccione la prenda de uniforme"
                loading={loadingPrendas}
                showSearch
                optionFilterProp="children"
              >
                {prendas.map(prenda => (
                  <Option key={prenda.id} value={prenda.id}>
                    {prenda.descripcion} - {prenda.sexo} - {prenda.talla === '*' ? 'Todas' : prenda.talla} - Q{prenda.precio.toFixed(2)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default UniformsConfiguration;
