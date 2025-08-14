import React, { useState } from 'react';
import { Table, Button, Tag, Space, Typography, Card, Divider } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;

// Payment interface that can work with different payment types
interface Payment {
  id: number;
  fecha: string;
  monto: number;
  rubroDescripcion: string;
  esAnulado?: boolean;
  notas?: string;
  mesColegiatura?: number;
  esColegiatura?: boolean;
  esPagoDeTransporte?: boolean;
}

interface PaymentHistoryTableProps {
  payments: Payment[];
  onShowQRCode: (payment: Payment) => void;
  title?: string;
  filterFunction?: (payment: Payment) => boolean;
  useCard?: boolean; // Whether to wrap in Card component (for UniformPayments)
  showStatusColumn?: boolean; // Whether to show the Estado column (for Tuitions)
  showMonthColumn?: boolean; // Whether to show the Mes column (for Tuitions and TransportPayments)
  hideConceptoColumn?: boolean; // Whether to hide the Concepto column (for TransportPayments)
  showEmptyState?: boolean; // Whether to show empty state instead of returning null
  customColumns?: ColumnsType<Payment>; // Allow for custom columns if needed
  containerStyle?: React.CSSProperties;
}

const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  payments,
  onShowQRCode,
  title = "Historial de Pagos",
  filterFunction,
  useCard = false,
  showStatusColumn = false,
  showMonthColumn = false,
  hideConceptoColumn = false,
  showEmptyState = false,
  customColumns,
  containerStyle = { marginBottom: "20px" }
}) => {
  const [showAllPayments, setShowAllPayments] = useState<boolean>(false);

  // Function to convert month number to Spanish month name
  const getMonthName = (monthNumber: number): string => {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[monthNumber - 1] || monthNumber.toString();
  };

  // Filter payments if a filter function is provided
  const filteredPayments = filterFunction 
    ? payments.filter(filterFunction)
    : payments;

  // Sort by newest first
  const sortedPayments = filteredPayments
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const displayedPayments = showAllPayments ? sortedPayments : sortedPayments.slice(0, 3);
  const hasMorePayments = sortedPayments.length > 3;

  // Default columns configuration
  const defaultColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY'),
      width: showStatusColumn || showMonthColumn ? 120 : undefined,
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      render: (monto: number) => `Q${monto.toLocaleString()}`,
      width: showStatusColumn || showMonthColumn ? 120 : undefined,
    },
    // Show Mes column only for Tuitions and TransportPayments
    ...(showMonthColumn ? [{
      title: 'Mes',
      dataIndex: 'mesColegiatura',
      key: 'mesColegiatura',
      render: (mes: number) => mes ? getMonthName(mes) : '-',
      width: 100,
    }] : []),
    // Show Concepto column only if not explicitly hidden
    // This allows OtherPayments to show concepto even with status column
    ...(!hideConceptoColumn ? [{
      title: 'Concepto',
      dataIndex: 'rubroDescripcion',
      key: 'rubroDescripcion',
    }] : []),
    ...(showStatusColumn ? [{
      title: 'Estado',
      dataIndex: 'esAnulado',
      key: 'esAnulado',
      render: (esAnulado: boolean) => (
        <Tag color={esAnulado ? "red" : "green"}>
          {esAnulado ? "Anulado" : "Activo"}
        </Tag>
      ),
      width: 100,
    }] : []),
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: unknown, record: Payment) => (
        showStatusColumn ? (
          <Space size="small">
            {!record.esAnulado && (
              <Button
                size="small"
                icon={<QrcodeOutlined />}
                onClick={() => onShowQRCode(record)}
                title="Código QR"
              />
            )}
          </Space>
        ) : (
          <Button
            type="link"
            icon={<QrcodeOutlined />}
            onClick={() => onShowQRCode(record)}
            disabled={record.esAnulado}
          >
            {record.esAnulado ? "Anulado" : "Ver QR"}
          </Button>
        )
      ),
      width: showStatusColumn || showMonthColumn ? 100 : undefined,
    },
  ];

  // Use custom columns if provided, otherwise use default
  const columns = customColumns || defaultColumns;

  // Create empty state message
  const emptyStateContent = (
    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
      <p>No hay pagos registrados para mostrar.</p>
    </div>
  );

  const tableContent = (
    <>
      {displayedPayments.length > 0 ? (
        <>
          <Table
            dataSource={displayedPayments.map(payment => ({ ...payment, key: payment.id }))}
            columns={columns}
            pagination={false}
            size="small"
            rowKey="id"
          />
          {hasMorePayments && (
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <Button 
                type="link" 
                onClick={() => setShowAllPayments(!showAllPayments)}
                style={{ padding: 0 }}
              >
                {showAllPayments ? 'Ver menos...' : 'Ver más...'}
              </Button>
            </div>
          )}
        </>
      ) : showEmptyState ? (
        emptyStateContent
      ) : null}
    </>
  );

  // Don't render anything if no payments and not showing empty state
  if (!payments || payments.length === 0) {
    return showEmptyState ? (
      showStatusColumn ? (
        <div style={containerStyle}>
          <Divider />
          <h3>{title}</h3>
          {emptyStateContent}
        </div>
      ) : useCard ? (
        <Card title={title} style={containerStyle}>
          {emptyStateContent}
        </Card>
      ) : (
        <div style={containerStyle}>
          <Title level={4}>{title}</Title>
          {emptyStateContent}
        </div>
      )
    ) : null;
  }

  // Don't render if filtered payments is empty and not showing empty state
  if (filteredPayments.length === 0) {
    return showEmptyState ? (
      showStatusColumn ? (
        <div style={containerStyle}>
          <Divider />
          <h3>{title}</h3>
          {emptyStateContent}
        </div>
      ) : useCard ? (
        <Card title={title} style={containerStyle}>
          {emptyStateContent}
        </Card>
      ) : (
        <div style={containerStyle}>
          <Title level={4}>{title}</Title>
          {emptyStateContent}
        </div>
      )
    ) : null;
  }

  // Render with Card wrapper for UniformPayments
  if (useCard) {
    return (
      <Card title={title} style={containerStyle}>
        {tableContent}
      </Card>
    );
  }

  // Render with Divider for Tuitions (special case)
  if (showStatusColumn) {
    return (
      <div style={containerStyle}>
        <Divider />
        <h3>{title}</h3>
        {tableContent}
      </div>
    );
  }

  // Default render for TransportPayments and OtherPayments
  return (
    <div style={containerStyle}>
      <Title level={4}>{title}</Title>
      {tableContent}
    </div>
  );
};

export default PaymentHistoryTable;
