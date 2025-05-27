import { useState, useEffect } from 'react';
import { Table, Select, Card, Typography, Spin, Row, Col, Empty, Button, Space, message, Alert, Tooltip } from 'antd';
import { pagoService, PagoTransporteReportDto, PagoTransporteReportItemDto } from '../../services/pagoService';
import { rubroService, Rubro } from '../../services/rubroService';
import { ReloadOutlined, DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx-js-style';
import './PaymentReport.css';

const { Title } = Typography;
const { Option } = Select;

// Define XLSX style types
interface XLSXCellStyle {
  fill?: {
    fgColor: {
      rgb: string;
    };
  };
  font?: {
    bold?: boolean;
  };
  alignment?: {
    horizontal: 'center' | 'left' | 'right';
    vertical: 'center' | 'top' | 'bottom';
  };
  border?: {
    top?: { style: 'thin' | 'medium' | 'thick'; color: { rgb: string } };
    bottom?: { style: 'thin' | 'medium' | 'thick'; color: { rgb: string } };
    left?: { style: 'thin' | 'medium' | 'thick'; color: { rgb: string } };
    right?: { style: 'thin' | 'medium' | 'thick'; color: { rgb: string } };
  };
}

interface XLSXStyledCell {
  v: string | number;
  s?: XLSXCellStyle;
}

// Month names for transport report columns (1-10)
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre'
];

const TransportPaymentsReport = () => {
  const currentYear = new Date().getFullYear();
  const [reportData, setReportData] = useState<PagoTransporteReportDto[] | null>(null);
  const [transportRubros, setTransportRubros] = useState<Rubro[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedRubroId, setSelectedRubroId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState<string>('Reporte de Pagos de Transporte');

  // Fetch transport rubros on component mount
  useEffect(() => {
    fetchTransportRubros();
  }, []);

  // Fetch transport rubros from API
  const fetchTransportRubros = async () => {
    try {
      const data = await rubroService.getActiveRubros();
      // Filter for transport rubros only
      const transportRubros = data.filter(rubro => rubro.esPagoDeTransporte === true);
      setTransportRubros(transportRubros);
      setError(null);
    } catch (error) {
      console.error('Error fetching transport rubros:', error);
      message.error('Error al cargar los rubros de transporte.');
      setError('No se pudieron cargar los rubros de transporte. Por favor, inténtelo de nuevo.');
    }
  };

  // Generate year options for the select (current year and 3 years back)
  const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - i);

  // Fetch report data based on filters
  const fetchReportData = async () => {
    if (!selectedRubroId) {
      message.warning('Por favor seleccione una ruta de transporte.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await pagoService.getTransportPaymentsReport(selectedYear, selectedRubroId);
      setReportData(response.alumnos);
      setReportTitle(`Reporte de Pagos - ${response.rubroDescripcion} (${response.cicloEscolar})`);
      
      if (response.alumnos.length === 0) {
        message.info('No se encontraron resultados con los filtros seleccionados.');
      }
    } catch (error) {
      console.error('Error fetching transport report data:', error);
      message.error('Error al cargar el reporte de transporte.');
      setError('Error al cargar los datos del reporte. Por favor, inténtelo de nuevo.');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render payment cell
  const renderPaymentCell = (payment: PagoTransporteReportItemDto | undefined) => {
    if (!payment) return '-';
    
    // Display payment amount with tooltip if there are notes
    const amount = `Q${payment.monto.toFixed(2)}`;
    
    if (payment.notas && payment.notas.trim()) {
      return (
        <Space size="small">
          {amount}
          <Tooltip title={payment.notas}>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
          </Tooltip>
        </Space>
      );
    }
    
    return amount;
  };

  // Generate table columns for transport report
  const generateColumns = () => {
    if (!reportData || reportData.length === 0) {
      return [];
    }

    const fixedColumns = [
      {
        title: '#',
        dataIndex: 'numeroOrdinal',
        key: 'numeroOrdinal',
        width: 50,
        fixed: 'left' as const,
        className: 'student-info-column',
      },
      {
        title: 'Alumno',
        dataIndex: 'alumno',
        key: 'alumno',
        width: 200,
        fixed: 'left' as const,
        className: 'student-info-column',
      },
      {
        title: 'Dirección',
        dataIndex: 'direccion',
        key: 'direccion',
        width: 150,
        className: 'student-info-column',
      },
      {
        title: 'Teléfono',
        dataIndex: 'telefono',
        key: 'telefono',
        width: 150,
        className: 'student-info-column',
      },
      {
        title: 'Encargado',
        dataIndex: 'encargado',
        key: 'encargado',
        width: 200,
        className: 'student-info-column',
      },
      {
        title: 'Grado',
        dataIndex: 'grado',
        key: 'grado',
        width: 100,
        className: 'student-info-column',
      },
    ];

    // Add monthly columns (1-12)
    const monthlyColumns = MONTH_NAMES.map((monthName, index) => ({
      title: monthName,
      key: `month-${index + 1}`,
      width: 100,
      className: 'payment-column',
      render: (_: unknown, record: PagoTransporteReportDto) => {
        const month = index + 1;
        const payment = record.pagosPorMes[month];
        return renderPaymentCell(payment);
      },
    }));

    return [...fixedColumns, ...monthlyColumns];
  };

  // Generate data source for the table
  const generateDataSource = () => {
    if (!reportData || reportData.length === 0) {
      return [];
    }

    return reportData;
  };

  // Export to Excel function
  const exportToExcel = () => {
    if (!reportData || reportData.length === 0) {
      message.warning('No hay datos para exportar.');
      return;
    }

    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Prepare Excel data
      const excelData: Array<Array<XLSXStyledCell>> = [];
      
      // Define styles
      const headerStyle: XLSXCellStyle = {
        fill: { fgColor: { rgb: "FFFFCC" } }, // Light yellow
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" },
        border: { 
          top: { style: 'thin', color: { rgb: "000000" } },
          bottom: { style: 'thin', color: { rgb: "000000" } },
          left: { style: 'thin', color: { rgb: "000000" } },
          right: { style: 'thin', color: { rgb: "000000" } }
        }
      };
      
      const studentStyle: XLSXCellStyle = {
        fill: { fgColor: { rgb: "E6F7E6" } }, // Light green
        border: { 
          top: { style: 'thin', color: { rgb: "000000" } },
          bottom: { style: 'thin', color: { rgb: "000000" } },
          left: { style: 'thin', color: { rgb: "000000" } },
          right: { style: 'thin', color: { rgb: "000000" } }
        }
      };

      const studentStyleAlt: XLSXCellStyle = {
        fill: { fgColor: { rgb: "D4EED4" } }, // Darker light green
        border: { 
          top: { style: 'thin', color: { rgb: "000000" } },
          bottom: { style: 'thin', color: { rgb: "000000" } },
          left: { style: 'thin', color: { rgb: "000000" } },
          right: { style: 'thin', color: { rgb: "000000" } }
        }
      };
      
      const paymentStyle: XLSXCellStyle = {
        fill: { fgColor: { rgb: "E6F7FF" } }, // Light blue
        border: { 
          top: { style: 'thin', color: { rgb: "000000" } },
          bottom: { style: 'thin', color: { rgb: "000000" } },
          left: { style: 'thin', color: { rgb: "000000" } },
          right: { style: 'thin', color: { rgb: "000000" } }
        }
      };
        
      const paymentStyleAlt: XLSXCellStyle = {
        fill: { fgColor: { rgb: "D6EEFF" } }, // Darker light blue
        border: { 
          top: { style: 'thin', color: { rgb: "000000" } },
          bottom: { style: 'thin', color: { rgb: "000000" } },
          left: { style: 'thin', color: { rgb: "000000" } },
          right: { style: 'thin', color: { rgb: "000000" } }
        }
      };
        
      // Create header row
      const headerRow: Array<XLSXStyledCell> = [
        { v: '#', s: headerStyle },
        { v: 'Alumno', s: headerStyle },
        { v: 'Dirección', s: headerStyle },
        { v: 'Teléfono', s: headerStyle },
        { v: 'Encargado', s: headerStyle },
        { v: 'Grado', s: headerStyle },
      ];
      
      // Add month headers
      MONTH_NAMES.forEach(monthName => {
        headerRow.push({ v: monthName, s: headerStyle });
      });
      
      excelData.push(headerRow);
      
      // Add data rows
      reportData.forEach((student, rowIndex) => {
        const isEvenRow = rowIndex % 2 === 0;
        const sStyle = isEvenRow ? studentStyleAlt : studentStyle;
        const pStyle = isEvenRow ? paymentStyleAlt : paymentStyle;
        
        const row: Array<XLSXStyledCell> = [
          { v: student.numeroOrdinal, s: sStyle },
          { v: student.alumno, s: sStyle },
          { v: student.direccion || '-', s: sStyle },
          { v: student.telefono || '-', s: sStyle },
          { v: student.encargado || '-', s: sStyle },
          { v: student.grado || '-', s: sStyle },
        ];

        // Add monthly payment data
        MONTH_NAMES.forEach((_, index) => {
          const month = index + 1;
          const payment = student.pagosPorMes[month];
          let cellValue = '-';
          
          if (payment) {
            cellValue = `Q${payment.monto.toFixed(2)}`;
            // Add note indicator if present
            if (payment.notas && payment.notas.trim()) {
              cellValue += ' *'; // Add asterisk to indicate notes
            }
          }
          
          row.push({ v: cellValue, s: pStyle });
        });
        
        excelData.push(row);
      });
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      
      // Set column widths
      const colWidths = [
        { wch: 5 },   // #
        { wch: 30 },  // Alumno
        { wch: 20 },  // Dirección
        { wch: 15 },  // Teléfono
        { wch: 25 },  // Encargado
        { wch: 15 },  // Grado
      ];
      
      // Add widths for month columns
      MONTH_NAMES.forEach(() => {
        colWidths.push({ wch: 12 });
      });
      
      ws['!cols'] = colWidths;
      
      // Create a second worksheet for notes explanation
      const legendSheet = XLSX.utils.aoa_to_sheet([
        [{ v: '* El asterisco indica que el pago tiene notas asociadas.', s: {
          font: { bold: true },
          alignment: { horizontal: "left", vertical: "center" }
        }}]
      ]);
      
      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'ReporteTransporte');
      XLSX.utils.book_append_sheet(wb, legendSheet, 'Leyenda');

      // Save the file
      const selectedRubroName = transportRubros.find(r => r.id === selectedRubroId)?.descripcion || selectedRubroId;
      const fileName = `ReporteTransporte_${selectedYear}_${selectedRubroName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      message.success('Reporte exportado exitosamente.');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      message.error('Error al exportar a Excel');
    }
  };

  return (
    <div className="payment-report-container">
      <div className="payment-report-header">
        <Title level={2}>{reportTitle}</Title>
      </div>

      <Card className="payment-report-filters">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={6}>
            <Typography.Text strong>Ciclo Escolar</Typography.Text>
            <Select
              placeholder="Seleccione el año"
              style={{ width: '100%', marginTop: 8 }}
              value={selectedYear}
              onChange={value => setSelectedYear(value)}
            >
              {yearOptions.map(year => (
                <Option key={year} value={year}>{year}</Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={24} md={12} lg={6}>
            <Typography.Text strong>Ruta de Transporte</Typography.Text>
            <Select
              placeholder="Seleccione el rubro de transporte"
              style={{ width: '100%', marginTop: 8 }}
              value={selectedRubroId}
              onChange={value => setSelectedRubroId(value)}
              allowClear
            >
              {transportRubros.map(rubro => (
                <Option key={rubro.id} value={rubro.id}>{rubro.descripcion}</Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} md={12} lg={6} className="payment-report-action">
            <Button 
              type="primary" 
              onClick={fetchReportData}
              style={{ marginTop: 32 }}
            >
              Generar Reporte
            </Button>
          </Col>
          
          <Col xs={24} md={12} lg={6} className="payment-report-action">
            <Space style={{ marginTop: 32 }} wrap>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchTransportRubros}
                size="middle"
              >
                Refrescar
              </Button>
              
              <Button 
                icon={<DownloadOutlined />} 
                onClick={exportToExcel}
                disabled={!reportData || reportData.length === 0}
                size="middle"
              >
                Exportar
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginTop: 16, marginBottom: 16 }}
        />
      )}

      <div className="payment-report-content">
        {loading ? (
          <div className="payment-report-loading">
            <Spin size="large" />
            <p>Cargando datos...</p>
          </div>
        ) : reportData ? (
          reportData.length > 0 ? (
            <Table
              columns={generateColumns()}
              dataSource={generateDataSource()}
              rowKey="alumnoId"
              pagination={false}
              scroll={{ x: 'max-content' }}
              bordered
              size="small"
              className="payment-report-table"
            />
          ) : (
            <Empty
              description="No se encontraron resultados con los filtros seleccionados"
              style={{ margin: '40px 0' }}
            />
          )
        ) : (
          <Empty
            description="Seleccione los filtros y genere el reporte para ver los resultados"
            style={{ margin: '40px 0' }}
          />
        )}
      </div>
      
      {/* Add a legend for notes */}
      {reportData && reportData.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center' }}>
          <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          <Typography.Text type="secondary">El ícono indica que el pago tiene notas asociadas. Pase el cursor sobre el ícono para verlas.</Typography.Text>
        </div>
      )}
    </div>
  );
};

export default TransportPaymentsReport;
