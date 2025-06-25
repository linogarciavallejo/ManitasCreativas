import React from 'react';
import { Button, Card, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const ReportsMenu: React.FC = () => {
  const navigate = useNavigate();

  const reports = [
    {
      title: 'Reporte Mensual de Pagos',
      description: 'Análisis interactivo de pagos mensuales con capacidad de drill-down por grado, sección, semana y estado.',
      features: [
        'Tabla dinámica con arrastrar y soltar',
        'Visualización de pagos activos y anulados',
        'Filtros por ciclo escolar, mes, grado',
        'Estadísticas de resumen',
        'Exportación a PDF (próximamente)'
      ],
      route: '/main/monthly-payments-report',
      available: true
    },    {
      title: 'Reporte de Morosos de Colegiatura',
      description: 'Identifica estudiantes con pagos de colegiatura en mora según política escolar (pago antes del día 5 de cada mes).',
      features: [
        'Identificación automática de morosos',
        'Categorización por tiempo de atraso',
        'Detalles de colegiaturas pendientes',
        'Estadísticas de resumen por grado y sede',
        'Datos estructurados para futura exportación PDF'
      ],
      route: '/main/tuition-debtors-report',
      available: true
    },
    {
      title: 'Reporte de Morosos de Transporte',
      description: 'Identifica estudiantes con pagos de transporte en mora organizados por rutas de transporte.',
      features: [
        'Identificación automática de morosos de transporte',
        'Filtros por ruta de transporte específica',
        'Categorización por tiempo de atraso',
        'Detalles de pagos de transporte pendientes',
        'Estadísticas de resumen por grado, sede y ruta'
      ],
      route: '/main/transport-debtors-report',
      available: true
    },
    {
      title: 'Control de Pagos',
      description: 'Reporte detallado de pagos organizados por grado académico.',
      route: '/main/payment-report',
      available: true
    },
    {
      title: 'Reporte de Pagos de Bus',
      description: 'Análisis específico de pagos de bus por rutas.',
      route: '/main/transport-payments-report',
      available: true
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Centro de Reportes</Title>
      <Paragraph>
        Selecciona el tipo de reporte que deseas generar. Cada reporte ofrece diferentes 
        perspectivas y análisis de los datos de pagos.
      </Paragraph>

      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        {reports.map((report, index) => (
          <Card
            key={index}
            title={report.title}
            extra={
              <Button 
                type="primary" 
                onClick={() => navigate(report.route)}
                disabled={!report.available}
              >
                {report.available ? 'Abrir Reporte' : 'Próximamente'}
              </Button>
            }
            style={{ height: '100%' }}
          >
            <Paragraph>{report.description}</Paragraph>
            
            {report.features && (
              <div>
                <Text strong>Características principales:</Text>
                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                  {report.features.map((feature, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      <Text type="secondary">{feature}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card style={{ marginTop: '24px', backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
        <Title level={4} style={{ color: '#52c41a', marginBottom: '8px' }}>
          🎉 Nuevo: Reporte Mensual de Pagos con tablas pivote.
        </Title>
        <Paragraph>
          Experimenta con nuestro nuevo reporte interactivo que te permite:
        </Paragraph>
        <Space direction="vertical" size="small">
          <Text>• <strong>Arrastra y suelta</strong> campos para crear diferentes vistas</Text>
          <Text>• <strong>Drill-down</strong> en pagos anulados para ver detalles</Text>
          <Text>• <strong>Múltiples agregaciones</strong>: suma, conteo, promedio</Text>
          <Text>• <strong>Visualizaciones</strong>: tablas, gráficos de barras, mapas de calor</Text>
          <Text>• <strong>Exportación PDF</strong> programada para reportes automáticos mensuales</Text>
        </Space>
      </Card>
    </div>
  );
};

export default ReportsMenu;
