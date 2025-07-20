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
}

interface PaymentHistoryTableProps {
  payments: Payment[];
  onShowQRCode: (payment: Payment) => void;
  title?: string;
  filterFunction?: (payment: Payment) => boolean;
  useCard?: boolean; // Whether to wrap in Card component (for UniformPayments)
  showStatusColumn?: boolean; // Whether to show the Estado column (for Tuitions)
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
  customColumns,
  containerStyle = { marginBottom: "20px" }
}) => {
  const [showAllPayments, setShowAllPayments] = useState<boolean>(false);

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
      width: showStatusColumn ? 120 : undefined,
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      render: (monto: number) => `Q${monto.toLocaleString()}`,
      width: showStatusColumn ? 120 : undefined,
    },
    {
      title: showStatusColumn ? 'Tipo' : 'Concepto',
      dataIndex: 'rubroDescripcion',
      key: 'rubroDescripcion',
      width: showStatusColumn ? 150 : undefined,
    },
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
      width: showStatusColumn ? 100 : undefined,
    },
  ];

  // Use custom columns if provided, otherwise use default
  const columns = customColumns || defaultColumns;

  const tableContent = (
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
  );

  // Don't render anything if no payments
  if (!payments || payments.length === 0) {
    return null;
  }

  // Don't render if filtered payments is empty
  if (filteredPayments.length === 0) {
    return null;
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
