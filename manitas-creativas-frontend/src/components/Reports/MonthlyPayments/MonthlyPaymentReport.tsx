import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Row, Col, Select, Button, DatePicker, Spin, message, Typography, Statistic, Space, Modal, ConfigProvider } from 'antd';
import { DownloadOutlined, ReloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import esES from 'antd/es/locale/es_ES';
import $ from 'jquery';
// Import PivotTable.js CSS
import 'pivottable/dist/pivot.css';
import { MonthlyPaymentReportService } from '../../../services/monthlyPaymentReportService';
import { 
  MonthlyPaymentReportFilter, 
  MonthlyPaymentReportResponse,
  MonthlyPaymentItem 
} from '../../../types/monthlyPaymentReport';
import './MonthlyPaymentReport.css';

// Import PivotTable.js functionality
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jQuery: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $: any;
  }
}

const { Title, Text } = Typography;
const { Option } = Select;

const MonthlyPaymentReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<MonthlyPaymentReportResponse | null>(null);
  const [pivotReady, setPivotReady] = useState(false);
  const [filter, setFilter] = useState<MonthlyPaymentReportFilter>({
    cicloEscolar: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  
  const pivotContainerRef = useRef<HTMLDivElement>(null);

  // Configure dayjs to use Spanish locale
  useEffect(() => {
    dayjs.locale('es');
  }, []);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching report data with filter:', filter);
      const data = await MonthlyPaymentReportService.getMonthlyPaymentReport(filter);
      console.log('Report data received:', data);
      setReportData(data);
      
      // Generate pivot table after data is loaded
      if (pivotReady) {
        setTimeout(() => {
          generatePivotTable(data.payments);
        }, 100);
      }
    } catch (error) {
      message.error('Error al cargar el reporte de pagos mensual');
      console.error('Error fetching monthly payment report:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, pivotReady]);  useEffect(() => {
    // Load PivotTable.js and dependencies dynamically
    const loadPivotTable = async () => {
      try {
        // First, ensure jQuery is available globally
        window.jQuery = $;
        window.$ = $;
          console.log('Loading jQuery UI bundle...');
        
        // Load the complete jQuery UI bundle with type assertion
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await import('jquery-ui/dist/jquery-ui.min.js' as any);
        
        console.log('Loading PivotTable.js...');
        // Then import pivottable
        await import('pivottable');
        
        // Verify jQuery UI is properly loaded
        if (typeof $.ui === 'undefined') {
          throw new Error('jQuery UI not properly initialized');
        }
        
        if (typeof $.fn.sortable === 'undefined') {
          throw new Error('jQuery UI sortable not available');
        }
        
        setPivotReady(true);
        console.log('PivotTable.js and dependencies loaded successfully');
      } catch (error) {
        console.error('Error loading PivotTable.js:', error);
        message.error('Error cargando la biblioteca de tablas dinámicas');
      }
    };

    loadPivotTable();
  }, []);

  useEffect(() => {
    // Load the report data when pivot is ready
    if (pivotReady) {
      fetchReportData();
    }
  }, [pivotReady, fetchReportData]);

  const generatePivotTable = (payments: MonthlyPaymentItem[]) => {
    if (!pivotContainerRef.current || payments.length === 0) {
      console.log('PivotTable not ready:', { 
        containerRef: !!pivotContainerRef.current, 
        paymentsLength: payments.length 
      });
      
      // Show a message if no data
      if (pivotContainerRef.current && payments.length === 0) {
        $(pivotContainerRef.current).html(
          '<div style="text-align: center; padding: 50px; color: #999;">' +
          '<h3>No hay datos para mostrar</h3>' +
          '<p>Intenta cambiar los filtros para obtener datos.</p>' +
          '</div>'
        );
      }
      return;
    }

    console.log('Generating pivot table with', payments.length, 'payments');    // Transform data for PivotTable.js
    const pivotData = payments.map(payment => {
      // Format week range with Spanish month names
      let weekRange = payment.weekRange;
      if (weekRange) {
        // Replace English month names with Spanish abbreviations
        weekRange = weekRange
          .replace(/January/g, 'Ene').replace(/Jan/g, 'Ene')
          .replace(/February/g, 'Feb').replace(/Feb/g, 'Feb')
          .replace(/March/g, 'Mar').replace(/Mar/g, 'Mar')
          .replace(/April/g, 'Abr').replace(/Apr/g, 'Abr')
          .replace(/May/g, 'May')
          .replace(/June/g, 'Jun').replace(/Jun/g, 'Jun')
          .replace(/July/g, 'Jul').replace(/Jul/g, 'Jul')
          .replace(/August/g, 'Ago').replace(/Aug/g, 'Ago')
          .replace(/September/g, 'Sep').replace(/Sep/g, 'Sep')
          .replace(/October/g, 'Oct').replace(/Oct/g, 'Oct')
          .replace(/November/g, 'Nov').replace(/Nov/g, 'Nov')
          .replace(/December/g, 'Dic').replace(/Dec/g, 'Dic');
      }

      return {
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
        'Semana': weekRange,
        'Día de la Semana': payment.dayOfWeek,
        'Día del Mes': payment.dayOfMonth,
        'Motivo Anulación': payment.motivoAnulacion || '',
        'Usuario Anulación': payment.usuarioAnulacionNombre || '',
        'Mes Colegiatura': payment.mesColegiatura || '',
        'Año Colegiatura': payment.anioColegiatura || '',
        'Notas': payment.notas || ''
      };
    });

    console.log('Transformed pivot data sample:', pivotData.slice(0, 2));

    // Clear existing content
    const $container = $(pivotContainerRef.current);
    $container.empty();
      try {      // Create custom aggregators with Spanish names
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pivotUtils = (window as any).$.pivotUtilities;
      
      const spanishAggregators = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'Suma': function(...args: any[]) { return pivotUtils.aggregators.Sum.apply(this, args); },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'Contar': function(...args: any[]) { return pivotUtils.aggregators.Count.apply(this, args); },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'Promedio': function(...args: any[]) { return pivotUtils.aggregators.Average.apply(this, args); },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'Mínimo': function(...args: any[]) { return pivotUtils.aggregators.Minimum.apply(this, args); },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'Máximo': function(...args: any[]) { return pivotUtils.aggregators.Maximum.apply(this, args); },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'Contar Valores Únicos': function(...args: any[]) { return pivotUtils.aggregators['Count Unique Values'].apply(this, args); }
      };

      // Create custom renderers with Spanish names
      const spanishRenderers = {
        'Tabla': pivotUtils.renderers.Table,
        'Tabla con Gráfico de Barras': pivotUtils.renderers['Table Barchart'],
        'Mapa de Calor': pivotUtils.renderers.Heatmap,
        'Mapa de Calor por Filas': pivotUtils.renderers['Row Heatmap'],
        'Mapa de Calor por Columnas': pivotUtils.renderers['Col Heatmap']
      };

      // Use jQuery's pivotUI directly with type assertion
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ($container as any).pivotUI(pivotData, {
        rows: ['Estado'],
        cols: ['Semana'],
        aggregatorName: 'Suma',
        vals: ['Monto'],
        rendererName: 'Tabla',
        
        // Custom Spanish aggregators and renderers
        aggregators: spanishAggregators,
        renderers: spanishRenderers,
        
        // Hide ID from the UI
        hiddenAttributes: ['ID'],
        
        // Spanish month names for date formatting
        monthNames: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                     'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          // Handle configuration changes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onRefresh: function(config: any) {
          console.log('Pivot table configuration changed:', config);
          
          // Translate "Totals" to "Totales" after render
          setTimeout(() => {
            const container = pivotContainerRef.current;
            if (container) {
              // Find all text nodes containing "Totals" and replace with "Totales"
              const walker = document.createTreeWalker(
                container,
                NodeFilter.SHOW_TEXT,
                null
              );
                const textNodes = [];
              let node = walker.nextNode();
              while (node) {
                textNodes.push(node);
                node = walker.nextNode();
              }
              
              textNodes.forEach(textNode => {
                if (textNode.textContent && textNode.textContent.includes('Totals')) {
                  textNode.textContent = textNode.textContent.replace(/Totals/g, 'Totales');
                }
              });
            }
          }, 100);
        }
      }, true);

      // Translate "Totals" to "Totales" after initial render
      setTimeout(() => {
        const container = pivotContainerRef.current;
        if (container) {
          // Find all text nodes containing "Totals" and replace with "Totales"
          const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            null
          );
          
          const textNodes = [];
          let node = walker.nextNode();
          while (node) {
            textNodes.push(node);
            node = walker.nextNode();
          }
          
          textNodes.forEach(textNode => {
            if (textNode.textContent && textNode.textContent.includes('Totals')) {
              textNode.textContent = textNode.textContent.replace(/Totals/g, 'Totales');
            }
          });
        }
      }, 200);

      console.log('PivotTable.js initialized successfully');
    } catch (error) {
      console.error('Error initializing PivotTable.js:', error);
      
      // Fallback: show error message
      $container.html(
        '<div style="color: red; padding: 20px; text-align: center;">' +
        '<h3>Error al cargar la tabla dinámica</h3>' +
        '<p>Revisa la consola del navegador para más detalles.</p>' +
        '<p>Error: ' + String(error) + '</p>' +
        '</div>'
      );
    }
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
    message.info('Función de exportación PDF en desarrollo');
  };

  const getCurrentPeriod = () => {
    return `${MonthlyPaymentReportService.getMonthName(filter.month)} ${filter.year}`;
  };

  return (
    <div className="monthly-payment-report">
      <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Reporte Mensual de Pagos - {getCurrentPeriod()}</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={exportToPDF}
          >
            Exportar PDF
          </Button>
        </Col>
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={4}>
            <label>Ciclo Escolar:</label>
            <Select
              value={filter.cicloEscolar}
              onChange={(value) => handleFilterChange('cicloEscolar', value)}
              style={{ width: '100%', marginTop: 4 }}
            >
              <Option value={2024}>2024</Option>
              <Option value={2025}>2025</Option>
              <Option value={2026}>2026</Option>
            </Select>
          </Col>
          <Col span={4}>
            <label>Mes y Año:</label>
            <ConfigProvider locale={esES}>
              <DatePicker
                picker="month"
                value={dayjs().month(filter.month - 1).year(filter.year)}
                onChange={handleDateChange}
                style={{ width: '100%', marginTop: 4 }}
                format="MMMM YYYY"
              />
            </ConfigProvider>
          </Col>
          <Col span={4}>
            <label>Grado (Opcional):</label>
            <Select
              value={filter.gradoId}
              onChange={(value) => handleFilterChange('gradoId', value)}
              style={{ width: '100%', marginTop: 4 }}
              placeholder="Todos los grados"
              allowClear
            >
              <Option value={undefined}>Todos los grados</Option>
              {/* Add more options as needed */}
            </Select>
          </Col>
          <Col span={6}>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={fetchReportData}
              style={{ marginTop: 24 }}
            >
              Actualizar
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Summary Cards */}
      {reportData && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
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
                valueStyle={{ color: '#cf1322' }}
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
      )}

      {/* Pivot Table */}
      <Card 
        title="Tabla Dinámica Interactiva" 
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
                      <p><strong>🎯 Deberías ver:</strong></p>
                      <ul style={{ marginBottom: 16 }}>
                        <li><strong>Lista de campos</strong> (izquierda): Todos los campos disponibles para arrastrar</li>
                        <li><strong>Zonas de arrastre</strong>: Filas, Columnas, Valores, Filtros</li>
                        <li><strong>Tabla de datos</strong>: Los resultados del análisis</li>
                        <li><strong>Controles</strong>: Menús para cambiar agregación y vista</li>
                      </ul>
                      <p><strong>🔍 Para hacer drill-down:</strong></p>
                      <ul style={{ marginBottom: 16 }}>
                        <li>Arrastra "Estado" a Filas para ver Activos vs Anulados</li>
                        <li>Arrastra "Grado" también a Filas para ver por grado</li>
                        <li>Haz clic en cualquier total para ver el detalle</li>
                      </ul>
                      <p><strong>⚠ Si no ves la interfaz:</strong></p>
                      <ul>
                        <li>Revisa la consola del navegador (F12)</li>
                        <li>Verifica que tengas datos en el período seleccionado</li>
                      </ul>
                    </div>
                  ),
                });
              }}
            >
              Ayuda
            </Button>
            <Text type="secondary">
              Debería mostrar campos para arrastrar y soltar
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
            style={{ 
              minHeight: '500px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              padding: '16px',
              backgroundColor: 'white'
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default MonthlyPaymentReport;
