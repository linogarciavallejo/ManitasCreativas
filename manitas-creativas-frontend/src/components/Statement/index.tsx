import React, { useState, useEffect } from 'react';
import { 
  Typography, Space, Card, Row, Col, Table, AutoComplete, 
  Button, Divider, Spin, List, Descriptions, Tag, Empty, Input,
  Image, Modal, Badge
} from 'antd';
import type { TableColumnsType } from 'antd';
import { 
  FilePdfOutlined, PrinterOutlined, FileExcelOutlined,
  SearchOutlined, EyeOutlined, WarningOutlined, ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { fetchAlumnoStatement } from '../../services/statementService';
import { makeApiRequest } from '../../services/apiHelper';
import { PagoReadDto, AlumnoSimpleDto, AlumnoDto, PagoImagenDto } from '../../types/payment';

const { Title, Text } = Typography;
const { Search } = Input;

const Statement: React.FC = () => {  const [alumnos, setAlumnos] = useState<AlumnoSimpleDto[]>([]);
  const [selectedAlumno, setSelectedAlumno] = useState<AlumnoSimpleDto | null>(null);
  const [alumnoDetails, setAlumnoDetails] = useState<AlumnoDto | null>(null);
  const [statements, setStatements] = useState<PagoReadDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<{value: string, label: string}[]>([]);
  const isMobile = window.innerWidth < 768; // Simple mobile detection
  const [selectedImages, setSelectedImages] = useState<PagoImagenDto[]>([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // Fetch all alumnos on component mount
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const data = await makeApiRequest<AlumnoSimpleDto[]>('/alumnos/full', 'GET');
        setAlumnos(data);
        // We don't pre-populate options anymore, to match the OtherPayments behavior
      } catch (error) {
        console.error('Error fetching alumnos:', error);
      }
    };

    fetchAlumnos();
  }, []);

  // Fetch alumno details and statement when an alumno is selected
  useEffect(() => {
    const fetchAlumnoData = async () => {
      if (!selectedAlumno) return;

      setLoading(true);
      try {
        // Fetch alumno details
        const details = await makeApiRequest<AlumnoDto>(`/alumnos/codigo/${selectedAlumno.codigo}`, 'GET');
        setAlumnoDetails(details);

        // Fetch statement data
        const statement = await fetchAlumnoStatement(details.id);
        // Use data in its original order from API (already sorted by fecha ascending)
        setStatements(statement);
      } catch (error) {
        console.error('Error fetching alumno data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedAlumno) {
      fetchAlumnoData();
    }
  }, [selectedAlumno]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-GT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handleExportPDF = () => {
    console.log('Export to PDF not yet implemented');
    // Will implement PDF export logic later
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    console.log('Export to Excel not yet implemented');
    // Will implement Excel export logic later
  };

  // Search by code functionality
  const handleCodigoSearch = async (codigo: string) => {
    if (!codigo) return;
    
    setLoading(true);
    try {
      const alumno = await makeApiRequest<AlumnoDto>(`/alumnos/codigo/${codigo}`, 'GET');
      
      if (alumno) {
        setAlumnoDetails(alumno);
        // Create a simple alumno object to store as selectedAlumno
        const simpleAlumno: AlumnoSimpleDto = {
          id: alumno.id,
          codigo: alumno.codigo,
          fullName: `${alumno.primerNombre} ${alumno.segundoNombre} ${alumno.primerApellido} ${alumno.segundoApellido}`.trim()
        };
        setSelectedAlumno(simpleAlumno);
        
        // Fetch statement data
        const statement = await fetchAlumnoStatement(alumno.id);
        // Sort by date (newest first)
        setStatements(statement.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        ));
      }
    } catch (error) {
      console.error('Error searching by code:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSelect = (value: string) => {
    const selectedText = value;
    const selected = alumnos.find(alumno => 
      alumno.fullName === selectedText || `${alumno.fullName} (${alumno.codigo})` === selectedText
    );
    
    if (selected) {
      setSelectedAlumno(selected);
    }
  };
  const onSearch = (searchText: string) => {
    // If search text is empty, don't show any options
    if (!searchText) {
      setOptions([]);
      return;
    }
    
    const filtered = alumnos
      .filter(alumno => 
        alumno.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        alumno.codigo.toLowerCase().includes(searchText.toLowerCase())
      )
      .map(alumno => ({
        value: alumno.fullName,
        label: `${alumno.fullName} (${alumno.codigo})`
      }));
    
    setOptions(filtered);
  };

  // Handle viewing payment images
  const handleViewImages = (images: PagoImagenDto[]) => {
    setSelectedImages(images);
    setImageModalVisible(true);
  };

  // Helper function to determine payment status based on due date rules
  const getPaymentStatus = (payment: PagoReadDto): { status: 'ontime' | 'late' | 'verylate', daysPastDue: number | null } => {
    // Only apply to tuition payments (rubroId = 1)
    if (payment.rubroId !== 1 || !payment.mesColegiatura || !payment.anioColegiatura) {
      return { status: 'ontime', daysPastDue: null };
    }

    const paymentDate = new Date(payment.fecha);
    const dueDate = new Date(payment.anioColegiatura, payment.mesColegiatura - 1, 5); // Due on 5th of the month
    const lateDate = new Date(payment.anioColegiatura, payment.mesColegiatura - 1, 15); // Very late after 15th

    // Calculate days past due
    const daysPastDue = paymentDate > dueDate ? 
      Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    if (paymentDate > lateDate) {
      return { status: 'verylate', daysPastDue };
    } else if (paymentDate > dueDate) {
      return { status: 'late', daysPastDue };
    }
    return { status: 'ontime', daysPastDue: null };
  };

  // Table columns configuration
  const columns: TableColumnsType<PagoReadDto> = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (text: string) => formatDate(text)
    },
    {
      title: 'Descripción',
      dataIndex: 'rubroDescripcion',
      key: 'rubroDescripcion',
      render: (_: string, record: PagoReadDto) => (
        <span>
          {record.rubroDescripcion}
          {record.esColegiatura && record.mesColegiatura && record.anioColegiatura && (
            ` (${record.mesColegiatura}/${record.anioColegiatura})`
          )}
        </span>
      )
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      render: (amount: number) => {
        return <Text strong>{formatCurrency(amount)}</Text>;
      },      
      align: 'right' as const
    },
    {
      title: 'Forma de Pago',
      dataIndex: 'medioPagoDescripcion',
      key: 'medioPagoDescripcion'
    },
    {
      title: 'Usuario',
      dataIndex: 'usuarioNombre',
      key: 'usuarioNombre',
      responsive: ['md']
    },
    {
      title: 'Imágenes',
      key: 'imagenesPago',
      render: (_: any, record: PagoReadDto) => (
        record.imagenesPago && record.imagenesPago.length > 0 ? (
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewImages(record.imagenesPago)}
          >
            Ver {record.imagenesPago.length} {record.imagenesPago.length === 1 ? 'imagen' : 'imágenes'}
          </Button>
        ) : 'Sin imágenes'
      ),
      responsive: ['md']
    },
    {
      title: 'Notas',
      dataIndex: 'notas',
      key: 'notas',
      responsive: ['lg']
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Estado de Cuenta</Title>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Search
              placeholder="Buscar por Código"
              allowClear
              enterButton={<Button type="primary" icon={<SearchOutlined />}>Buscar</Button>}
              size="large"
              onSearch={handleCodigoSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={12}>
            <AutoComplete
              style={{ width: '100%' }}
              options={options}
              onSelect={onSelect}
              onSearch={onSearch}
              placeholder="Buscar por Nombre o Apellido"
              size="large"
              notFoundContent="No se encontraron estudiantes"
            />
          </Col>
        </Row>

        {alumnoDetails && (
          <>
            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
              <Col xs={24} sm={12}>
                <Card title="Información del Estudiante" type="inner">
                  <Descriptions column={1}>
                    <Descriptions.Item label="Código">{alumnoDetails.codigo}</Descriptions.Item>
                    <Descriptions.Item label="Nombre">
                      {alumnoDetails.primerNombre} {alumnoDetails.segundoNombre} {alumnoDetails.primerApellido} {alumnoDetails.segundoApellido}
                    </Descriptions.Item>
                    <Descriptions.Item label="Sede">{alumnoDetails.sedeNombre}</Descriptions.Item>
                    <Descriptions.Item label="Grado">{alumnoDetails.gradoNombre}</Descriptions.Item>
                    {alumnoDetails.becado && (
                      <Descriptions.Item label="Beca">
                        <Tag color="green">{alumnoDetails.becaParcialPorcentaje}%</Tag>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </Col>

              <Col xs={24} sm={12}>
                <Card title="Información de Contacto" type="inner">
                  {!alumnoDetails.contactos || alumnoDetails.contactos.length === 0 ? (
                    <Empty description="No hay información de contacto disponible" />
                  ) : (
                    <List
                      itemLayout="vertical"
                      dataSource={alumnoDetails.contactos}
                      renderItem={contact => (
                        <List.Item>
                          <List.Item.Meta
                            title={`${contact.contacto.nombre} (${contact.parentesco})`}
                            description={
                              <Space direction="vertical">
                                <Text>Tel: {contact.contacto.telefono}</Text>
                                {contact.contacto.email && <Text>Email: {contact.contacto.email}</Text>}
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </Card>
              </Col>
            </Row>

            <div style={{ margin: '24px 0' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                flexWrap: 'wrap',
                marginBottom: '16px'
              }}>
                <Title level={4} style={{ margin: 0 }}>Historial de Pagos</Title>
                <Space>
                  <Button 
                    icon={<FilePdfOutlined />}
                    onClick={handleExportPDF}
                    size={isMobile ? "small" : "middle"}
                  >
                    {isMobile ? "PDF" : "Exportar PDF"}
                  </Button>
                  <Button 
                    icon={<FileExcelOutlined />}
                    onClick={handleExportExcel}
                    size={isMobile ? "small" : "middle"}
                  >
                    {isMobile ? "Excel" : "Exportar Excel"}
                  </Button>
                  <Button 
                    icon={<PrinterOutlined />}
                    onClick={handlePrint}
                    size={isMobile ? "small" : "middle"}
                  >
                    {isMobile ? "Imprimir" : "Imprimir Estado"}
                  </Button>
                </Space>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <Space>
                  <Badge color="green" text={<><CheckCircleOutlined /> Pago a tiempo</>} />
                  <Badge color="gold" text={<><ClockCircleOutlined /> Pago con retraso (entre 6-15 días)</>} />
                  <Badge color="red" text={<><WarningOutlined /> Pago con retraso mayor (más de 15 días)</>} />
                </Space>
              </div>

              <Divider />

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                  <Spin size="large" />
                </div>
              ) : statements.length === 0 ? (
                <Empty description="No hay datos de pagos disponibles" />
              ) : (
                <>
                  {/* Table view for larger screens */}
                  <div className="desktop-table" style={{ display: isMobile ? 'none' : 'block' }}>
                    <Table 
                      dataSource={statements}
                      columns={columns}
                      rowKey="id"
                      pagination={statements.length > 10 ? { pageSize: 10 } : false}
                      onRow={(record) => {
                        const { status } = getPaymentStatus(record);
                        const style: React.CSSProperties = {};
                        
                        if (status === 'verylate') {
                          style.backgroundColor = '#ffccc7'; // Light red
                        } else if (status === 'late') {
                          style.backgroundColor = '#ffffb8'; // Light yellow
                        }
                        
                        return { style };
                      }}
                    />
                  </div>

                  {/* Card view for mobile */}
                  <div className="mobile-view" style={{ display: isMobile ? 'block' : 'none' }}>
                    <List
                      itemLayout="vertical"
                      dataSource={statements}
                      renderItem={payment => {
                        const { status, daysPastDue } = getPaymentStatus(payment);
                        const cardStyle: React.CSSProperties = { marginBottom: 8 };
                        
                        if (status === 'verylate') {
                          cardStyle.backgroundColor = '#ffccc7'; // Light red
                        } else if (status === 'late') {
                          cardStyle.backgroundColor = '#ffffb8'; // Light yellow
                        }
                        
                        return (
                          <List.Item>
                            <Card style={cardStyle}>
                              <Text strong>{payment.rubroDescripcion}</Text>
                              <div style={{ marginTop: 8 }}>
                                <Text type="success" style={{ fontSize: 18 }}>{formatCurrency(payment.monto)}</Text>
                                {payment.rubroId === 1 && status !== 'ontime' && (
                                  <Badge 
                                    style={{ marginLeft: 8 }}
                                    status={status === 'verylate' ? 'error' : 'warning'} 
                                    text={daysPastDue && daysPastDue > 0 ? `${daysPastDue} días tarde` : ''}
                                  />
                                )}
                              </div>
                              <div style={{ marginTop: 8 }}>
                                <Text type="secondary">Fecha: {formatDate(payment.fecha)}</Text>
                              </div>
                              <div>
                                <Text type="secondary">Forma de Pago: {payment.medioPagoDescripcion}</Text>
                              </div>
                              <div>
                                <Text type="secondary">Usuario: {payment.usuarioNombre}</Text>
                              </div>
                              {payment.esColegiatura && payment.mesColegiatura && payment.anioColegiatura && (
                                <div>
                                  <Text type="secondary">Periodo: {payment.mesColegiatura}/{payment.anioColegiatura}</Text>
                                </div>
                              )}
                              {payment.notas && (
                                <div style={{ marginTop: 8 }}>
                                  <Text type="secondary">Notas: {payment.notas}</Text>
                                </div>
                              )}
                              {payment.imagenesPago && payment.imagenesPago.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                  <Button 
                                    type="link" 
                                    size="small"
                                    icon={<EyeOutlined />} 
                                    onClick={() => handleViewImages(payment.imagenesPago)}
                                  >
                                    Ver {payment.imagenesPago.length} {payment.imagenesPago.length === 1 ? 'imagen' : 'imágenes'}
                                  </Button>
                                </div>
                              )}
                            </Card>
                          </List.Item>
                        );
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </Card>

      {/* Image Modal */}
      <Modal
        title="Imágenes de Pago"
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        footer={null}
        width={800}
        centered
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
          {selectedImages.map((image, index) => (
            <div key={image.id} style={{ textAlign: 'center' }}>
              <Image
                src={image.url}
                alt={`Imagen de pago ${index + 1}`}
                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAn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"
              />
              <div style={{ marginTop: '8px' }}>
                {image.fileName && <Text type="secondary">{image.fileName}</Text>}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Statement;
