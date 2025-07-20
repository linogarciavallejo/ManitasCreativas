import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Spin, Alert, Typography, Space, Divider, message } from "antd";
import { ReloadOutlined, PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Pago } from "../../services/pagoService";
import { qrCodeService, QRCodeGenerateRequest, QRCodeGenerateResponse } from "../../services/qrCodeService";

const { Title, Text, Paragraph } = Typography;

interface QRCodeModalProps {
  payment: Pago | null;
  visible: boolean;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  payment,
  visible,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<QRCodeGenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOrGenerateQRCode = useCallback(async () => {
    console.log('[QRCodeModal] loadOrGenerateQRCode called for payment:', payment);
    if (!payment) {
      console.log('[QRCodeModal] No payment provided, returning');
      return;
    }

    console.log('[QRCodeModal] Starting QR code load/generation process for payment ID:', payment.id);
    setLoading(true);
    setError(null);

    try {
      // Generate QR code (will return existing one if it exists)
      console.log('[QRCodeModal] Generating QR code for payment:', payment.id);
      const request: QRCodeGenerateRequest = {
        pagoId: payment.id,
        // expirationMinutes is optional, will default to 1 year on backend
      };

      console.log('[QRCodeModal] Generating QR code with request:', request);
      const qrCodeResponse = await qrCodeService.generateQRCode(request);
      console.log('[QRCodeModal] QR code response:', qrCodeResponse);
      setQrCodeData(qrCodeResponse);
      message.success("Código QR cargado exitosamente");
    } catch (err) {
      console.error("[QRCodeModal] Error loading/generating QR code:", err);
      setError("Error al generar el código QR. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
      console.log('[QRCodeModal] loadOrGenerateQRCode completed');
    }
  }, [payment]);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    console.log('[QRCodeModal] useEffect triggered - visible:', visible, 'payment:', payment, 'esAnulado:', payment?.esAnulado);
    if (visible && payment && !payment.esAnulado) {
      console.log('[QRCodeModal] Conditions met, calling loadOrGenerateQRCode...');
      loadOrGenerateQRCode();
    } else {
      console.log('[QRCodeModal] Conditions not met for QR code generation');
    }
    
    // Reset states when modal closes
    if (!visible) {
      console.log('[QRCodeModal] Modal closing, resetting states');
      setQrCodeData(null);
      setError(null);
    }
  }, [visible, payment, loadOrGenerateQRCode]);

  const handleRegenerateQR = () => {
    setQrCodeData(null);
    loadOrGenerateQRCode();
  };

  if (!payment) return null;

  const modalTitle = `Código QR - Pago #${payment.id}`;

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Cerrar
        </Button>,
        qrCodeData && (
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            Imprimir
          </Button>
        ),
        qrCodeData && (
          <Button
            key="regenerate"
            icon={<ReloadOutlined />}
            onClick={handleRegenerateQR}
            loading={loading}
          >
            Regenerar QR
          </Button>
        ),
      ]}
      width={600}
      className="qr-code-modal qr-code-modal-edit"
    >
      {payment.esAnulado ? (
        <Alert
          message="Pago Anulado"
          description="No se puede generar código QR para un pago anulado."
          type="warning"
          showIcon
        />
      ) : (
        // QR Code Display Mode
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>Generando código QR...</Text>
              </div>
            </div>
          ) : error ? (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              action={
                <Button size="small" onClick={handleRegenerateQR}>
                  Reintentar
                </Button>
              }
            />
          ) : qrCodeData ? (
            <>
              <div style={{ textAlign: "center" }}>
                <Title level={4}>Comprobante de Pago</Title>
                <Paragraph>
                  Este código QR sirve como comprobante digital de tu pago.
                  Válido hasta: <Text strong>{dayjs(qrCodeData.fechaExpiracion).format("DD/MM/YYYY HH:mm")}</Text>
                </Paragraph>
              </div>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                padding: "20px",
                backgroundColor: "#fafafa",
                borderRadius: "8px"
              }}>
                <img
                  src={qrCodeData.qrCodeImageBase64}
                  alt="QR Code"
                  style={{ 
                    maxWidth: "200px", 
                    maxHeight: "200px",
                    backgroundColor: "white",
                    padding: "10px",
                    borderRadius: "4px"
                  }}
                />
              </div>

              <Divider />
              
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text><strong>Estudiante:</strong> {payment.alumnoNombre || 'N/A'}</Text>
                <Text><strong>Concepto:</strong> {payment.notas || "Pago de colegiatura"}</Text>
                <Text><strong>Tipo:</strong> {payment.rubroDescripcion || 'N/A'}</Text>
                <Text><strong>Monto:</strong> Q{payment.monto.toLocaleString()}</Text>
                <Text><strong>Fecha de Pago:</strong> {dayjs(payment.fecha).format("DD/MM/YYYY")}</Text>
                {qrCodeData.pagoInfo && <Text><strong>Información:</strong> {qrCodeData.pagoInfo}</Text>}
              </Space>

              <Alert
                message="Información Importante"
                description="Guarda o toma una captura de pantalla de este código QR como comprobante de tu pago. Puedes volver a generarlo desde aquí en cualquier momento."
                type="info"
                showIcon
              />
            </>
          ) : null}
        </Space>
      )}
    </Modal>
  );
};

// Add print-specific CSS
const printStyles = `
  @media print {
    .ant-modal-mask,
    .ant-modal-wrap .ant-modal {
      position: static !important;
      width: 100% !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
    }
    
    .ant-modal-content {
      box-shadow: none !important;
      border: none !important;
    }
    
    .ant-modal-header,
    .ant-modal-footer {
      display: none !important;
    }
    
    .ant-modal-body {
      padding: 20px !important;
    }
    
    .qr-code-modal-edit .ant-space {
      page-break-inside: avoid;
    }
    
    .qr-code-modal-edit img {
      display: block !important;
      margin: 0 auto !important;
    }
    
    .qr-code-modal-edit .ant-alert {
      display: none !important;
    }
    
    body * {
      visibility: hidden;
    }
    
    .qr-code-modal-edit,
    .qr-code-modal-edit * {
      visibility: visible;
    }
    
    .qr-code-modal-edit {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    
    /* Hide other modal variants when printing this one */
    .qr-code-modal:not(.qr-code-modal-edit) {
      display: none !important;
    }
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('qr-print-styles-edit')) {
  const style = document.createElement('style');
  style.id = 'qr-print-styles-edit';
  style.textContent = printStyles;
  document.head.appendChild(style);
}

export default QRCodeModal;
