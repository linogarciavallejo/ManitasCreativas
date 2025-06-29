import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Space,
  Popconfirm,
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Image,
  Upload,
  Spin
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ClearOutlined,
  UploadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// Interface for file upload
interface ImageFile {
  uid: string;
  name: string;
  type: string;
  base64: string;
}
import { uniformService, type PrendaUniforme, PrendaUniformeSimple, PrendaUniformeCreate } from '../../../services/uniformService';
import './PrendaUniforme.css';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Gender options
const sexoOptions = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Femenino', label: 'Femenino' },
  { value: 'Unisex', label: 'Unisex' }
];

// Size options
const tallaOptions = [
  { value: '*', label: 'Todas' },
  { value: 'XXS', label: 'XXS' },
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
  { value: 'XXXL', label: 'XXXL' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '8', label: '8' },
  { value: '9', label: '9' },
  { value: '10', label: '10' },
  { value: '12', label: '12' },
  { value: '14', label: '14' },
  { value: '16', label: '16' },
  { value: '18', label: '18' }
];

const PrendaUniforme: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [data, setData] = useState<PrendaUniformeSimple[]>([]);
  const [filteredData, setFilteredData] = useState<PrendaUniformeSimple[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedSexo, setSelectedSexo] = useState<string | null>(null);
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null);
  const [precioMin, setPrecioMin] = useState<number | null>(null);
  const [precioMax, setPrecioMax] = useState<number | null>(null);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [fileList, setFileList] = useState<ImageFile[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      await fetchPrendasUniforme();
    };
    
    loadData();
  }, []);

  // Apply filters when data or filter criteria change
  const applyFilters = React.useCallback(() => {
    let filtered = [...data];
    
    // Filter by descripcion (case-insensitive)
    if (searchText) {
      filtered = filtered.filter(item => 
        item.descripcion.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Filter by sexo
    if (selectedSexo) {
      filtered = filtered.filter(item => item.sexo === selectedSexo);
    }
    
    // Filter by talla
    if (selectedTalla) {
      filtered = filtered.filter(item => item.talla === selectedTalla);
    }
    
    // Filter by precio min
    if (precioMin !== null) {
      filtered = filtered.filter(item => item.precio >= precioMin);
    }
    
    // Filter by precio max
    if (precioMax !== null) {
      filtered = filtered.filter(item => item.precio <= precioMax);
    }
    
    // Filter out deleted items
    filtered = filtered.filter(item => !item.esEliminado);
    
    setFilteredData(filtered);
  }, [data, searchText, selectedSexo, selectedTalla, precioMin, precioMax]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Function to fetch uniform garments from API
  const fetchPrendasUniforme = async () => {
    try {
      setFetchingData(true);
      const prendas = await uniformService.getAllPrendasUniformeSimple();
      setData(prendas);
    } catch (error) {
      console.error('Error fetching uniform garments:', error);
      message.error('Error al cargar las prendas de uniforme');
    } finally {
      setFetchingData(false);
    }
  };

  // Handle search form reset
  const handleReset = () => {
    searchForm.resetFields();
    setSearchText('');
    setSelectedSexo(null);
    setSelectedTalla(null);
    setPrecioMin(null);
    setPrecioMax(null);
  };

  // Function to validate required form fields
  const validateForm = () => {
    const descripcion = form.getFieldValue('descripcion');
    const sexo = form.getFieldValue('sexo');
    const talla = form.getFieldValue('talla');
    const precio = form.getFieldValue('precio');
    const existenciaInicial = form.getFieldValue('existenciaInicial');
    
    const isValid = Boolean(
      descripcion && 
      descripcion.trim() !== '' && 
      sexo && 
      talla && 
      precio !== undefined && 
      precio !== null && 
      precio > 0 &&
      existenciaInicial !== undefined && 
      existenciaInicial !== null && 
      existenciaInicial >= 0
    );
    
    setIsFormValid(isValid);
  };

  // Get stock status color
  const getStockStatusColor = (existencia: number) => {
    if (existencia <= 0) return 'red';
    if (existencia <= 5) return 'orange';
    return 'green';
  };

  // Get stock status text
  const getStockStatusText = (existencia: number) => {
    if (existencia <= 0) return 'Sin stock';
    if (existencia <= 5) return 'Stock bajo';
    return 'En stock';
  };

  // Columns for the table
  const columns: ColumnsType<PrendaUniformeSimple> = [
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      width: '25%',
      sorter: (a, b) => a.descripcion.localeCompare(b.descripcion),
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Sexo',
      dataIndex: 'sexo',
      key: 'sexo',
      width: '10%',
      render: (sexo: string) => (
        <Tag color={sexo === 'Masculino' ? 'blue' : sexo === 'Femenino' ? 'pink' : 'purple'}>
          {sexo}
        </Tag>
      ),
      sorter: (a, b) => a.sexo.localeCompare(b.sexo),
    },
    {
      title: 'Talla',
      dataIndex: 'talla',
      key: 'talla',
      width: '8%',
      align: 'center',
      render: (talla: string) => talla === '*' ? 'Todas' : talla,
      sorter: (a, b) => a.talla.localeCompare(b.talla),
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      width: '12%',
      align: 'right',
      render: (precio: number) => `Q${precio.toFixed(2)}`,
      sorter: (a, b) => a.precio - b.precio,
    },
    {
      title: 'Stock Actual',
      dataIndex: 'existenciaActual',
      key: 'existenciaActual',
      width: '12%',
      align: 'center',
      render: (existencia: number) => (
        <Tag color={getStockStatusColor(existencia)}>
          {existencia} - {getStockStatusText(existencia)}
        </Tag>
      ),
      sorter: (a, b) => a.existenciaActual - b.existenciaActual,
    },
    {
      title: 'Inicial',
      dataIndex: 'existenciaInicial',
      key: 'existenciaInicial',
      width: '8%',
      align: 'center',
      sorter: (a, b) => a.existenciaInicial - b.existenciaInicial,
    },
    {
      title: 'Entradas',
      dataIndex: 'entradas',
      key: 'entradas',
      width: '8%',
      align: 'center',
      sorter: (a, b) => a.entradas - b.entradas,
    },
    {
      title: 'Salidas',
      dataIndex: 'salidas',
      key: 'salidas',
      width: '8%',
      align: 'center',
      sorter: (a, b) => a.salidas - b.salidas,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: '9%',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record)}
            title="Ver detalles"
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            title="Editar"
          />
          <Popconfirm
            title="¿Está seguro de eliminar esta prenda?"
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
          setSelectedSexo(values.sexo || null);
          setSelectedTalla(values.talla || null);
          setPrecioMin(values.precioMin || null);
          setPrecioMax(values.precioMax || null);
        }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Descripción" name="searchText">
              <Input
                placeholder="Buscar por descripción"
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Sexo" name="sexo">
              <Select placeholder="Seleccionar sexo" allowClear>
                {sexoOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Talla" name="talla">
              <Select placeholder="Seleccionar talla" allowClear>
                {tallaOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Precio Min" name="precioMin">
              <InputNumber
                placeholder="0.00"
                min={0}
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Precio Max" name="precioMax">
              <InputNumber
                placeholder="0.00"
                min={0}
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={2}>
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

  const handleView = async (record: PrendaUniformeSimple) => {
    try {
      const prenda = await uniformService.getPrendaUniformeById(record.id);
      Modal.info({
        title: `Detalles de ${prenda.descripcion}`,
        width: 600,
        content: (
          <div style={{ marginTop: 16 }}>
            <p><strong>Sexo:</strong> {prenda.sexo}</p>
            <p><strong>Talla:</strong> {prenda.talla}</p>
            <p><strong>Precio:</strong> Q{prenda.precio.toFixed(2)}</p>
            <p><strong>Stock Inicial:</strong> {prenda.existenciaInicial}</p>
            <p><strong>Entradas:</strong> {prenda.entradas}</p>
            <p><strong>Salidas:</strong> {prenda.salidas}</p>
            <p><strong>Stock Actual:</strong> {prenda.existenciaInicial + prenda.entradas - prenda.salidas}</p>
            {prenda.notas && <p><strong>Notas:</strong> {prenda.notas}</p>}
            <p><strong>Fecha de Creación:</strong> {new Date(prenda.fechaCreacion).toLocaleDateString()}</p>
            {prenda.imagenesPrenda && prenda.imagenesPrenda.length > 0 && (
              <div>
                <p><strong>Imágenes:</strong></p>
                {prenda.imagenesPrenda.map((img, index) => (
                  <Image
                    key={index}
                    width={100}
                    height={100}
                    src={img.imagen}
                    style={{ marginRight: 8, marginBottom: 8 }}
                  />
                ))}
              </div>
            )}
          </div>
        ),
      });
    } catch (error) {
      console.error('Error fetching uniform details:', error);
      message.error('Error al cargar los detalles de la prenda');
    }
  };

  const handleEdit = async (record: PrendaUniformeSimple) => {
    try {
      const prenda = await uniformService.getPrendaUniformeById(record.id);
      setEditingId(record.id);
      form.setFieldsValue({
        descripcion: prenda.descripcion,
        sexo: prenda.sexo,
        talla: prenda.talla,
        precio: prenda.precio,
        existenciaInicial: prenda.existenciaInicial,
        notas: prenda.notas,
      });
      setFileList([]);
      setModalVisible(true);
      validateForm();
    } catch (error) {
      console.error('Error fetching uniform for edit:', error);
      message.error('Error al cargar la prenda para edición');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await uniformService.deletePrendaUniforme(id, 'Eliminado desde la interfaz de usuario', 1);
      message.success('Prenda eliminada exitosamente');
      await fetchPrendasUniforme();
    } catch (error) {
      console.error('Error deleting uniform:', error);
      message.error('Error al eliminar la prenda');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setFileList([]);
    setModalVisible(true);
    setIsFormValid(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Process images
      const imagenes = fileList.map(file => ({
        base64Content: file.base64,
        fileName: file.name,
        contentType: file.type
      }));

      const prendaData: PrendaUniformeCreate = {
        descripcion: values.descripcion,
        sexo: values.sexo,
        talla: values.talla,
        precio: values.precio,
        existenciaInicial: values.existenciaInicial,
        notas: values.notas,
        imagenes: imagenes
      };

      if (editingId) {
        await uniformService.updatePrendaUniforme(editingId, prendaData, 1);
        message.success('Prenda actualizada exitosamente');
      } else {
        await uniformService.createPrendaUniforme(prendaData, 1);
        message.success('Prenda creada exitosamente');
      }

      setModalVisible(false);
      await fetchPrendasUniforme();
    } catch (error) {
      console.error('Error saving uniform:', error);
      message.error('Error al guardar la prenda');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setFileList([...fileList, {
        uid: `${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type,
        base64: base64.split(',')[1] // Remove data:image/jpeg;base64, prefix
      }]);
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  const handlePreview = async (file: { base64?: string; type?: string; url?: string; name?: string }) => {
    setPreviewImage(file.base64 ? `data:${file.type};base64,${file.base64}` : file.url || '');
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url?.substring(file.url.lastIndexOf('/') + 1) || '');
  };

  return (
    <div className="prenda-uniforme-container">
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2}>Catálogo de Uniformes</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Agregar Prenda
          </Button>
        </div>

        {renderSearchPanel()}

        <Card>
          <Spin spinning={fetchingData}>
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              pagination={{
                total: filteredData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} de ${total} prendas`,
              }}
              scroll={{ x: 1200 }}
              size="small"
            />
          </Spin>
        </Card>

        <Modal
          title={editingId ? 'Editar Prenda de Uniforme' : 'Nueva Prenda de Uniforme'}
          open={modalVisible}
          onOk={handleSave}
          onCancel={() => setModalVisible(false)}
          width={800}
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
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Descripción"
                  name="descripcion"
                  rules={[{ required: true, message: 'Por favor ingrese la descripción' }]}
                >
                  <Input placeholder="Ej: Camisa blanca manga larga" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Sexo"
                  name="sexo"
                  rules={[{ required: true, message: 'Por favor seleccione el sexo' }]}
                >
                  <Select placeholder="Seleccionar sexo">
                    {sexoOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Talla"
                  name="talla"
                  rules={[{ required: true, message: 'Por favor seleccione la talla' }]}
                >
                  <Select placeholder="Seleccionar talla">
                    {tallaOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Precio"
                  name="precio"
                  rules={[
                    { required: true, message: 'Por favor ingrese el precio' },
                    { type: 'number', min: 0.01, message: 'El precio debe ser mayor a 0' }
                  ]}
                >
                  <InputNumber
                    placeholder="0.00"
                    min={0}
                    precision={2}
                    style={{ width: '100%' }}
                    addonBefore="Q"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Existencia Inicial"
                  name="existenciaInicial"
                  rules={[
                    { required: true, message: 'Por favor ingrese la existencia inicial' },
                    { type: 'number', min: 0, message: 'La existencia debe ser mayor o igual a 0' }
                  ]}
                >
                  <InputNumber
                    placeholder="0"
                    min={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Notas" name="notas">
                  <TextArea
                    rows={3}
                    placeholder="Notas adicionales sobre la prenda..."
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Imágenes">
                  <Upload
                    listType="picture-card"
                    fileList={fileList.map(file => ({
                      uid: file.uid,
                      name: file.name,
                      status: 'done' as const,
                      url: `data:${file.type};base64,${file.base64}`
                    }))}
                    beforeUpload={handleImageUpload}
                    onPreview={handlePreview}
                    onRemove={(file) => {
                      setFileList(fileList.filter(f => f.uid !== file.uid));
                    }}
                  >
                    {fileList.length >= 8 ? null : (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Subir</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        <Modal
          open={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
        >
          <img alt="preview" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    </div>
  );
};

export default PrendaUniforme;
