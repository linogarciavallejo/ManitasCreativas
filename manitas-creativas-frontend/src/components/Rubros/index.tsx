import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, Select, DatePicker, InputNumber, Switch, Modal, Space, Typography, Popconfirm, message, Tooltip, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
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
  { value: 3, label: 'Uniforme' },
  { value: 4, label: 'Laboratorio' },
  { value: 5, label: 'Otro' },
];

const Rubros: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<Rubro[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nivelesEducativos, setNivelesEducativos] = useState<NivelEducativo[]>([]);
  const [loadingNivelesEducativos, setLoadingNivelesEducativos] = useState<boolean>(false);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [loadingGrados, setLoadingGrados] = useState<boolean>(false);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      await fetchNivelesEducativos();
      await fetchRubros();
    };
    
    loadData();
  }, []);

  // Function to fetch rubros from API
  const fetchRubros = async () => {
    try {
      setFetchingData(true);
      const rubros = await rubroService.getAllRubros();
      setData(rubros);
    } catch (error) {
      console.error('Error fetching rubros:', error);
      message.error('No se pudieron cargar los rubros');
    } finally {
      setFetchingData(false);
    }
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

  // Helper function to get grado name by id
  const getGradoName = (id: number | undefined): string => {
    if (!id) return '-';
    const grado = grados.find(grado => grado.id === id);
    return grado ? grado.nombre : `ID: ${id}`;
  };

  // Columns for the table
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo: number) => tipoRubroOptions.find(option => option.value === tipo)?.label || 'Desconocido',
    },
    {
      title: 'Nivel Educativo',
      dataIndex: 'nivelEducativoId',
      key: 'nivelEducativoId',
      render: (id: number | undefined) => getNivelEducativoName(id),
    },
    {
      title: 'Grado',
      dataIndex: 'gradoId',
      key: 'gradoId',
      render: (id: number | undefined, record: Rubro) => record.gradoNombre || getGradoName(id) || (id ? `ID: ${id}` : '-'),
    },
    {
      title: 'Monto',
      dataIndex: 'montoPreestablecido',
      key: 'montoPreestablecido',
      render: (value: number | undefined) => value ? `Q${value.toFixed(2)}` : '-',
    },
    {
      title: 'Fecha Límite Amarilla',
      dataIndex: 'fechaLimitePagoAmarillo',
      key: 'fechaLimitePagoAmarillo',
      render: (date: string | undefined) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Fecha Límite Roja',
      dataIndex: 'fechaLimitePagoRojo',
      key: 'fechaLimitePagoRojo',
      render: (date: string | undefined) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Día Límite Amarillo',
      dataIndex: 'diaLimitePagoAmarillo',
      key: 'diaLimitePagoAmarillo',
      render: (value: number | undefined) => value || '-',
    },
    {
      title: 'Día Límite Rojo',
      dataIndex: 'diaLimitePagoRojo',
      key: 'diaLimitePagoRojo',
      render: (value: number | undefined) => value || '-',
    },
    {
      title: 'Mes Límite',
      dataIndex: 'mesLimitePago',
      key: 'mesLimitePago',
      render: (value: number | undefined) => {
        if (!value) return '-';
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return months[value - 1];
      },
    },
    {
      title: 'Mora Monto',
      dataIndex: 'penalizacionPorMoraMonto',
      key: 'penalizacionPorMoraMonto',
      render: (value: number | undefined) => value ? `Q${value.toFixed(2)}` : '-',
    },
    {
      title: 'Mora %',
      dataIndex: 'penalizacionPorMoraPorcentaje',
      key: 'penalizacionPorMoraPorcentaje',
      render: (value: number | undefined) => value ? `${value}%` : '-',
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo: boolean) => (
        <Tag color={activo ? 'green' : 'red'}>
          {activo ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Información',
      key: 'audit',
      render: (_: any, record: Rubro) => (
        <Tooltip title={
          <div>
            <p><strong>Creado:</strong> {dayjs(record.fechaCreacion).format('DD/MM/YYYY HH:mm')}</p>
            <p><strong>Por:</strong> {record.usuarioCreacion}</p>
            {record.fechaActualizacion && (
              <>
                <p><strong>Actualizado:</strong> {dayjs(record.fechaActualizacion).format('DD/MM/YYYY HH:mm')}</p>
                <p><strong>Por:</strong> {record.usuarioActualizacion}</p>
              </>
            )}
          </div>
        }>
          <Button icon={<InfoCircleOutlined />} type="text" />
        </Tooltip>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Rubro) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
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
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (record: Rubro) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      fechaLimitePagoAmarillo: record.fechaLimitePagoAmarillo ? dayjs(record.fechaLimitePagoAmarillo) : undefined,
      fechaLimitePagoRojo: record.fechaLimitePagoRojo ? dayjs(record.fechaLimitePagoRojo) : undefined,
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
        {tipoValue === 0 && ( // Only show for Colegiatura
          <>
            <Form.Item
              label="Mes de Colegiatura"
              name="mesColegiatura"
            >
              <Select placeholder="Seleccione el mes">
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
              }
            }}
            filterOption={(input, option) => 
              option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
            disabled={form.getFieldValue('nivelEducativoId') === undefined || loadingGrados}
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => 
              option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {grados.map(grado => (
              <Option key={grado.id} value={grado.id}>{grado.nombre}</Option>
            ))}
          </Select>
        </Form.Item>
        
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

      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
        loading={fetchingData}
        scroll={{ x: 1500 }}
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
              onChange={() => form.validateFields(['mesColegiatura'])} // Re-validate month when type changes
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