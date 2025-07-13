import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Table,
  Select,
  DatePicker,
  InputNumber,
  Modal,
  Space,
  Typography,
  Row,
  Col,
  message,
  Popconfirm,
  Divider,
  Tag
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  ClearOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { entradaUniformeService, EntradaUniforme, EntradaUniformeCreate, EntradaUniformeDetalle } from '../../../services/entradaUniformeService';
import { rubroUniformeDetalleService, RubroUniformeDetalle } from '../../../services/rubroUniformeDetalleService';
import { getCurrentUserId } from '../../../services/authService';
import './UniformInventory.css';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface UniformStockItem {
  key: string;
  prendaUniformeId: number;
  descripcion: string;
  sexo: string;
  talla: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

const UniformInventory: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stockEntries, setStockEntries] = useState<EntradaUniforme[]>([]);
  const [availableUniformItems, setAvailableUniformItems] = useState<RubroUniformeDetalle[]>([]);
  const [stockItems, setStockItems] = useState<UniformStockItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  
  // Modal states
  const [itemModalVisible, setItemModalVisible] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<UniformStockItem | null>(null);
  const [entryDetailsModalVisible, setEntryDetailsModalVisible] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<EntradaUniforme | null>(null);

  // Load available uniform items on component mount
  useEffect(() => {
    loadAvailableUniformItems();
    loadStockEntries();
  }, []);

  // Calculate total when items change
  useEffect(() => {
    const total = stockItems.reduce((sum, item) => sum + item.subtotal, 0);
    setTotalAmount(total);
  }, [stockItems]);

  const loadAvailableUniformItems = async () => {
    try {
      const items = await rubroUniformeDetalleService.getActiveRubroUniformeDetalles();
      setAvailableUniformItems(items);
    } catch (error) {
      console.error('Error loading uniform items:', error);
      message.error('Error al cargar los elementos de uniforme');
    }
  };

  const loadStockEntries = async () => {
    try {
      setLoading(true);
      const entries = await entradaUniformeService.getActiveEntradasUniforme();
      setStockEntries(entries);
    } catch (error) {
      console.error('Error loading stock entries:', error);
      message.error('Error al cargar las entradas de inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setItemModalVisible(true);
  };

  const handleEditItem = (item: UniformStockItem) => {
    setEditingItem(item);
    setItemModalVisible(true);
  };

  const handleDeleteItem = (key: string) => {
    setStockItems(prev => prev.filter(item => item.key !== key));
  };

  const handleItemModalOk = (values: { prendaUniformeId: number; cantidad: number }) => {
    const selectedUniformItem = availableUniformItems.find(item => item.prendaUniformeId === values.prendaUniformeId);
    
    if (!selectedUniformItem) {
      message.error('Elemento de uniforme no encontrado');
      return;
    }

    const cantidad = values.cantidad || 0;
    const precioUnitario = selectedUniformItem.prendaUniformePrecio;
    const subtotal = cantidad * precioUnitario;

    const newItem: UniformStockItem = {
      key: editingItem ? editingItem.key : `item_${Date.now()}`,
      prendaUniformeId: selectedUniformItem.prendaUniformeId,
      descripcion: selectedUniformItem.prendaUniformeDescripcion,
      sexo: selectedUniformItem.prendaUniformeSexo,
      talla: selectedUniformItem.prendaUniformeTalla,
      precioUnitario,
      cantidad,
      subtotal
    };

    if (editingItem) {
      setStockItems(prev => prev.map(item => item.key === editingItem.key ? newItem : item));
    } else {
      // Check if item already exists
      const existingItem = stockItems.find(item => item.prendaUniformeId === newItem.prendaUniformeId);
      if (existingItem) {
        message.warning('Este elemento ya está agregado. Puede editarlo en la tabla.');
        return;
      }
      setStockItems(prev => [...prev, newItem]);
    }

    setItemModalVisible(false);
  };

  const handleSubmit = async (values: { fechaEntrada: dayjs.Dayjs; notas?: string }) => {
    if (stockItems.length === 0) {
      message.error('Debe agregar al menos un elemento al inventario');
      return;
    }

    try {
      setLoading(true);
      
      const entradaData: EntradaUniformeCreate = {
        fechaEntrada: values.fechaEntrada.format('YYYY-MM-DD'),
        notas: values.notas || undefined,
        detalles: stockItems.map(item => ({
          prendaUniformeId: item.prendaUniformeId,
          cantidad: item.cantidad,
          subtotal: item.subtotal
        }))
      };

      const userId = getCurrentUserId();
      await entradaUniformeService.createEntradaUniforme(entradaData, userId);
      
      message.success('Entrada de inventario registrada exitosamente');
      form.resetFields();
      setStockItems([]);
      setTotalAmount(0);
      loadStockEntries();
    } catch (error) {
      console.error('Error creating stock entry:', error);
      message.error('Error al registrar la entrada de inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setStockItems([]);
    setTotalAmount(0);
  };

  const handleViewDetails = (entry: EntradaUniforme) => {
    setSelectedEntry(entry);
    setEntryDetailsModalVisible(true);
  };

  const stockItemColumns = [
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
    },
    {
      title: 'Sexo',
      dataIndex: 'sexo',
      key: 'sexo',
      render: (sexo: string) => (
        <Tag color={sexo === 'M' ? 'blue' : sexo === 'F' ? 'pink' : 'default'}>
          {sexo === 'M' ? 'Masculino' : sexo === 'F' ? 'Femenino' : 'Unisex'}
        </Tag>
      ),
    },
    {
      title: 'Talla',
      dataIndex: 'talla',
      key: 'talla',
    },
    {
      title: 'Precio Unitario',
      dataIndex: 'precioUnitario',
      key: 'precioUnitario',
      render: (precio: number) => `Q${precio.toFixed(2)}`,
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (subtotal: number) => `Q${subtotal.toFixed(2)}`,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: unknown, record: UniformStockItem) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditItem(record)}
            size="small"
          />
          <Popconfirm
            title="¿Está seguro de eliminar este elemento?"
            onConfirm={() => handleDeleteItem(record.key)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stockEntriesColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Fecha',
      dataIndex: 'fechaEntrada',
      key: 'fechaEntrada',
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY'),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `Q${total.toFixed(2)}`,
    },
    {
      title: 'Elementos',
      dataIndex: 'entradaUniformeDetalles',
      key: 'elementos',
      render: (detalles: EntradaUniformeDetalle[]) => detalles?.length || 0,
    },
    {
      title: 'Notas',
      dataIndex: 'notas',
      key: 'notas',
      render: (notas: string) => notas || '-',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: unknown, record: EntradaUniforme) => (
        <Button
          type="link"
          onClick={() => handleViewDetails(record)}
        >
          Ver detalles
        </Button>
      ),
    },
  ];

  return (
    <div className="uniform-inventory">
      <Title level={2}>Inventario de Uniformes</Title>
      
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="Nueva Entrada de Inventario" className="inventory-form-card">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="fechaEntrada"
                    label="Fecha de Entrada"
                    rules={[{ required: true, message: 'La fecha es requerida' }]}
                    initialValue={dayjs()}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item
                    name="notas"
                    label="Notas (Opcional)"
                  >
                    <TextArea
                      rows={2}
                      placeholder="Observaciones sobre esta entrada de inventario..."
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={18}>
                  <Title level={4}>Elementos del Inventario</Title>
                </Col>
                <Col span={6} style={{ textAlign: 'right' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddItem}
                  >
                    Agregar Elemento
                  </Button>
                </Col>
              </Row>

              <Table
                dataSource={stockItems}
                columns={stockItemColumns}
                pagination={false}
                size="small"
                bordered
              />

              <Row justify="end" style={{ marginTop: 16 }}>
                <Col>
                  <Title level={3} style={{ margin: 0 }}>
                    Total: Q{totalAmount.toFixed(2)}
                  </Title>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: 24 }}>
                <Col>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    disabled={stockItems.length === 0}
                  >
                    Registrar Entrada
                  </Button>
                </Col>
                <Col>
                  <Button
                    type="default"
                    onClick={handleReset}
                    icon={<ClearOutlined />}
                  >
                    Limpiar
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Historial de Entradas" className="inventory-history-card">
            <Table
              dataSource={stockEntries}
              columns={stockEntriesColumns}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} entradas`,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Item Modal */}
      <Modal
        title={editingItem ? "Editar Elemento" : "Agregar Elemento"}
        open={itemModalVisible}
        onCancel={() => setItemModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          onFinish={handleItemModalOk}
          initialValues={editingItem ? {
            prendaUniformeId: editingItem.prendaUniformeId,
            cantidad: editingItem.cantidad
          } : undefined}
        >
          <Form.Item
            name="prendaUniformeId"
            label="Elemento de Uniforme"
            rules={[{ required: true, message: 'Seleccione un elemento' }]}
          >
            <Select
              placeholder="Seleccione un elemento de uniforme"
              showSearch
              optionFilterProp="children"
              disabled={!!editingItem}
            >
              {availableUniformItems.map(item => (
                <Option key={item.prendaUniformeId} value={item.prendaUniformeId}>
                  {item.prendaUniformeDescripcion} - {item.prendaUniformeSexo} - {item.prendaUniformeTalla} - Q{item.prendaUniformePrecio.toFixed(2)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="cantidad"
            label="Cantidad"
            rules={[
              { required: true, message: 'La cantidad es requerida' },
              { type: 'number', min: 1, message: 'La cantidad debe ser mayor a 0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Ingrese la cantidad"
              min={1}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setItemModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                {editingItem ? 'Actualizar' : 'Agregar'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Entry Details Modal */}
      <Modal
        title={`Detalles de Entrada #${selectedEntry?.id}`}
        open={entryDetailsModalVisible}
        onCancel={() => setEntryDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setEntryDetailsModalVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {selectedEntry && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <strong>Fecha:</strong> {dayjs(selectedEntry.fechaEntrada).format('DD/MM/YYYY')}
              </Col>
              <Col span={8}>
                <strong>Total:</strong> Q{selectedEntry.total.toFixed(2)}
              </Col>
              <Col span={8}>
                <strong>Elementos:</strong> {selectedEntry.entradaUniformeDetalles?.length || 0}
              </Col>
            </Row>
            
            {selectedEntry.notas && (
              <Row style={{ marginBottom: 16 }}>
                <Col span={24}>
                  <strong>Notas:</strong> {selectedEntry.notas}
                </Col>
              </Row>
            )}

            <Table
              dataSource={selectedEntry.entradaUniformeDetalles?.map((detalle: EntradaUniformeDetalle, index: number) => ({
                ...detalle,
                key: index
              }))}
              columns={[
                {
                  title: 'Descripción',
                  dataIndex: 'prendaUniformeDescripcion',
                  key: 'descripcion',
                },
                {
                  title: 'Sexo',
                  dataIndex: 'prendaUniformeSexo',
                  key: 'sexo',
                  render: (sexo: string) => (
                    <Tag color={sexo === 'M' ? 'blue' : sexo === 'F' ? 'pink' : 'default'}>
                      {sexo === 'M' ? 'Masculino' : sexo === 'F' ? 'Femenino' : 'Unisex'}
                    </Tag>
                  ),
                },
                {
                  title: 'Talla',
                  dataIndex: 'prendaUniformeTalla',
                  key: 'talla',
                },
                {
                  title: 'Precio Unit.',
                  dataIndex: 'prendaUniformePrecio',
                  key: 'precio',
                  render: (precio: number) => `Q${precio.toFixed(2)}`,
                },
                {
                  title: 'Cantidad',
                  dataIndex: 'cantidad',
                  key: 'cantidad',
                },
                {
                  title: 'Subtotal',
                  dataIndex: 'subtotal',
                  key: 'subtotal',
                  render: (subtotal: number) => `Q${subtotal.toFixed(2)}`,
                },
              ]}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UniformInventory;
