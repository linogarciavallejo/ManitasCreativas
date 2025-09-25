import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Button,
  Spin,
  Alert,
  Typography,
  Space,
  Divider,
  message,
} from "antd";
import { ReloadOutlined, PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  qrCodeService,
  QRCodeGenerateRequest,
  QRCodeGenerateResponse,
} from "../../services/qrCodeService";

const { Title, Text, Paragraph } = Typography;

// Helper function to convert month number to Spanish month name
const getSpanishMonthName = (month: number): string => {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return months[month - 1] || "Mes no válido";
};

// Helper function to convert PascalCase to readable format with spaces
const formatPascalCase = (text: string): string => {
  return text.replace(/([A-Z])/g, ' $1').trim();
};

// Unified payment interface that can work with both Pago and TuitionPayment
interface PaymentData {
  id: number;
  fecha: string;
  monto: number;
  rubroDescripcion: string;
  esAnulado?: boolean;
  notas?: string;
  // For EditPayments (Pago)
  alumnoNombre?: string;
  // For Tuitions
  esColegiatura?: boolean;
  mesColegiatura?: number;
  anioColegiatura?: number;
  // For Transport payments
  esPagoDeTransporte?: boolean;
  // Payment method
  medioPagoDescripcion?: string;
  // Student grade and education level
  gradoNombre?: string;
  nivelEducativoDescripcion?: string;
  seccion?: string;
}

interface QRCodeModalProps {
  payment: PaymentData | null;
  studentName?: string; // For Tuitions when alumnoNombre is not in payment object
  visible: boolean;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  payment,
  studentName,
  visible,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<QRCodeGenerateResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const loadOrGenerateQRCode = useCallback(async () => {
    if (!payment) return;

    setLoading(true);
    setError(null);

    try {
      // Generate QR code (will return existing one if it exists)
      const request: QRCodeGenerateRequest = {
        pagoId: payment.id,
        // expirationMinutes is optional, will default to 1 year on backend
      };

      const qrCodeResponse = await qrCodeService.generateQRCode(request);
      setQrCodeData(qrCodeResponse);
      message.success("Código QR cargado exitosamente");
    } catch (err) {
      console.error("Error loading/generating QR code:", err);
      setError("Error al generar el código QR. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [payment]);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (visible && payment && !payment.esAnulado) {
      loadOrGenerateQRCode();
    }

    // Reset states when modal closes
    if (!visible) {
      setQrCodeData(null);
      setError(null);
    }
  }, [visible, payment, loadOrGenerateQRCode]);

  const handleRegenerateQR = () => {
    setQrCodeData(null);
    loadOrGenerateQRCode();
  };

  if (!payment) return null;

  // Get student name from payment object or prop
  const displayStudentName = payment.alumnoNombre || studentName || "N/A";

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
          <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
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
      className="qr-code-modal qr-code-modal-shared"
    >
      {payment.esAnulado ? (
        <Alert
          message="Pago Anulado"
          description="No se puede generar código QR para un pago anulado."
          type="warning"
          showIcon
        />
      ) : (
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
                <Title level={4}>Colegio Manitas Creativas</Title>
                <Title level={5}>Comprobante de Pago</Title>
                <Paragraph>
                  Este código QR sirve como comprobante digital de tu pago.
                  Válido hasta:{" "}
                  <Text strong>
                    {dayjs(qrCodeData.fechaExpiracion).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </Text>
                </Paragraph>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "20px",
                  backgroundColor: "#fafafa",
                  borderRadius: "8px",
                }}
              >
                <img
                  src={qrCodeData.qrCodeImageBase64}
                  alt="QR Code"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    backgroundColor: "white",
                    padding: "10px",
                    borderRadius: "4px",
                  }}
                />
              </div>

              <Divider />

              <Space direction="vertical" style={{ width: "100%" }}>
                <Text>
                  <strong>Estudiante:</strong> {displayStudentName}
                </Text>
                <Text>
                  <strong>Concepto:</strong> {payment.rubroDescripcion}
                  {(payment.gradoNombre || payment.nivelEducativoDescripcion || payment.seccion) && (
                    <span>
                      {" "}
                      {[
                        payment.gradoNombre,
                        payment.nivelEducativoDescripcion,
                        payment.seccion ? `Sección: ${payment.seccion}` : null
                      ].filter(Boolean).join(" • ")}
                    </span>
                  )}
                </Text>
                {payment.esColegiatura &&
                  payment.mesColegiatura &&
                  payment.anioColegiatura && (
                    <Text>
                      <strong>Colegiatura:</strong>{" "}
                      {getSpanishMonthName(payment.mesColegiatura)}{" "}
                      {payment.anioColegiatura}
                    </Text>
                  )}
                {payment.esPagoDeTransporte &&
                  payment.mesColegiatura &&
                  payment.anioColegiatura && (
                    <Text>
                      <strong>Mes:</strong>{" "}
                      {getSpanishMonthName(payment.mesColegiatura)}{" "}
                      {payment.anioColegiatura}
                    </Text>
                  )}
                <Text>
                  <strong>Monto:</strong> Q{payment.monto.toLocaleString()}
                </Text>
                <Text>
                  <strong>Fecha de Pago:</strong>{" "}
                  {dayjs(payment.fecha).format("DD/MM/YYYY")}
                </Text>
                {payment.medioPagoDescripcion && (
                  <Text>
                    <strong>Medio de Pago:</strong> {formatPascalCase(payment.medioPagoDescripcion)}
                  </Text>
                )}
                {qrCodeData.pagoInfo && (
                  <Text>
                    <strong>Información:</strong> {qrCodeData.pagoInfo}
                  </Text>
                )}
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

// Unified print-specific CSS that works reliably
const printStyles = `
  @media print {
    @page {
      margin: 0.5in;
      size: letter;
    }
    
    /* Hide everything first */
    body * {
      visibility: hidden;
    }
    
    /* Show only our modal content */
    .qr-code-modal-shared,
    .qr-code-modal-shared * {
      visibility: visible !important;
    }
    
    /* Position and style the modal */
    .qr-code-modal-shared {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      height: auto !important;
      background: white !important;
    }
    
    /* Reset modal styles */
    .qr-code-modal-shared .ant-modal-mask,
    .qr-code-modal-shared .ant-modal-wrap {
      position: static !important;
      background: white !important;
    }
    
    .qr-code-modal-shared .ant-modal {
      position: static !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      background: white !important;
    }
    
    .qr-code-modal-shared .ant-modal-content {
      box-shadow: none !important;
      border: none !important;
      background: white !important;
    }
    
    /* Hide header, footer, and info alerts */
    .qr-code-modal-shared .ant-modal-header,
    .qr-code-modal-shared .ant-modal-footer,
    .qr-code-modal-shared .ant-alert[class*="info"] {
      display: none !important;
    }
    
    /* Style the body */
    .qr-code-modal-shared .ant-modal-body {
      padding: 20pt !important;
      background: white !important;
    }
    
    /* Typography */
    .qr-code-modal-shared h4 {
      font-size: 16pt !important;
      margin: 10pt 0 !important;
      text-align: center !important;
      color: black !important;
    }
    
    .qr-code-modal-shared p {
      font-size: 12pt !important;
      margin: 8pt 0 !important;
      text-align: center !important;
      color: black !important;
    }
    
    .qr-code-modal-shared span {
      font-size: 12pt !important;
      color: black !important;
    }
    
    /* QR Code */
    .qr-code-modal-shared img {
      display: block !important;
      margin: 15pt auto !important;
      max-width: 150pt !important;
      max-height: 150pt !important;
      background: white !important;
    }
    
    /* Spacing */
    .qr-code-modal-shared .ant-space-item {
      margin-bottom: 5pt !important;
    }
    
    .qr-code-modal-shared .ant-divider {
      margin: 10pt 0 !important;
      border-top: 1pt solid #ccc !important;
    }
    
    /* Make sure all text is black */
    .qr-code-modal-shared * {
      color: black !important;
      background: white !important;
    }
    
    /* Hide any other modals */
    .qr-code-modal:not(.qr-code-modal-shared) {
      display: none !important;
    }
  }
`;

// Inject styles with unique ID
if (
  typeof document !== "undefined" &&
  !document.getElementById("qr-print-styles-shared")
) {
  const style = document.createElement("style");
  style.id = "qr-print-styles-shared";
  style.textContent = printStyles;
  document.head.appendChild(style);
}

export default QRCodeModal;
