import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  message,
  Row,
  Col,
  Popconfirm,
  Divider,
  Image,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import { Pago, pagoService } from "../../services/pagoService";
import DatePickerES from "../common/DatePickerES";
import { getCurrentUserId } from "../../services/authService";

// Extend UploadFile to include our custom properties
interface ExtendedUploadFile extends UploadFile {
  existing?: boolean;
  imageId?: number; // Add imageId for tracking
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
  loading,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<ExtendedUploadFile[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<Set<number>>(new Set());

  // Reset form when payment changes or modal opens
  useEffect(() => {
    if (payment && visible) {
      console.log("Setting form values for payment:", payment.id);
      console.log("payment.monto value:", payment.monto, "type:", typeof payment.monto);
      
      // Use a timeout to ensure the modal is fully rendered before setting values
      setTimeout(() => {
        form.setFieldsValue({
          fecha: dayjs(payment.fecha),
          monto: payment.monto,
          medioPago: payment.medioPagoDescripcion,
          notas: payment.notas || "",
          cicloEscolar: payment.cicloEscolar,
          mesColegiatura: payment.mesColegiatura,
          anioColegiatura: payment.anioColegiatura,
          estadoCarnet: payment.estadoCarnet || "",
        });
          // Check what value was actually set
        console.log("Form monto value after setFieldsValue:", form.getFieldValue('monto'));
      }, 100);
        // Initialize empty file list for new uploads only
      setFileList([]);
      
      // Reset deleted images tracking
      setDeletedImageIds(new Set());
    }
  }, [payment, visible, form]);
  // Reset form and file list when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setFileList([]);
      setDeletedImageIds(new Set());
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
        Efectivo: 1,
        TarjetaCredito: 2,
        TarjetaDebito: 3,
        TransferenciaBancaria: 4,
        Cheque: 5,
        BoletaDeposito: 6,
        PagoMovil: 7,
      };

      const medioPagoValue = medioPagoMap[values.medioPago] || 1;
      formData.append("MedioPago", medioPagoValue.toString());
      formData.append("Notas", values.notas || "");
      formData.append("EsColegiatura", payment.esColegiatura.toString());

      // Handle transport payment flag
      if (payment.esPagoDeTransporte) {
        formData.append("EsPagoDeTransporte", "true");
      } else {
        formData.append("EsPagoDeTransporte", "false");
      }

      // Handle uniform payment flag
      if (payment.esPagoDeUniforme) {
        formData.append("EsPagoDeUniforme", "true");
      } else {
        formData.append("EsPagoDeUniforme", "false");
      }

      // Handle carnet payment fields
      if (payment.esPagoDeCarnet) {
        formData.append("EsPagoDeCarnet", "true");
        formData.append(
          "EstadoCarnet",
          values.estadoCarnet || payment.estadoCarnet || ""
        );
      } else {
        formData.append("EsPagoDeCarnet", "false");
        formData.append("EstadoCarnet", "");
      }

      if (payment.esColegiatura && !payment.esPagoDeUniforme) {
        formData.append(
          "MesColegiatura",
          (values.mesColegiatura || payment.mesColegiatura || 0).toString()
        );
        formData.append(
          "AnioColegiatura",
          (
            values.anioColegiatura ||
            payment.anioColegiatura ||
            new Date().getFullYear()
          ).toString()
        );
      } else if (payment.esPagoDeTransporte && !payment.esPagoDeUniforme) {
        // Transport payments also use the same fields but different context
        formData.append(
          "MesColegiatura",
          (values.mesColegiatura || payment.mesColegiatura || 0).toString()
        );
        formData.append(
          "AnioColegiatura",
          (
            values.anioColegiatura ||
            payment.anioColegiatura ||
            new Date().getFullYear()
          ).toString()
        );
      } else {
        formData.append("MesColegiatura", "0");
        formData.append("AnioColegiatura", new Date().getFullYear().toString());
      }      // Handle images
      const newImages: string[] = [];
      
      // Get existing image URLs that haven't been deleted (both soft deleted and locally deleted)
      if (payment.imagenesPago) {
        payment.imagenesPago
          .filter(img => !img.EsImagenEliminada && !deletedImageIds.has(img.id))
          .forEach(img => {
            newImages.push(img.url);
          });
      }

      // Handle new uploaded files
      fileList.forEach((file, index) => {
        if (file.originFileObj) {
          formData.append(`ImagenesPago[${index}]`, file.originFileObj);
        }
      });

      // Add existing image URLs to the formData
      newImages.forEach((url, index) => {
        formData.append(`ImageUrls[${index}]`, url);
      });// User information for audit
      const userId = getCurrentUserId();
      formData.append("UsuarioActualizacionId", userId.toString());

      // For updates, preserve the original creation user ID
      formData.append(
        "UsuarioCreacionId",
        payment.usuarioCreacionId.toString()
      );
      formData.append("EsAnulado", "false");
      formData.append("MotivoAnulacion", "");

      await onSave(payment.id, formData);

      message.success("Pago actualizado exitosamente");
      onClose();
    } catch (error) {
      console.error("Error updating payment:", error);
      message.error("Error al actualizar el pago");
    }
  };
  const handleCancel = () => {
    onClose();
  };  // Handle deletion of existing images
  const handleDeleteExistingImage = async (imagen: { id: number; url: string; EsImagenEliminada?: boolean }) => {
    if (!imagen.id) return;

    try {
      // Immediately hide the image from UI
      setDeletedImageIds(prev => new Set(prev).add(imagen.id));
      
      await pagoService.removePaymentImage(imagen.id);
      
      message.success("Imagen eliminada exitosamente");
      
      // Update the payment object to reflect the deletion (for consistency)
      if (payment && payment.imagenesPago) {
        payment.imagenesPago = payment.imagenesPago.map(img => 
          img.id === imagen.id ? { ...img, EsImagenEliminada: true } : img
        );
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      message.error("Error al eliminar la imagen");
      
      // If deletion failed, restore the image in UI
      setDeletedImageIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(imagen.id);
        return newSet;
      });
    }
  };if (!payment) return null;
  return (    <Modal
      title={`Editar Pago #${payment.id}`}
      open={visible}
      onCancel={handleCancel}
      width={1200}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Guardar Cambios
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" scrollToFirstError>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Fecha de Pago"
              name="fecha"
              rules={[
                {
                  required: true,
                  message: "Por favor seleccione la fecha de pago",
                },
              ]}
            >
              <DatePickerES
                style={{ width: "100%" }}
                placeholder="Seleccione la fecha de pago"
                disabled
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Rubro">
              <Input
                value={payment.rubroDescripcion}
                readOnly
                style={{ 
                  backgroundColor: '#f5f5f5',
                  cursor: 'default'
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Monto"
              name="monto"
              rules={[
                { required: true, message: "Por favor ingrese el monto" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Ingrese el monto"
                formatter={(value) =>
                  `Q ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: string | undefined) => {
                  if (!value) return 0;
                  const cleanValue = value.replace(/Q\s?|,/g, "");
                  const parsed = parseFloat(cleanValue) || 0;
                  return parsed;
                }}
                min={0}
                step={0.01}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Ciclo Escolar"
              name="cicloEscolar"
              rules={[
                {
                  required: true,
                  message: "Por favor ingrese el ciclo escolar",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Ingrese el ciclo escolar"
                min={2020}
                max={2030}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Medio de Pago"
              name="medioPago"
              rules={[
                {
                  required: true,
                  message: "Por favor seleccione el medio de pago",
                },
              ]}
            >
              <Select placeholder="Seleccione el medio de pago">
                <Option value="Efectivo">Efectivo</Option>
                <Option value="TarjetaCredito">Tarjeta de Crédito</Option>
                <Option value="TarjetaDebito">Tarjeta de Débito</Option>
                <Option value="TransferenciaBancaria">
                  Transferencia Bancaria
                </Option>
                <Option value="Cheque">Cheque</Option>
                <Option value="BoletaDeposito">Boleta de Depósito</Option>
                <Option value="PagoMovil">Pago Móvil</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {(payment.esColegiatura || payment.esPagoDeTransporte) && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label={payment.esColegiatura ? "Mes de Colegiatura" : "Mes Pago"} 
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
                label={payment.esColegiatura ? "Año de Colegiatura" : "Año"} 
                name="anioColegiatura"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder={payment.esColegiatura ? "Año de colegiatura" : "Año"}
                  min={2020}
                  max={2030}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {payment.esPagoDeCarnet && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Estado del Carnet"
                name="estadoCarnet"
                rules={[
                  {
                    required: true,
                    message: "Por favor seleccione el estado del carnet",
                  },
                ]}
              >
                <Select placeholder="Seleccione el estado del carnet">
                  <Option value="PAGADO">PAGADO</Option>
                  <Option value="ENTREGADO">ENTREGADO</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}        <Form.Item label="Notas" name="notas">
          <TextArea
            placeholder="Agregar notas sobre el pago"
            rows={3}
            maxLength={500}
          />
        </Form.Item>        {/* Existing Images Section */}
        {payment.imagenesPago && payment.imagenesPago.filter(img => !img.EsImagenEliminada && !deletedImageIds.has(img.id)).length > 0 && (
          <>
            <Divider orientation="left">Imágenes Actuales del Pago</Divider>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                {payment.imagenesPago
                  .filter(img => !img.EsImagenEliminada && !deletedImageIds.has(img.id))
                  .map((imagen, index) => (
                    <div 
                      key={imagen.id} 
                      style={{ 
                        position: "relative", 
                        display: "inline-block",
                        border: "1px solid #d9d9d9",
                        borderRadius: "6px",
                        overflow: "hidden"
                      }}
                    >
                      <Image
                        src={imagen.url}
                        alt={`Imagen de pago ${payment.id} - ${index + 1}`}
                        style={{ 
                          width: 200, 
                          height: 200, 
                          objectFit: "cover",
                          display: "block"
                        }}
                        preview={{
                          mask: "Ver imagen"
                        }}
                      />
                      <div 
                        style={{ 
                          position: "absolute", 
                          top: "8px", 
                          right: "8px",
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          borderRadius: "4px",
                          padding: "4px"
                        }}
                      >
                        <Popconfirm
                          title="¿Eliminar imagen?"
                          description="Esta acción no se puede deshacer."
                          onConfirm={() => handleDeleteExistingImage(imagen)}
                          okText="Sí, eliminar"
                          cancelText="Cancelar"
                          okType="danger"
                        >
                          <Button 
                            type="text" 
                            icon={<DeleteOutlined />} 
                            size="small"
                            style={{ 
                              color: '#fff',
                              border: 'none',
                              padding: '4px'
                            }}
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}        {/* Upload New Images Section */}
        <Divider orientation="left">Agregar Nuevas Imágenes</Divider>
        <Form.Item label="Subir Imágenes Adicionales" name="imagenesPago">
          <Upload 
            name="imagenesPago"
            listType="picture"
            fileList={fileList}
            onChange={({ fileList: newFileList }) => {
              setFileList(newFileList as ExtendedUploadFile[]);
            }}
            beforeUpload={() => false}
            multiple
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Seleccionar Imágenes</Button>
          </Upload>
          <div style={{ marginTop: "8px", color: "#666", fontSize: "12px" }}>
            Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB por imagen.
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PaymentEditModal;
