import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Card, Spin, Alert, Typography, Space, Button, Divider, Tag, Row, Col } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { QRCodeValidateResponse } from "../../services/qrCodeService";

const { Title, Text } = Typography;

const QRValidation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token: urlToken } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [validation, setValidation] = useState<QRCodeValidateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get token from URL params or search params
  const token = urlToken || searchParams.get('token') || searchParams.get('t');

  const validateQRCode = async (tokenToValidate: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[QRValidation] Validating token:', tokenToValidate);
      
      // Make API call directly without authentication for QR validation
      const response = await fetch('https://localhost:7144/api/qrcode/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToValidate }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[QRValidation] Validation result:', result);
      setValidation(result);
    } catch (err) {
      console.error('[QRValidation] Error validating QR code:', err);
      setError('Error al validar el código QR. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      validateQRCode(token);
    } else {
      setLoading(false);
      setError('No se proporcionó un token válido en la URL.');
    }
  }, [token]);

  const handleRetry = () => {
    if (token) {
      validateQRCode(token);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <Card style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 16 }}>
            Validando Código QR...
          </Title>
          <Text type="secondary">
            Por favor espera mientras verificamos el pago
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <Card style={{ marginBottom: 20, textAlign: 'center' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            🏫 Manitas Creativas
          </Title>
          <Text type="secondary">Validación de Pagos</Text>
        </Card>

        {/* Main Content */}
        {error ? (
          <Card>
            <Alert
              message="Error de Validación"
              description={error}
              type="error"
              icon={<CloseCircleOutlined />}
              action={
                <Space direction="vertical">
                  <Button size="small" danger onClick={handleRetry} icon={<ReloadOutlined />}>
                    Reintentar
                  </Button>
                  <Button size="small" onClick={handleGoHome} icon={<HomeOutlined />}>
                    Ir al Inicio
                  </Button>
                </Space>
              }
            />
          </Card>
        ) : validation ? (
          <Card>
            {validation.isValid ? (
              <>
                {/* Success Header */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                  <Title level={3} style={{ color: '#52c41a', marginTop: 16 }}>
                    ✅ Pago Válido
                  </Title>
                  <Tag color="success" style={{ fontSize: 14, padding: '4px 8px' }}>
                    Verificado
                  </Tag>
                </div>

                <Divider />

                {/* Payment Details */}
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Title level={4}>📋 Detalles del Pago</Title>
                  </Col>
                  
                  {validation.pagoId && (
                    <Col xs={24} sm={12}>
                      <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                        <Text strong>ID de Pago:</Text>
                        <br />
                        <Text style={{ fontSize: 18, color: '#52c41a' }}>
                          #{validation.pagoId}
                        </Text>
                      </Card>
                    </Col>
                  )}

                  {validation.montosPago && (
                    <Col xs={24} sm={12}>
                      <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                        <Text strong>Monto:</Text>
                        <br />
                        <Text style={{ fontSize: 18, color: '#52c41a', fontWeight: 'bold' }}>
                          {formatCurrency(validation.montosPago)}
                        </Text>
                      </Card>
                    </Col>
                  )}

                  {validation.alumnoNombre && (
                    <Col span={24}>
                      <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                        <Text strong>👨‍🎓 Estudiante:</Text>
                        <br />
                        <Text style={{ fontSize: 16 }}>
                          {validation.alumnoNombre}
                        </Text>
                      </Card>
                    </Col>
                  )}

                  {validation.rubroDescripcion && (
                    <Col span={24}>
                      <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                        <Text strong>📚 Concepto:</Text>
                        <br />
                        <Text style={{ fontSize: 16 }}>
                          {validation.rubroDescripcion}
                        </Text>
                      </Card>
                    </Col>
                  )}

                  {validation.fechaPago && (
                    <Col span={24}>
                      <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                        <Text strong>📅 Fecha de Pago:</Text>
                        <br />
                        <Text style={{ fontSize: 16 }}>
                          {formatDate(validation.fechaPago)}
                        </Text>
                      </Card>
                    </Col>
                  )}
                </Row>

                <Divider />

                {/* Additional Info */}
                <Alert
                  message="✅ Este pago ha sido verificado correctamente"
                  description="El código QR es válido y el pago está registrado en nuestro sistema."
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              </>
            ) : (
              <>
                {/* Invalid Payment */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
                  <Title level={3} style={{ color: '#ff4d4f', marginTop: 16 }}>
                    ❌ Pago No Válido
                  </Title>
                  <Tag color="error" style={{ fontSize: 14, padding: '4px 8px' }}>
                    No Verificado
                  </Tag>
                </div>

                <Alert
                  message="Código QR Inválido"
                  description={validation.message || 'El código QR no es válido o ha expirado.'}
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              </>
            )}

            {/* Action Buttons */}
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Space>
                <Button onClick={handleRetry} icon={<ReloadOutlined />}>
                  Validar Otro QR
                </Button>
                <Button type="primary" onClick={handleGoHome} icon={<HomeOutlined />}>
                  Ir al Sistema
                </Button>
              </Space>
            </div>
          </Card>
        ) : null}

        {/* Footer */}
        <Card style={{ marginTop: 20, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Sistema de Validación de Pagos - Manitas Creativas
            <br />
            {new Date().getFullYear()} - Todos los derechos reservados
          </Text>
        </Card>
      </div>
    </div>
  );
};

export default QRValidation;
