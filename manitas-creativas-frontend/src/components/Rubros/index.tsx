import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, Select, DatePicker, InputNumber, Switch, Modal, Space, Typography, Popconfirm, message, Card, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import './Rubros.css';
import dayjs from 'dayjs';
import { rubroService, Rubro } from '../../services/rubroService';
import { nivelEducativoService, NivelEducativo } from '../../services/nivelEducativoService';
import { gradoService, Grado } from '../../services/gradoService';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Enum TipoRubro representation
const tipoRubroOptions = [
  { value: 0, label: 'Colegiatura' },
  { value: 1, label: 'Inscripción' },
  { value: 2, label: 'Material' },
  { value: 3, label: 'Uniformes' },
  { value: 4, label: 'Laboratorio' },
  { value: 5, label: 'Cuota Única' },
  { value: 6, label: 'Útiles' },
  { value: 7, label: 'Libros' },
  { value: 8, label: 'Transporte' },
  { value: 9, label: 'Otros' },
];

const Rubros: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [data, setData] = useState<Rubro[]>([]);
  const [filteredData, setFilteredData] = useState<Rubro[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nivelesEducativos, setNivelesEducativos] = useState<NivelEducativo[]>([]);
  const [loadingNivelesEducativos, setLoadingNivelesEducativos] = useState<boolean>(false);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [loadingGrados, setLoadingGrados] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedNivelEducativo, setSelectedNivelEducativo] = useState<number | null>(null);
  const [montoMin, setMontoMin] = useState<number | null>(null);
  const [montoMax, setMontoMax] = useState<number | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      await fetchNivelesEducativos();
      await fetchRubros();
    };
    
    loadData();
  }, []);

  // Apply filters when data or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [data, searchText, selectedNivelEducativo, montoMin, montoMax]);

  // Function to fetch rubros from API
  const fetchRubros = async () => {
    try {
      setFetchingData(true);
      const rubros = await rubroService.getAllRubros();
      // Sort the rubros alphabetically by descripcion by default
      const sortedRubros = [...rubros].sort((a, b) => 
        a.descripcion.localeCompare(b.descripcion)
      );
      setData(sortedRubros);
      setFilteredData(sortedRubros);
    } catch (error) {
      console.error('Error fetching rubros:', error);
      message.error('No se pudieron cargar los rubros');
    } finally {
      setFetchingData(false);
    }
  };

  // Function to apply filters to the data
  const applyFilters = () => {
    let filtered = [...data];
    
    // Filter by descripcion (case-insensitive)
    if (searchText) {
      filtered = filtered.filter(rubro => 
        rubro.descripcion.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Filter by nivel educativo
    if (selectedNivelEducativo) {
      filtered = filtered.filter(rubro => 
        rubro.nivelEducativoId === selectedNivelEducativo
      );
    }
    
    // Filter by monto min
    if (montoMin !== null) {
      filtered = filtered.filter(rubro => 
        rubro.montoPreestablecido !== undefined && rubro.montoPreestablecido >= montoMin
      );
    }
    
    // Filter by monto max
    if (montoMax !== null) {
      filtered = filtered.filter(rubro => 
        rubro.montoPreestablecido !== undefined && rubro.montoPreestablecido <= montoMax
      );
    }
    
    setFilteredData(filtered);
  };

  // Handle search form reset
  const handleReset = () => {
    searchForm.resetFields();
    setSearchText('');
    setSelectedNivelEducativo(null);
    setMontoMin(null);
    setMontoMax(null);
  };

  // Function to fetch niveles educativos from API
  const fetchNivelesEducativos = async () => {
    try {
      setLoadingNivelesEducativos(true);
      const nivelesData = await nivelEducativoService.getActiveNivelesEducativos();
      setNivelesEducativos(nivelesData);
    } catch (error) {
      console.error('Error fetching niveles educativos:', error);
      message.error('No se pudieron cargar los niveles educativos');
    } finally {
      setLoadingNivelesEducativos(false);
    }
  };

  // Function to fetch grados by nivel educativo id
  const fetchGradosByNivelEducativo = async (nivelEducativoId: number) => {
    if (!nivelEducativoId) {
      setGrados([]);
      return;
    }
    
    try {
      console.log('Fetching grados for nivel educativo ID:', nivelEducativoId);
      setLoadingGrados(true);
      const gradosData = await gradoService.getGradosByNivelEducativoId(nivelEducativoId);
      console.log('Grados fetched successfully:', gradosData);
      setGrados(gradosData);
    } catch (error) {
      console.error('Error fetching grados:', error);
      message.error('No se pudieron cargar los grados');
    } finally {
      setLoadingGrados(false);
    }
  };

  // Helper function to get nivel educativo name by id
  const getNivelEducativoName = (id: number | undefined): string => {
    if (!id) return '-';
    const nivel = nivelesEducativos.find(nivel => nivel.id === id);
    return nivel ? nivel.nombre : `ID: ${id}`;
  };

  // Columns for the table
  const columns = [    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      width: 70,
      sorter: (a: Rubro, b: Rubro) => a.descripcion.localeCompare(b.descripcion),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: 'Nivel Educativo',
      dataIndex: 'nivelEducativoId',
      key: 'nivelEducativoId',
      width: 15, // Reduced by 50% from 30px
      ellipsis: true,
      render: (id: number | undefined) => getNivelEducativoName(id),
      sorter: (a: Rubro, b: Rubro) => {
        const nameA = getNivelEducativoName(a.nivelEducativoId) || '';
        const nameB = getNivelEducativoName(b.nivelEducativoId) || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Monto',      dataIndex: 'montoPreestablecido',
      key: 'montoPreestablecido',
      width: 35,
      align: 'right' as const,
      render: (value: number | undefined) => value ? `Q${value.toFixed(2)}` : '-',
      sorter: (a: Rubro, b: Rubro) => {
        const montoA = a.montoPreestablecido || 0;
        const montoB = b.montoPreestablecido || 0;
        return montoA - montoB;
      },
    },    {
      title: 'Acciones',
      key: 'actions',
      width: 50,
      align: 'center' as const,
      render: (_: unknown, record: Rubro) => (
        <Space size={0} style={{ display: 'flex', justifyContent: 'center' }}>
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
                <p>¿Está seguro de eliminar este rubro?</p>
                <p style={{ fontSize: '12px', color: '#ff4d4f' }}>
                  ADVERTENCIA: Si hay pagos asociados a este rubro, no se podrá eliminar.
                </p>
              </div>
            }
            onConfirm={() => handleDelete(record.id)}
            okText="Sí, eliminar"
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
      ),
    },
  ];

  // Render the search panel
  const renderSearchPanel = () => {
    return (
      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item label="Descripción">
                <Input 
                  placeholder="Buscar por descripción" 
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item label="Nivel Educativo">
                <Select 
                  placeholder="Filtrar por nivel educativo"
                  value={selectedNivelEducativo}
                  onChange={(value) => setSelectedNivelEducativo(value)}
                  loading={loadingNivelesEducativos}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {nivelesEducativos.map(nivel => (
                    <Option key={nivel.id} value={nivel.id}>{nivel.nombre}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item label="Monto (Q)">
                <Space>
                  <InputNumber
                    placeholder="Desde"
                    style={{ width: 125 }}
                    value={montoMin}
                    onChange={(value) => setMontoMin(value)}
                    min={0}
                    step={50}
                    prefix="Q"
                    controls={false}
                  />
                  <span>a</span>
                  <InputNumber
                    placeholder="Hasta"
                    style={{ width: 125 }}
                    value={montoMax}
                    onChange={(value) => setMontoMax(value)}
                    min={montoMin || 0}
                    step={50}
                    prefix="Q"
                    controls={false}
                  />
                </Space>
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
  const handleEdit = (record: Rubro) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      fechaLimitePagoAmarillo: record.fechaLimitePagoAmarillo ? dayjs(record.fechaLimitePagoAmarillo) : undefined,
      fechaLimitePagoRojo: record.fechaLimitePagoRojo ? dayjs(record.fechaLimitePagoRojo) : undefined,
      fechaInicioPromocion: record.fechaInicioPromocion ? dayjs(record.fechaInicioPromocion) : undefined,
      fechaFinPromocion: record.fechaFinPromocion ? dayjs(record.fechaFinPromocion) : undefined,
    });
    
    // Fetch grados if a nivel educativo is specified
    if (record.nivelEducativoId) {
      fetchGradosByNivelEducativo(record.nivelEducativoId);
    }
    
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      
      // First check if the rubro can be deleted
      const canDelete = await rubroService.canDeleteRubro(id);
      
      if (!canDelete) {
        message.error('No se puede eliminar el rubro porque tiene pagos asociados');
        return;
      }
      
      // If it can be deleted, proceed with deletion
      await rubroService.deleteRubro(id);
      setData(data.filter(item => item.id !== id));
      message.success('Rubro eliminado con éxito');
    } catch (error) {
      console.error('Error al eliminar el rubro:', error);
      message.error('Error al eliminar el rubro');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ activo: true });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Transform dates to string format
      const formattedValues = {
        ...values,
        fechaLimitePagoAmarillo: values.fechaLimitePagoAmarillo ? values.fechaLimitePagoAmarillo.format('YYYY-MM-DD') : undefined,
        fechaLimitePagoRojo: values.fechaLimitePagoRojo ? values.fechaLimitePagoRojo.format('YYYY-MM-DD') : undefined,
        fechaInicioPromocion: values.fechaInicioPromocion ? values.fechaInicioPromocion.format('YYYY-MM-DD') : undefined,
        fechaFinPromocion: values.fechaFinPromocion ? values.fechaFinPromocion.format('YYYY-MM-DD') : undefined,
      };

      if (editingId === null) {
        // Add new rubro
        const newRubro = await rubroService.createRubro(formattedValues);
        setData([...data, newRubro]);
        message.success('Rubro creado con éxito');
      } else {
        // Update existing rubro
        await rubroService.updateRubro(editingId, { ...formattedValues, id: editingId });
        
        // Refresh the data to get the updated version
        await fetchRubros();
        message.success('Rubro actualizado con éxito');
      }

      setModalVisible(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      message.error('Error al guardar el rubro');
    } finally {
      setLoading(false);
    }
  };

  // Conditional fields based on selected tipo
  const renderConditionalFields = () => {
    const tipoValue = form.getFieldValue('tipo');
    
    return (
      <>
        <Form.Item
          label="Nivel Educativo"
          name="nivelEducativoId"
        >
          <Select 
            placeholder="Seleccione el nivel educativo"
            loading={loadingNivelesEducativos}
            allowClear
            showSearch
            optionFilterProp="children"
            onChange={(value) => {
              if (value) {
                fetchGradosByNivelEducativo(value as number);
                // Clear the grado value when nivel educativo changes
                form.setFieldsValue({ gradoId: undefined });
              } else {
                setGrados([]);
                form.setFieldsValue({ gradoId: undefined });
              }            }}
            filterOption={(input, option) => 
              option?.label ? option.label.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0 : false
            }
          >
            {nivelesEducativos.map(nivel => (
              <Option key={nivel.id} value={nivel.id}>{nivel.nombre}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          label="Grado"
          name="gradoId"
        >
          <Select
            placeholder="Seleccione el grado"
            loading={loadingGrados}
            disabled={form.getFieldValue('nivelEducativoId') === undefined || loadingGrados}            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => 
              option?.label ? option.label.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0 : false
            }
          >
            {grados.map(grado => (
              <Option key={grado.id} value={grado.id}>{grado.nombre}</Option>
            ))}
          </Select>
        </Form.Item>
        
        {tipoValue === 0 && ( // Only show for Colegiatura
          <>
            <Form.Item
              label="Ciclo Escolar"
              name="cicloEscolar"
            >
              <InputNumber 
                placeholder="Año del ciclo escolar" 
                min={2020}
                max={2100}
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Form.Item
              label="Día Límite Amarillo"
              name="diaLimitePagoAmarillo"
            >
              <InputNumber 
                placeholder="Día límite de aviso" 
                min={1}
                max={31}
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Form.Item
              label="Día Límite Rojo"
              name="diaLimitePagoRojo"
            >
              <InputNumber 
                placeholder="Día límite de mora" 
                min={1}
                max={31}
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Form.Item
              label="Mes Límite de Pago"
              name="mesLimitePago"
            >
              <Select placeholder="Seleccione el mes límite">
                <Option value={1}>Enero</Option>
                <Option value={2}>Febrero</Option>
                <Option value={3}>Marzo</Option>
                <Option value={4}>Abril</Option>
                <Option value={5}>Mayo</Option>
                <Option value={6}>Junio</Option>
                <Option value={7}>Julio</Option>
                <Option value={8}>Agosto</Option>
                <Option value={9}>Septiembre</Option>
                <Option value={10}>Octubre</Option>
                <Option value={11}>Noviembre</Option>
                <Option value={12}>Diciembre</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              label="Penalización por Mora (Monto)"
              name="penalizacionPorMoraMonto"
            >
              <InputNumber 
                placeholder="Monto de penalización" 
                prefix="Q" 
                step={10}
                min={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Form.Item
              label="Penalización por Mora (%)"
              name="penalizacionPorMoraPorcentaje"
            >
              <InputNumber 
                placeholder="Porcentaje de penalización" 
                step={0.5}
                min={0}
                max={100}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        )}
        
        <Form.Item
          label="Notas"
          name="notas"
        >
          <TextArea 
            placeholder="Notas adicionales" 
            rows={3}
            maxLength={500}
          />
        </Form.Item>
      </>
    );
  };

  return (
    <div className="rubros-container">
      <div className="rubros-header">
        <Title level={2}>Gestión de Rubros</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            Nuevo Rubro
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchRubros}
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
        scroll={{ x: 170 }}
        size="small"
      />

      <Modal
        title={editingId === null ? 'Crear Nuevo Rubro' : 'Editar Rubro'}
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
          name="rubroForm"
          initialValues={{ activo: true }}
        >
          <Form.Item
            label="Descripción"
            name="descripcion"
            rules={[{ required: true, message: 'Por favor ingrese la descripción!' }]}
          >
            <Input placeholder="Ingrese la descripción del rubro" />
          </Form.Item>

          <Form.Item
            label="Tipo de Rubro"
            name="tipo"
            rules={[{ required: true, message: 'Por favor seleccione el tipo!' }]}
          >
            <Select 
              placeholder="Seleccione el tipo de rubro"
            >
              {tipoRubroOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Monto Preestablecido"
            name="montoPreestablecido"
            rules={[{ required: true, message: 'Por favor ingrese el monto!' }]}
          >
            <InputNumber 
              placeholder="Ingrese el monto" 
              prefix="Q" 
              step={100}
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>
            <Form.Item 
            label="Es Colegiatura" 
            name="esColegiatura" 
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Sí" 
              unCheckedChildren="No" 
            />
          </Form.Item>
          
          <Form.Item 
            label="Es Pago de Carnet" 
            name="esPagoDeCarnet" 
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Sí" 
              unCheckedChildren="No" 
            />
          </Form.Item>

          <Form.Item
            label="Fecha Límite Amarilla"
            name="fechaLimitePagoAmarillo"
          >
            <DatePicker 
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              placeholder="Fecha límite de aviso"
            />
          </Form.Item>
          
          <Form.Item
            label="Fecha Límite Roja"
            name="fechaLimitePagoRojo"
          >
            <DatePicker 
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              placeholder="Fecha límite de mora"
            />
          </Form.Item>
          
          <Form.Item
            label="Promoción - Fecha Inicio"
            name="fechaInicioPromocion"
          >
            <DatePicker 
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              placeholder="Fecha inicio de promoción"
            />
          </Form.Item>
          
          <Form.Item
            label="Promoción - Fecha Fin"
            name="fechaFinPromocion"
          >
            <DatePicker 
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              placeholder="Fecha fin de promoción"
            />
          </Form.Item>

          {renderConditionalFields()}

          <Form.Item
            label="Activo"
            name="activo"
            valuePropName="checked"
          >
            <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
          </Form.Item>

          {editingId !== null && (
            <div className="audit-info">
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

export default Rubros;