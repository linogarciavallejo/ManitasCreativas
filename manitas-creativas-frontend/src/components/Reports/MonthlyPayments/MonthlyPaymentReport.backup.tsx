import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Row, Col, Select, Button, DatePicker, Spin, message, Typography, Statistic, Space, Modal } from 'antd';
import { DownloadOutlined, ReloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import $ from 'jquery';
import 'pivottable/dist/pivot.css';
import { MonthlyPaymentReportService } from '../../../services/monthlyPaymentReportService';
import { 
  MonthlyPaymentReportFilter, 
  MonthlyPaymentReportResponse,
  MonthlyPaymentItem 
} from '../../../types/monthlyPaymentReport';
import './MonthlyPaymentReport.css';

const { Title, Text } = Typography;
const { Option } = Select;

// Import PivotTable dynamically to handle jQuery dependency
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pivotUI: any;

const MonthlyPaymentReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<MonthlyPaymentReportResponse | null>(null);
  const [filter, setFilter] = useState<MonthlyPaymentReportFilter>({
    cicloEscolar: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  
  const pivotContainerRef = useRef<HTMLDivElement>(null);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await MonthlyPaymentReportService.getMonthlyPaymentReport(filter);
      setReportData(data);
      
      // Generate pivot table after data is loaded
      setTimeout(() => {
        generatePivotTable(data.payments);
      }, 100);
    } catch (error) {
      message.error('Error al cargar el reporte de pagos mensual');
      console.error('Error fetching monthly payment report:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);
  useEffect(() => {
    // Load PivotTable.js dynamically
    import('pivottable').then((pivot) => {
      pivotUI = pivot.pivotUI;
      // Load the report data on initial mount
      fetchReportData();
    }).catch((error) => {
      console.error('Error loading PivotTable.js:', error);
      message.error('Error cargando la biblioteca de tablas dinámicas');
    });
  }, [fetchReportData]);

  const generatePivotTable = (payments: MonthlyPaymentItem[]) => {
    if (!pivotContainerRef.current || !pivotUI || payments.length === 0) return;

    // Clear existing pivot table
    $(pivotContainerRef.current).empty();

    // Transform data for PivotTable.js
    const pivotData = payments.map(payment => ({
      'ID': payment.id,
      'Monto': payment.monto,
      'Fecha': MonthlyPaymentReportService.formatDate(payment.fecha),
      'Medio de Pago': payment.medioPago,
      'Rubro': payment.rubroDescripcion,
      'Tipo Rubro': payment.tipoRubro,
      'Es Colegiatura': payment.esColegiatura ? 'Sí' : 'No',
      'Alumno': payment.alumnoNombre,
      'Grado': payment.gradoNombre,
      'Sección': payment.seccion,
      'Nivel Educativo': payment.nivelEducativo,
      'Estado': payment.paymentCategory === 'Active' ? 'Activo' : 'Anulado',
      'Semana': payment.weekRange,
      'Día de la Semana': payment.dayOfWeek,
      'Día del Mes': payment.dayOfMonth,
      'Motivo Anulación': payment.motivoAnulacion || '',
      'Usuario Anulación': payment.usuarioAnulacionNombre || '',
      'Mes Colegiatura': payment.mesColegiatura || '',
      'Año Colegiatura': payment.anioColegiatura || '',
      'Notas': payment.notas || ''
    }));    // Configure PivotTable - ensure the container is properly initialized
    const $container = $(pivotContainerRef.current);
    
    // Clear any existing content
    $container.empty();
    
    // Configure PivotTable with better defaults
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ($container as any).pivotUI(pivotData, {
      rows: ['Estado'],
      cols: ['Semana'],
      aggregatorName: 'Suma',
      vals: ['Monto'],
      rendererName: 'Table',
      rowOrder: 'value_z_to_a',
      colOrder: 'value_a_to_z',
      
      // Custom aggregators with proper Spanish names
      aggregators: {
        'Suma': function() {
          return {
            push: function(record: Record<string, unknown>) { 
              this.sum += parseFloat(String(record.Monto)) || 0; 
            },
            value: function() { return this.sum; },
            format: function(x: number) { return MonthlyPaymentReportService.formatCurrency(x); },
            sum: 0
          };
        },        'Cuenta': function() {
          return {
            push: function() { this.count++; },
            value: function() { return this.count; },
            format: function(x: number) { return x.toString(); },
            count: 0
          };
        },
        'Promedio': function() {
          return {
            push: function(record: Record<string, unknown>) { 
              this.sum += parseFloat(String(record.Monto)) || 0; 
              this.count++; 
            },
            value: function() { return this.count > 0 ? this.sum / this.count : 0; },
            format: function(x: number) { return MonthlyPaymentReportService.formatCurrency(x); },
            sum: 0,
            count: 0
          };
        }
      },

      // Ensure we're using the default renderers (don't override)
      renderers: undefined,

      // Hide specific fields from the drag and drop interface
      hiddenAttributes: ['ID'],
        // Handle drill-down functionality
      onRefresh: function(config: import('pivottable').PivotUIConfig) {
        console.log('Pivot table configuration changed:', config);
      },

      // Add some UI customization
      menuLimit: 500,
      unusedAttrsVertical: true,
      
      // Enable all fields to be draggable
      sorters: {
        'Semana': function(a: string, b: string) {
          // Custom sorting for week ranges
          const getWeekNumber = (weekStr: string) => {
            const match = weekStr.match(/Semana (\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          };
          return getWeekNumber(a) - getWeekNumber(b);
        }
      }
    }, true);
  };

  const handleFilterChange = (key: keyof MonthlyPaymentReportFilter, value: string | number | null) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setFilter(prev => ({
        ...prev,
        month: date.month() + 1,
        year: date.year()
      }));
    }
  };

  const exportToPDF = () => {
    message.info('Funcionalidad de exportación a PDF próximamente');
  };

  const getCurrentPeriod = () => {
    return `${MonthlyPaymentReportService.getMonthName(filter.month)} ${filter.year}`;
  };

  return (
    <div className="monthly-payment-report">
      <Card>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col>
            <Title level={3}>Reporte Mensual de Pagos - {getCurrentPeriod()}</Title>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={exportToPDF}
              disabled={!reportData}
            >
              Exportar PDF
            </Button>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Text strong>Ciclo Escolar:</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              value={filter.cicloEscolar}
              onChange={(value) => handleFilterChange('cicloEscolar', value)}
            >
              <Option value={2024}>2024</Option>
              <Option value={2025}>2025</Option>
              <Option value={2026}>2026</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Text strong>Mes y Año:</Text>
            <DatePicker
              style={{ width: '100%', marginTop: 4 }}
              picker="month"
              value={dayjs().month(filter.month - 1).year(filter.year)}
              onChange={handleDateChange}
              format="MMMM YYYY"
            />
          </Col>
          <Col span={6}>
            <Text strong>Grado (Opcional):</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              value={filter.gradoId}
              onChange={(value) => handleFilterChange('gradoId', value)}
              allowClear
              placeholder="Todos los grados"
            >
              <Option value={1}>Párvulos</Option>
              <Option value={2}>Preparatoria</Option>
              <Option value={3}>Primero Primaria</Option>
              <Option value={4}>Segundo Primaria</Option>
              <Option value={5}>Tercero Primaria</Option>
              <Option value={6}>Cuarto Primaria</Option>
              <Option value={7}>Quinto Primaria</Option>
              <Option value={8}>Sexto Primaria</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={fetchReportData}
              loading={loading}
              style={{ marginTop: 24 }}
            >
              Actualizar
            </Button>
          </Col>
        </Row>

        {/* Summary Statistics */}
        {reportData && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Total de Pagos"
                  value={reportData.summary.totalAmount}
                  formatter={(value) => MonthlyPaymentReportService.formatCurrency(Number(value))}
                  valueStyle={{ color: '#3f8600' }}
                />
                <Text type="secondary">{reportData.summary.totalPayments} pagos</Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Pagos Activos"
                  value={reportData.summary.activePaymentsAmount}
                  formatter={(value) => MonthlyPaymentReportService.formatCurrency(Number(value))}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Text type="secondary">{reportData.summary.activePayments} pagos</Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Pagos Anulados"
                  value={reportData.summary.voidedPaymentsAmount}
                  formatter={(value) => MonthlyPaymentReportService.formatCurrency(Number(value))}
                  valueStyle={{ color: '#ff4d4f' }}
                />
                <Text type="secondary">{reportData.summary.voidedPayments} pagos</Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Fecha de Generación"
                  value={MonthlyPaymentReportService.formatDate(reportData.generatedAt)}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Card>
            </Col>
          </Row>
        )}        {/* Pivot Table */}
        <Card 
          title="Análisis Interactivo de Pagos" 
          loading={loading}
          extra={
            <Space>
              <Button 
                type="link" 
                icon={<QuestionCircleOutlined />}
                onClick={() => {
                  Modal.info({
                    title: 'Cómo usar la Tabla Dinámica',
                    width: 650,
                    content: (
                      <div>
                        <p><strong>📋 Arrastra los campos para crear diferentes vistas:</strong></p>
                        <ul style={{ marginBottom: 16 }}>
                          <li><strong>🔵 Filas:</strong> Campos que aparecerán como filas (ej: Estado, Grado)</li>
                          <li><strong>🟠 Columnas:</strong> Campos que aparecerán como columnas (ej: Semana)</li>
                          <li><strong>🟢 Valores:</strong> Campos numéricos para sumar/contar (ej: Monto)</li>
                          <li><strong>⚪ Filtros:</strong> Campos para filtrar datos (ej: Nivel Educativo)</li>
                        </ul>
                        <p><strong>🔍 Para hacer drill-down (análisis detallado):</strong></p>
                        <ul style={{ marginBottom: 16 }}>
                          <li>Haz clic en cualquier <strong>total o subtotal</strong> para ver los pagos individuales</li>
                          <li>Usa los menús desplegables para cambiar:</li>
                          <ul>
                            <li><strong>Agregación:</strong> Suma, Cuenta, Promedio</li>
                            <li><strong>Vista:</strong> Tabla, Gráfico de Barras, Mapa de Calor</li>
                          </ul>
                        </ul>
                        <p><strong>💡 Ejemplos útiles:</strong></p>
                        <ul>
                          <li><strong>Por semana:</strong> Arrastra "Semana" a Columnas, "Estado" a Filas</li>
                          <li><strong>Por grado:</strong> Arrastra "Grado" a Filas, "Sección" a Columnas</li>
                          <li><strong>Análisis de anulados:</strong> Filtra por "Estado" = "Anulado"</li>
                        </ul>
                      </div>
                    ),
                  });
                }}
              >
                Ayuda
              </Button>
              <Text type="secondary">
                Arrastra los campos para crear diferentes vistas de los datos
              </Text>
            </Space>
          }
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>Cargando datos del reporte...</Text>
              </div>
            </div>
          ) : (
            <div 
              ref={pivotContainerRef} 
              className="pivot-container"
              style={{ minHeight: '500px' }}
            />
          )}
        </Card>

        {reportData && reportData.payments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              No se encontraron pagos para el período seleccionado
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MonthlyPaymentReport;
