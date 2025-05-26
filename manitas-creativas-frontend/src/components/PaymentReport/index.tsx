import React, { useState, useEffect } from 'react';
import { Table, Select, Card, Typography, Spin, Row, Col, Empty, Button, Space, message, Alert, Tooltip } from 'antd';
import { makeApiRequest } from '../../services/apiHelper';
import { gradoService } from '../../services/gradoService';
import { ReloadOutlined, DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx-js-style'; // Change to xlsx-js-style for better styling support
import './PaymentReport.css';

const { Title } = Typography;
const { Option } = Select;

interface PagoReportItem {
  id: number;
  monto: number;
  estado: string;
  mesColegiatura?: number;
  notas?: string; // Optional, might not be sent by the backend
  esPagoDeCarnet?: boolean; // Added for carnet functionality
  estadoCarnet?: string; // Added for carnet functionality
}

interface PagoReportStudent {
  numeroOrdinal: number;
  alumnoId: number;
  nombreCompleto: string;
  notas: string;  // This field should contain the student's Observaciones
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
  'Julio', 'Agosto', 'Septiembre', 'Octubre'
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

  // This function modifies the raw data from the API to ensure 
  // all payment objects have the expected fields, including notas
  const normalizeReportData = (data: PaymentReportResponse): PaymentReportResponse => {
    if (!data || !data.alumnos) return data;
    
    // Create a deep copy to avoid mutating the original data
    const normalizedData = JSON.parse(JSON.stringify(data)) as PaymentReportResponse;
    
    // Ensure each payment has the notas field
    normalizedData.alumnos.forEach(alumno => {
      Object.keys(alumno.pagosPorRubro).forEach(rubroIdStr => {
        const rubroId = parseInt(rubroIdStr);
        if (alumno.pagosPorRubro[rubroId]) {
          Object.keys(alumno.pagosPorRubro[rubroId]).forEach(paymentIdxStr => {
            const paymentIdx = parseInt(paymentIdxStr);
            const payment = alumno.pagosPorRubro[rubroId][paymentIdx];
            
            // Ensure the payment has the notas property (even if null or empty)
            if (payment && !('notas' in payment)) {
              payment.notas = '';
            }
          });
        }
      });
    });
    
    return normalizedData;
  };
  
  // Fetch report data based on filters
  const fetchReportData = async () => {
    if (!selectedGradoId) {
      message.warning('Por favor seleccione un grado.');
      return;
    }

    setLoading(true);
    setError(null);    try {
      const data = await makeApiRequest<PaymentReportResponse>(
        `/pagos/report?cicloEscolar=${selectedYear}&gradoId=${selectedGradoId}`, 
        'GET'
      );
      
      // Normalize the data to ensure all payments have the notas property
      const normalizedData = normalizeReportData(data);
      setReportData(normalizedData);
      
      if (normalizedData.alumnos.length === 0) {
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
  };  // Helper function to get the carnet value from student payments
  const getCarnetValue = (student: PagoReportStudent): React.ReactNode => {
    // Search through all payments to find a carnet payment
    for (const rubroId in student.pagosPorRubro) {
      const payments = student.pagosPorRubro[rubroId];
      for (const paymentIndex in payments) {
        const payment = payments[paymentIndex];
        if (payment.esPagoDeCarnet) {
          // If estadoCarnet is null or empty, return empty value
          if (!payment.estadoCarnet || payment.estadoCarnet.trim() === '') {
            return '-';
          }
          
          // If estadoCarnet is PAGADO, return the amount as currency
          if (payment.estadoCarnet === 'PAGADO') {
            return `Q${payment.monto.toFixed(2)}`;
          }
          
          // If estadoCarnet is ENTREGADO, return the text
          if (payment.estadoCarnet === 'ENTREGADO') {
            return 'ENTREGADO';
          }
          
          // For any other value, return the estadoCarnet as-is
          return payment.estadoCarnet;
        }
      }
    }
    
    // If no carnet payment is found, return empty
    return '-';
  };
  // Helper function to render payment cell with notes tooltip if applicable
  const renderPaymentCell = (payment: PagoReportItem | undefined) => {
    if (!payment) return '-';
    
    // First check if it's a carnet payment and handle special carnet display logic
    if (payment.esPagoDeCarnet) {
      // If estadoCarnet is null or empty, return empty value
      if (!payment.estadoCarnet || payment.estadoCarnet.trim() === '') {
        return '-';
      }
      
      // If estadoCarnet is PAGADO, return the amount as currency
      if (payment.estadoCarnet === 'PAGADO') {
        const amount = `Q${payment.monto.toFixed(2)}`;
        return payment.notas && payment.notas.trim() ? (
          <Space size="small">
            {amount}
            <Tooltip title={payment.notas}>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          </Space>
        ) : amount;
      }
      
      // If estadoCarnet is ENTREGADO, return the text
      if (payment.estadoCarnet === 'ENTREGADO') {
        return payment.notas && payment.notas.trim() ? (
          <Space size="small">
            ENTREGADO
            <Tooltip title={payment.notas}>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          </Space>
        ) : 'ENTREGADO';
      }
      
      // For any other value, return the estadoCarnet as-is
      return payment.notas && payment.notas.trim() ? (
        <Space size="small">
          {payment.estadoCarnet}
          <Tooltip title={payment.notas}>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
          </Tooltip>
        </Space>
      ) : payment.estadoCarnet;
    }
    
    // Regular payment display (non-carnet)
    const amount = `Q${payment.monto.toFixed(2)}`;
    
    // If payment has notes, add an info icon with tooltip
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
      },      {
        title: 'Nombre del Alumno',
        dataIndex: 'nombreCompleto',
        key: 'nombreCompleto',
        width: 250,
        fixed: 'left' as const,
        className: 'student-info-column',
      },
      {
        title: 'Pendientes',
        dataIndex: 'notas',
        key: 'notas',
        width: 200,
        fixed: 'left' as const,
        className: 'student-info-column',
        render: (notas: string) => {
          if (!notas || !notas.trim()) return '-';
          return (
            <Tooltip title={notas} placement="topLeft">
              <span style={{ cursor: 'pointer', color: '#1890ff' }}>
                {notas.length > 30 ? `${notas.substring(0, 30)}...` : notas}
              </span>
            </Tooltip>
          );
        },
      },      {
        title: 'NIT',
        dataIndex: 'nit',
        key: 'nit',
        width: 120,
        fixed: 'left' as const,
        className: 'student-info-column',
      },      {
        title: 'CARNÉ',
        key: 'carnet',
        width: 120,
        fixed: 'left' as const,
        className: 'student-info-column',
        hidden: true, // Hide this column
        render: (_: unknown, record: PagoReportStudent) => getCarnetValue(record),
      },
    ];

    // Dynamic columns based on rubros
    const dynamicColumns = [];
    
    for (const rubro of reportData.rubros) {      if (rubro.esColegiatura) {
        // For colegiatura, create a column group with months as children
        dynamicColumns.push({
          title: rubro.descripcion,
          key: `rubro-${rubro.id}`,
          className: 'colegiatura-header', // Add class for styling
          children: MONTH_NAMES.map((month, index) => {
            // Add className for bimester dividers (every 2 months)
            const isBimesterDivider = (index + 1) % 2 === 0 && index < 9;
            const className = `colegiatura-month payment-column${isBimesterDivider ? ' bimester-divider' : ''}`;
              return {
              title: month,
              key: `rubro-${rubro.id}-month-${index + 1}`,
              width: 100,
              className, // Add classes for styling
              render: (_: unknown, record: PagoReportStudent) => {
                const payments = record.pagosPorRubro[rubro.id];
                const monthPayment = payments && payments[index + 1];
                return renderPaymentCell(monthPayment);
              }
            };
          }),
        });
      } else {
        // For non-colegiatura, create a single column
        dynamicColumns.push({
          title: rubro.descripcion,
          key: `rubro-${rubro.id}`,
          width: 120,          className: 'payment-column', // Add class for styling          
          render: (_: unknown, record: PagoReportStudent) => {
            const payments = record.pagosPorRubro[rubro.id];
            const payment = payments && payments[0];
            return renderPaymentCell(payment);
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
        }      };
        // Create header row with styles
      const headerRow: Array<XLSXStyledCell> = [
        { v: '#', s: headerStyle },
        { v: 'Nombre del Alumno', s: headerStyle },
        { v: 'Observaciones', s: headerStyle },
        { v: 'NIT', s: headerStyle }
        // Removed CARNÉ column from Excel export
      ];
      
      // Add rubro headers
      reportData.rubros.forEach(rubro => {
        if (rubro.esColegiatura) {
          // For colegiatura, add one column per month
          MONTH_NAMES.forEach((monthName, index) => {            // Check if this is a bimester divider (every 2 months)
            const isBimesterDivider = (index + 1) % 2 === 0 && index < 9;
            
            const cellStyle = { ...headerStyle };
            if (isBimesterDivider) {
              // Add right border for bimester dividers
              cellStyle.border = {
                ...cellStyle.border,
                right: { style: 'thin', color: { rgb: "91CAFF" } } // Lighter blue right border
              };
            }
            
            headerRow.push({ 
              v: `${rubro.descripcion} - ${monthName}`, 
              s: cellStyle 
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
        const pStyle = isEvenRow ? paymentStyleAlt : paymentStyle;          const row: Array<XLSXStyledCell> = [
          { v: student.numeroOrdinal, s: studentStyle },
          { v: student.nombreCompleto, s: studentStyle },
          { v: student.notas || '-', s: studentStyle },
          { v: student.nit, s: studentStyle }
          // Removed CARNÉ column from Excel export
        ];

        // Add data for each rubro
        reportData.rubros.forEach(rubro => {
          const payments = student.pagosPorRubro[rubro.id];
            if (rubro.esColegiatura) {
            // For colegiatura, add one column per month
            MONTH_NAMES.forEach((_, index) => {
              const monthPayment = payments && payments[index + 1];
                // Check if this is a bimester divider (every 2 months)
              const isBimesterDivider = (index + 1) % 2 === 0 && index < 9;
              
              // Clone the style to avoid modifying the original
              const cellStyle = { ...pStyle };
              if (isBimesterDivider) {
                // Add right border for bimester dividers
                cellStyle.border = {
                  ...cellStyle.border,
                  right: { style: 'thin', color: { rgb: "91CAFF" } } // Lighter blue right border
                };
              }
                let cellValue = '-';
              if (monthPayment) {
                cellValue = `Q${monthPayment.monto.toFixed(2)}`;
                // Add note indicator if present
                if (monthPayment.notas && monthPayment.notas.trim()) {
                  cellValue += ' *';  // Add asterisk to indicate notes
                }
              }
              
              row.push({ 
                v: cellValue, 
                s: cellStyle
              });
            });          }else {
            // For non-colegiatura, add a single column
            const payment = payments && payments[0];            
            let cellValue = '-';
            
            if (payment) {
              // Handle carnet payments specially
              if (payment.esPagoDeCarnet) {
                if (!payment.estadoCarnet || payment.estadoCarnet.trim() === '') {
                  cellValue = '-';
                } else if (payment.estadoCarnet === 'PAGADO') {
                  cellValue = `Q${payment.monto.toFixed(2)}`;
                } else if (payment.estadoCarnet === 'ENTREGADO') {
                  cellValue = 'ENTREGADO';
                } else {
                  cellValue = payment.estadoCarnet;
                }
              } else {
                // Regular payment
                cellValue = `Q${payment.monto.toFixed(2)}`;
              }
              
              // Add note indicator if present
              if (payment.notas && payment.notas.trim()) {
                cellValue += ' *';  // Add asterisk to indicate notes
              }
            }
            
            row.push({ 
              v: cellValue, 
              s: pStyle 
            });
          }
        });
        
        excelData.push(row);
      });
      
      // Create worksheet with formatted data
      const ws = XLSX.utils.aoa_to_sheet(excelData);      // Set column widths
      const colWidths: Array<{ wch: number }> = [
        { wch: 6 },   // # column
        { wch: 40 },  // Nombre del Alumno
        { wch: 30 },  // Observaciones
        { wch: 15 }   // NIT
        // Removed CARNÉ column from Excel export
      ];
      
      // Add width for other columns
      for (let i = 3; i < headerRow.length; i++) {
        colWidths.push({ wch: 15 }); // Width for all other columns
      }
      
      ws['!cols'] = colWidths;
      
      // Create a second worksheet for notes explanation
      const legendSheet = XLSX.utils.aoa_to_sheet([
        [{ v: '* El asterisco indica que el pago tiene notas asociadas.', s: {
          font: { bold: true },
          alignment: { horizontal: "left", vertical: "center" }
        }}]
      ]);
      
      // Add worksheets to the workbook
      XLSX.utils.book_append_sheet(wb, ws, 'ReportePagos');
      XLSX.utils.book_append_sheet(wb, legendSheet, 'Leyenda');

      // Save the file with styling
      const fileName = `ReportePagos_${selectedYear}_Grado${selectedGradoId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      message.success('Reporte exportado exitosamente con colores similares al reporte en pantalla.');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      message.error('Error al exportar a Excel');
    }  };

  return (
    <div className="payment-report-container">
      <div className="payment-report-header">
        <Title level={2}>Control de Pagos</Title>
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
            <Space style={{ marginTop: 32 }} wrap>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchGrados}
                size="middle"
              >
                Refrescar
              </Button>
              
              <Button 
                icon={<DownloadOutlined />} 
                onClick={exportToExcel}
                disabled={!reportData || reportData.alumnos.length === 0}
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
      
      {/* Add a legend for notes */}
      {reportData && reportData.alumnos.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center' }}>
          <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          <Typography.Text type="secondary">El ícono indica que el pago tiene notas asociadas. Pase el cursor sobre el ícono para verlas.</Typography.Text>
        </div>
      )}
    </div>
  );
};

export default PaymentReport;
