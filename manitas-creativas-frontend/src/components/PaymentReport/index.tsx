import React, { useState, useEffect } from 'react';
import { Table, Select, Card, Typography, Spin, Row, Col, Empty, Button, Space, message, Alert } from 'antd';
import { makeApiRequest } from '../../services/apiHelper';
import { gradoService } from '../../services/gradoService';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx-js-style'; // Change to xlsx-js-style for better styling support
import './PaymentReport.css';

const { Title } = Typography;
const { Option } = Select;

interface PagoReportItem {
  id: number;
  monto: number;
  estado: string;
  mesColegiatura?: number;
}

interface PagoReportStudent {
  numeroOrdinal: number;
  alumnoId: number;
  nombreCompleto: string;
  notas: string;
  nit: string;
  pagosPorRubro: Record<number, Record<number, PagoReportItem>>;
}

interface RubroReport {
  id: number;
  descripcion: string;
  ordenVisualizacionGrid: number;
  esColegiatura: boolean;
}

interface PaymentReportResponse {
  alumnos: PagoReportStudent[];
  rubros: RubroReport[];
}

interface Grado {
  id: number;
  nombre: string;
}

// Define XLSX style types to fix TypeScript errors
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

// Month names for colegiatura columns
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const PaymentReport: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const [reportData, setReportData] = useState<PaymentReportResponse | null>(null);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedGradoId, setSelectedGradoId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch grados on component mount
  useEffect(() => {
    fetchGrados();
  }, []);
  // Fetch grados from API
  const fetchGrados = async () => {
    try {
      const data = await gradoService.getAllGrados();
      setGrados(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching grados:', error);
      message.error('Error al cargar los grados.');
      setError('No se pudieron cargar los grados. Por favor, inténtelo de nuevo.');
    }
  };

  // Generate year options for the select (current year and 3 years back)
  const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - i);

  // Fetch report data based on filters
  const fetchReportData = async () => {
    if (!selectedGradoId) {
      message.warning('Por favor seleccione un grado.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await makeApiRequest<PaymentReportResponse>(
        `/pagos/report?cicloEscolar=${selectedYear}&gradoId=${selectedGradoId}`, 
        'GET'
      );
      setReportData(data);
      
      if (data.alumnos.length === 0) {
        message.info('No se encontraron resultados con los filtros seleccionados.');
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      message.error('Error al cargar el reporte de pagos.');
      setError('Error al cargar los datos del reporte. Por favor, inténtelo de nuevo.');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };
  // Generate table columns based on rubros
  const generateColumns = () => {
    if (!reportData || !reportData.rubros.length) {
      return [];
    }

    // Fixed columns (student info)
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
        title: 'Nombre del Alumno',
        dataIndex: 'nombreCompleto',
        key: 'nombreCompleto',
        width: 250,
        fixed: 'left' as const,
        className: 'student-info-column',
      },
      {
        title: 'Notas',
        dataIndex: 'notas',
        key: 'notas',
        width: 200,
        fixed: 'left' as const,
        hidden: true, // Hide this column
      },
      {
        title: 'NIT',
        dataIndex: 'nit',
        key: 'nit',
        width: 120,
        fixed: 'left' as const,
        className: 'student-info-column',
      },
    ];

    // Dynamic columns based on rubros
    const dynamicColumns = [];
    
    for (const rubro of reportData.rubros) {
      if (rubro.esColegiatura) {
        // For colegiatura, create a column group with months as children
        dynamicColumns.push({
          title: rubro.descripcion,
          key: `rubro-${rubro.id}`,
          className: 'colegiatura-header', // Add class for styling
          children: MONTH_NAMES.map((month, index) => ({
            title: month,
            key: `rubro-${rubro.id}-month-${index + 1}`,
            width: 100,
            className: 'colegiatura-month payment-column', // Add classes for styling
            render: (_: unknown, record: PagoReportStudent) => {
              const payments = record.pagosPorRubro[rubro.id];
              const monthPayment = payments && payments[index + 1];
              
              if (monthPayment) {
                return `Q${monthPayment.monto.toFixed(2)}`;
              }
              return '-';
            }
          })),
        });
      } else {
        // For non-colegiatura, create a single column
        dynamicColumns.push({
          title: rubro.descripcion,
          key: `rubro-${rubro.id}`,
          width: 120,
          className: 'payment-column', // Add class for styling
          render: (_: unknown, record: PagoReportStudent) => {
            const payments = record.pagosPorRubro[rubro.id];
            const payment = payments && payments[0];
            
            if (payment) {
              return `Q${payment.monto.toFixed(2)}`;
            }
            return '-';
          }
        });
      }
    }

    // Filter out hidden columns
    return [...fixedColumns, ...dynamicColumns].filter(column => !('hidden' in column && column.hidden));
  };

  // Generate table data source
  const generateDataSource = () => {
    if (!reportData || !reportData.alumnos.length) {
      return [];
    }

    return reportData.alumnos;
  };
  // Export to Excel function with styling
  const exportToExcel = () => {
    if (!reportData || !reportData.alumnos.length) {
      message.warning('No hay datos para exportar.');
      return;
    }

    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Prepare Excel data in the format expected by the library
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
      
      const studentInfoStyle: XLSXCellStyle = {
        fill: { fgColor: { rgb: "E6F7E6" } }, // Light green
        border: { 
          top: { style: 'thin', color: { rgb: "000000" } },
          bottom: { style: 'thin', color: { rgb: "000000" } },
          left: { style: 'thin', color: { rgb: "000000" } },
          right: { style: 'thin', color: { rgb: "000000" } }
        }
      };
      
      const studentInfoStyleAlt: XLSXCellStyle = {
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
      
      // Create header row with styles
      const headerRow: Array<XLSXStyledCell> = [
        { v: '#', s: headerStyle },
        { v: 'Nombre del Alumno', s: headerStyle },
        { v: 'NIT', s: headerStyle }
      ];
      
      // Add rubro headers
      reportData.rubros.forEach(rubro => {
        if (rubro.esColegiatura) {
          // For colegiatura, add one column per month
          MONTH_NAMES.forEach((monthName) => {
            headerRow.push({ 
              v: `${rubro.descripcion} - ${monthName}`, 
              s: headerStyle 
            });
          });
        } else {
          // For non-colegiatura, add a single column
          headerRow.push({ 
            v: rubro.descripcion, 
            s: headerStyle 
          });
        }
      });
      
      excelData.push(headerRow);
      
      // Add data rows with alternating styles
      reportData.alumnos.forEach((student, rowIndex) => {
        const isEvenRow = rowIndex % 2 === 0;
        const studentStyle = isEvenRow ? studentInfoStyleAlt : studentInfoStyle;
        const pStyle = isEvenRow ? paymentStyleAlt : paymentStyle;
        
        const row: Array<XLSXStyledCell> = [
          { v: student.numeroOrdinal, s: studentStyle },
          { v: student.nombreCompleto, s: studentStyle },
          { v: student.nit, s: studentStyle }
        ];

        // Add data for each rubro
        reportData.rubros.forEach(rubro => {
          const payments = student.pagosPorRubro[rubro.id];
          
          if (rubro.esColegiatura) {
            // For colegiatura, add one column per month
            MONTH_NAMES.forEach((_, index) => {
              const monthPayment = payments && payments[index + 1];
              row.push({ 
                v: monthPayment ? `Q${monthPayment.monto.toFixed(2)}` : '-', 
                s: pStyle
              });
            });
          } else {
            // For non-colegiatura, add a single column
            const payment = payments && payments[0];
            row.push({ 
              v: payment ? `Q${payment.monto.toFixed(2)}` : '-', 
              s: pStyle 
            });
          }
        });
        
        excelData.push(row);
      });
      
      // Create worksheet with formatted data
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      
      // Set column widths
      const colWidths: Array<{ wch: number }> = [
        { wch: 6 },   // # column
        { wch: 40 },  // Nombre del Alumno
        { wch: 15 },  // NIT
      ];
      
      // Add width for other columns
      for (let i = 3; i < headerRow.length; i++) {
        colWidths.push({ wch: 15 }); // Width for all other columns
      }
      
      ws['!cols'] = colWidths;
      
      // Add the worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'ReportePagos');

      // Save the file with styling
      const fileName = `ReportePagos_${selectedYear}_Grado${selectedGradoId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      message.success('Reporte exportado exitosamente con colores similares al reporte en pantalla.');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      message.error('Error al exportar a Excel');
    }
  };

  return (
    <div className="payment-report-container">
      <div className="payment-report-header">
        <Title level={2}>Reporte de Pagos</Title>
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
            <Typography.Text strong>Grado</Typography.Text>
            <Select
              placeholder="Seleccione el grado"
              style={{ width: '100%', marginTop: 8 }}
              value={selectedGradoId}
              onChange={value => setSelectedGradoId(value)}
              allowClear
            >
              {grados.map(grado => (
                <Option key={grado.id} value={grado.id}>{grado.nombre}</Option>
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
            <Space style={{ marginTop: 32 }}>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchGrados}
              >
                Refrescar Grados
              </Button>
              
              <Button 
                icon={<DownloadOutlined />} 
                onClick={exportToExcel}
                disabled={!reportData || reportData.alumnos.length === 0}
              >
                Exportar a Excel
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
          <>            {reportData.alumnos.length > 0 ? (              <Table
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
            )}
          </>
        ) : (
          <Empty
            description="Seleccione los filtros y genere el reporte para ver los resultados"
            style={{ margin: '40px 0' }}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentReport;
