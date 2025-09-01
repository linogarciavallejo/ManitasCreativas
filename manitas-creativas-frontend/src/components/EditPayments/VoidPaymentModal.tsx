import React from "react";
import { Modal, Button, Form, Input } from "antd";

interface VoidPaymentModalProps {
  visible: boolean;
  isLoading: boolean;
  voidReason: string;
  onVoidReasonChange: (reason: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const VoidPaymentModal: React.FC<VoidPaymentModalProps> = ({
  visible,
  isLoading,
  voidReason,
  onVoidReasonChange,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      title="Anular Pago"
      open={visible}
      onCancel={onCancel}
      zIndex={1001}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button
          key="confirm"
          danger
          type="primary"
          loading={isLoading}
          onClick={onConfirm}
        >
          Confirmar Anulación
        </Button>,
      ]}
    >
      <p>
        ¿Está seguro que desea anular este pago? Esta acción no se puede
        deshacer.
      </p>
      <Form layout="vertical">
        <Form.Item
          label="Motivo de Anulación"
          rules={[
            {
              required: true,
              message: "Por favor ingrese el motivo de anulación",
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Ingrese el motivo de anulación"
            value={voidReason}
            onChange={(e) => onVoidReasonChange(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default VoidPaymentModal;
