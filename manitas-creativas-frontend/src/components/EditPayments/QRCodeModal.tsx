import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Spin, Alert, Typography, Space, Divider, message, Input } from "antd";
import { QrcodeOutlined, CheckCircleOutlined, ExclamationCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Pago } from "../../services/pagoService";
import { qrCodeService, QRCodeGenerateRequest, QRCodeGenerateResponse, QRCodeValidateResponse } from "../../services/qrCodeService";

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
  
  // Validation state
  const [validationMode, setValidationMode] = useState(false);
  const [validationInput, setValidationInput] = useState("");
  const [validationResult, setValidationResult] = useState<QRCodeValidateResponse | null>(null);
  const [validating, setValidating] = useState(false);

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
      setValidationMode(false);
      setValidationInput("");
      setValidationResult(null);
    }
  }, [visible, payment, loadOrGenerateQRCode]);

  const handleValidateQR = async () => {
    if (!validationInput.trim()) {
      message.warning("Por favor ingresa los datos del código QR");
      return;
    }

    setValidating(true);
    setValidationResult(null);

    try {
      const result = await qrCodeService.validateQRCode({ token: validationInput.trim() });
      setValidationResult(result);
      
      if (result.isValid) {
        message.success("Código QR válido");
      } else {
        message.error(result.message);
      }
    } catch (err) {
      console.error("Error validating QR code:", err);
      message.error("Error al validar el código QR");
    } finally {
      setValidating(false);
    }
  };

  const handleRegenerateQR = () => {
    setQrCodeData(null);
    loadOrGenerateQRCode();
  };

  if (!payment) return null;

  const modalTitle = validationMode ? "Validar Código QR" : `Código QR - Pago #${payment.id}`;

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Cerrar
        </Button>,
        !validationMode && qrCodeData && (
          <Button
            key="regenerate"
            icon={<ReloadOutlined />}
            onClick={handleRegenerateQR}
            loading={loading}
          >
            Regenerar QR
          </Button>
        ),
        <Button
          key="toggle"
          type={validationMode ? "default" : "primary"}
          icon={<QrcodeOutlined />}
          onClick={() => setValidationMode(!validationMode)}
        >
          {validationMode ? "Ver Mi QR" : "Validar QR"}
        </Button>,
      ]}
      width={600}
    >
      {payment.esAnulado ? (
        <Alert
          message="Pago Anulado"
          description="No se puede generar código QR para un pago anulado."
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
        />
      ) : validationMode ? (
        // Validation Mode
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Title level={4}>Validación de Código QR</Title>
          <Paragraph>
            Ingresa los datos del código QR que deseas validar:
          </Paragraph>
          
          <Input.TextArea
            placeholder="Pega aquí los datos del código QR..."
            value={validationInput}
            onChange={(e) => setValidationInput(e.target.value)}
            rows={4}
          />
          
          <Button
            type="primary"
            onClick={handleValidateQR}
            loading={validating}
            block
          >
            Validar Código QR
          </Button>

          {validationResult && (
            <Alert
              message={validationResult.isValid ? "Código QR Válido" : "Código QR Inválido"}
              description={validationResult.message}
              type={validationResult.isValid ? "success" : "error"}
              icon={validationResult.isValid ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
              showIcon
            />
          )}

          {validationResult?.isValid && (validationResult.alumnoNombre || validationResult.rubroDescripcion) && (
            <>
              <Divider />
              <Title level={5}>Información del Pago</Title>
              <Space direction="vertical" style={{ width: "100%" }}>
                {validationResult.alumnoNombre && <Text><strong>Estudiante:</strong> {validationResult.alumnoNombre}</Text>}
                {validationResult.rubroDescripcion && <Text><strong>Tipo:</strong> {validationResult.rubroDescripcion}</Text>}
                {validationResult.montosPago && <Text><strong>Monto:</strong> Q{validationResult.montosPago.toLocaleString()}</Text>}
                {validationResult.fechaPago && <Text><strong>Fecha de Pago:</strong> {dayjs(validationResult.fechaPago).format("DD/MM/YYYY")}</Text>}
                {validationResult.pagoId && <Text><strong>ID de Pago:</strong> {validationResult.pagoId}</Text>}
              </Space>
            </>
          )}
        </Space>
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
                <Text><strong>Estudiante:</strong> {payment.alumnoNombre}</Text>
                <Text><strong>Concepto:</strong> {payment.notas}</Text>
                <Text><strong>Tipo:</strong> {payment.rubroDescripcion}</Text>
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

export default QRCodeModal;
