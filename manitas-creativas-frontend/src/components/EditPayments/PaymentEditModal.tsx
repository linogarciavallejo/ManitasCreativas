import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Upload, Button, message, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { Pago } from '../../services/pagoService';
import DatePickerES from '../common/DatePickerES';
import { getCurrentUserId } from '../../services/authService';

// Extend UploadFile to include our custom properties
interface ExtendedUploadFile extends UploadFile {
  existing?: boolean;
}

const { Option } = Select;
const { TextArea } = Input;

interface PaymentEditModalProps {
  payment: Pago | null;
  visible: boolean;
  onClose: () => void;
  onSave: (pagoId: number, formData: FormData) => Promise<void>;
  loading: boolean;
}

const PaymentEditModal: React.FC<PaymentEditModalProps> = ({
  payment,
  visible,
  onClose,
  onSave,
  loading
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<ExtendedUploadFile[]>([]);
  // Reset form when payment changes or modal opens
  useEffect(() => {
    if (payment && visible) {
      form.setFieldsValue({
        fecha: dayjs(payment.fecha),
        monto: payment.monto,
        medioPago: payment.medioPagoDescripcion,
        notas: payment.notas || '',
        cicloEscolar: payment.cicloEscolar,
        mesColegiatura: payment.mesColegiatura,
        anioColegiatura: payment.anioColegiatura,
        estadoCarnet: payment.estadoCarnet || ''
      });

      // Set existing images
      if (payment.imagenesPago && payment.imagenesPago.length > 0) {
        const existingFiles: ExtendedUploadFile[] = payment.imagenesPago.map((img, index) => ({
          uid: `existing-${img.id}`,
          name: `Imagen ${index + 1}`,
          status: 'done' as const,
          url: img.url,
          existing: true // Mark as existing image
        }));
        setFileList(existingFiles);
      } else {
        setFileList([]);
      }
    }
  }, [payment, visible, form]);

  // Reset form and file list when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setFileList([]);
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    if (!payment) return;

    try {
      const values = await form.validateFields();
      
      const formData = new FormData();
      
      // Basic payment data
      formData.append("Id", payment.id.toString());
      formData.append("AlumnoId", payment.alumnoId?.toString() || "");
      formData.append("RubroId", payment.rubroId.toString());
      formData.append("Fecha", values.fecha.toISOString());
      formData.append("CicloEscolar", values.cicloEscolar.toString());
      formData.append("Monto", values.monto.toString());

      // Map payment method description back to enum value
      const medioPagoMap: Record<string, number> = {
        "Efectivo": 1,
        "TarjetaCredito": 2,
        "TarjetaDebito": 3,
        "TransferenciaBancaria": 4,
        "Cheque": 5,
        "BoletaDeposito": 6,
        "PagoMovil": 7
      };
      
      const medioPagoValue = medioPagoMap[values.medioPago] || 1;
      formData.append("MedioPago", medioPagoValue.toString());
        formData.append("Notas", values.notas || "");
      formData.append("EsColegiatura", payment.esColegiatura.toString());
      
      // Handle carnet payment fields
      if (payment.esPagoDeCarnet) {
        formData.append("EsPagoDeCarnet", "true");
        formData.append("EstadoCarnet", values.estadoCarnet || payment.estadoCarnet || "");
      } else {
        formData.append("EsPagoDeCarnet", "false");
        formData.append("EstadoCarnet", "");
      }
      
      if (payment.esColegiatura) {
        formData.append("MesColegiatura", (values.mesColegiatura || payment.mesColegiatura || 0).toString());
        formData.append("AnioColegiatura", (values.anioColegiatura || payment.anioColegiatura || new Date().getFullYear()).toString());
      } else {
        formData.append("MesColegiatura", "0");
        formData.append("AnioColegiatura", new Date().getFullYear().toString());
      }

      // Handle images
      const newImages: string[] = [];
      const imageFiles: File[] = [];
      
      fileList.forEach((file) => {
        if (file.existing && file.url) {
          // Existing image - keep the URL
          newImages.push(file.url);
        } else if (file.originFileObj) {
          // New uploaded file
          formData.append(`ImagenesPago[${imageFiles.length}]`, file.originFileObj);
          imageFiles.push(file.originFileObj);
        }
      });

      // Add existing image URLs to the formData
      newImages.forEach((url, index) => {
        formData.append(`ImageUrls[${index}]`, url);
      });

      // User information for audit
      const userId = getCurrentUserId();
      formData.append("UsuarioActualizacionId", userId.toString());

      // Copy original creation fields
      formData.append("UsuarioCreacionId", payment.usuarioNombre || "1");
      formData.append("EsAnulado", "false");
      formData.append("MotivoAnulacion", "");

      await onSave(payment.id, formData);
      
      message.success('Pago actualizado exitosamente');
      onClose();
    } catch (error) {
      console.error('Error updating payment:', error);
      message.error('Error al actualizar el pago');
    }
  };

  const handleCancel = () => {
    onClose();
  };

  // Handle file upload changes
  const handleFileChange = ({ fileList: newFileList }: { fileList: ExtendedUploadFile[] }) => {
    setFileList(newFileList);
  };

  // Custom upload component to prevent auto-upload
  const uploadProps = {
    name: 'imagenesPago',
    listType: 'picture' as const,
    fileList,
    onChange: handleFileChange,
    beforeUpload: () => false, // Prevent auto upload
    onRemove: (file: ExtendedUploadFile) => {
      const newFileList = fileList.filter(item => item.uid !== file.uid);
      setFileList(newFileList);
    }
  };

  if (!payment) return null;

  return (
    <Modal
      title={`Editar Pago #${payment.id}`}
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSubmit}>
          Guardar Cambios
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        scrollToFirstError
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Fecha de Pago"
              name="fecha"
              rules={[{ required: true, message: 'Por favor seleccione la fecha de pago' }]}
            >
              <DatePickerES
                style={{ width: '100%' }}
                placeholder="Seleccione la fecha de pago"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Monto"
              name="monto"
              rules={[{ required: true, message: 'Por favor ingrese el monto' }]}
            >              <InputNumber
                style={{ width: '100%' }}
                placeholder="Ingrese el monto"
                formatter={(value) =>
                  `Q ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                min={0}
                step={0.01}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Ciclo Escolar"
              name="cicloEscolar"
              rules={[{ required: true, message: 'Por favor ingrese el ciclo escolar' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Ingrese el ciclo escolar"
                min={2020}
                max={2030}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Medio de Pago"
              name="medioPago"
              rules={[{ required: true, message: 'Por favor seleccione el medio de pago' }]}
            >
              <Select placeholder="Seleccione el medio de pago">
                <Option value="Efectivo">Efectivo</Option>
                <Option value="TarjetaCredito">Tarjeta de Crédito</Option>
                <Option value="TarjetaDebito">Tarjeta de Débito</Option>
                <Option value="TransferenciaBancaria">Transferencia Bancaria</Option>
                <Option value="Cheque">Cheque</Option>
                <Option value="BoletaDeposito">Boleta de Depósito</Option>
                <Option value="PagoMovil">Pago Móvil</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {payment.esColegiatura && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mes de Colegiatura"
                name="mesColegiatura"
              >
                <Select placeholder="Seleccione el mes">
                  <Option value={1}>Enero</Option>
                  <Option value={2}>Febrero</Option>
                  <Option value={3}>Marzo</Option>
                  <Option value={4}>Abril</Option>
                  <Option value={5}>Mayo</Option>
                  <Option value={6}>Junio</Option>
                  <Option value={7}>Julio</Option>
                  <Option value={8}>Agosto</Option>
                  <Option value={9}>Septiembre</Option>
                  <Option value={10}>Octubre</Option>
                  <Option value={11}>Noviembre</Option>
                  <Option value={12}>Diciembre</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Año de Colegiatura"
                name="anioColegiatura"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Año de colegiatura"
                  min={2020}
                  max={2030}
                />
              </Form.Item>
            </Col>
          </Row>        )}

        {payment.esPagoDeCarnet && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Estado del Carnet"
                name="estadoCarnet"
                rules={[{ required: true, message: 'Por favor seleccione el estado del carnet' }]}
              >
                <Select placeholder="Seleccione el estado del carnet">
                  <Option value="PAGADO">PAGADO</Option>
                  <Option value="ENTREGADO">ENTREGADO</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        <Form.Item
          label="Notas"
          name="notas"
        >
          <TextArea
            placeholder="Agregar notas sobre el pago"
            rows={3}
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          label="Imágenes de Pago"
          name="imagenesPago"
        >
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>
              Subir Imágenes de Pago
            </Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PaymentEditModal;
