import React from 'react';
import { Modal, Button, Descriptions, Tag, Divider, Image } from 'antd';
import dayjs from 'dayjs';
import { Pago } from '../../services/pagoService';

interface PaymentDetailsModalProps {
  payment: Pago | null;
  visible: boolean;
  onClose: () => void;
  onVoid: () => void;
  activeFilter?: "grado" | "alumno" | null;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({ 
  payment, 
  visible, 
  onClose, 
  onVoid,
  activeFilter 
}) => {
  if (!payment) return null;
  // Debug logging
  console.log('PaymentDetailsModal - payment:', payment);
  console.log('PaymentDetailsModal - activeFilter:', activeFilter);
  console.log('PaymentDetailsModal - gradoNombre:', payment.gradoNombre);
  console.log('PaymentDetailsModal - seccion:', payment.seccion);
  console.log('PaymentDetailsModal - seccion type:', typeof payment.seccion);
  console.log('PaymentDetailsModal - condition check:', activeFilter === "alumno" && (payment.gradoNombre || payment.seccion));

  return (
    <Modal
      title={`Detalles del Pago #${payment.id}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Cerrar
        </Button>,
        !payment.esAnulado && (
          <Button 
            key="void" 
            danger
            onClick={onVoid}
            disabled={true} // Disable for now until void functionality is implemented
          >
            Anular Pago
          </Button>
        ),
      ]}
      width={700}
    >
      <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}>
        <Descriptions.Item label="ID">{payment.id}</Descriptions.Item>
        <Descriptions.Item label="Estado">
          <Tag color={payment.esAnulado ? 'red' : 'green'}>
            {payment.esAnulado ? 'Anulado' : 'Activo'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Fecha">
          {dayjs(payment.fecha).format('DD/MM/YYYY')}
        </Descriptions.Item>        <Descriptions.Item label="Monto">
          Q. {payment.monto.toFixed(2)}
        </Descriptions.Item>
        {payment.alumnoNombre && (
          <Descriptions.Item label="Alumno">
            {payment.alumnoNombre}
            {activeFilter === "alumno" && (payment.gradoNombre || payment.seccion) && (
              <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                {payment.gradoNombre && `Grado: ${payment.gradoNombre}`}
                {payment.gradoNombre && payment.seccion && ' • '}
                {payment.seccion && `Sección: ${payment.seccion}`}
              </div>
            )}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Rubro">
          {payment.rubroDescripcion}
        </Descriptions.Item>
        <Descriptions.Item label="Tipo de Rubro">
          {payment.tipoRubroDescripcion}
        </Descriptions.Item>
        <Descriptions.Item label="Ciclo Escolar">
          {payment.cicloEscolar}
        </Descriptions.Item>
        <Descriptions.Item label="Medio de Pago">
          {payment.medioPagoDescripcion}
        </Descriptions.Item>
        {payment.esColegiatura && payment.mesColegiatura && (
          <Descriptions.Item label="Mes Colegiatura">
            {new Date(0, payment.mesColegiatura - 1).toLocaleString('es-ES', { month: 'long' })}
          </Descriptions.Item>
        )}
        {payment.esColegiatura && payment.anioColegiatura && (
          <Descriptions.Item label="Año Colegiatura">
            {payment.anioColegiatura}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Registrado por" span={2}>
          {payment.usuarioNombre}
        </Descriptions.Item>
        {payment.notas && (
          <Descriptions.Item label="Notas" span={2}>
            {payment.notas}
          </Descriptions.Item>
        )}
        {payment.esAnulado && (
          <>
            <Descriptions.Item label="Motivo Anulación" span={2}>
              {payment.motivoAnulacion || 'No especificado'}
            </Descriptions.Item>
            {payment.fechaAnulacion && (
              <Descriptions.Item label="Fecha Anulación" span={2}>
                {dayjs(payment.fechaAnulacion).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            )}
          </>
        )}
      </Descriptions>
      
      {payment.imagenesPago && payment.imagenesPago.length > 0 && (
        <>
          <Divider orientation="left">Imágenes del Pago</Divider>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {payment.imagenesPago.map((imagen) => (
              <Image
                key={imagen.id}
                src={imagen.url}
                alt={`Imagen de pago ${payment.id}`}
                style={{ width: 200, height: 200, objectFit: 'cover' }}
              />
            ))}
          </div>
        </>
      )}
    </Modal>
  );
};

export default PaymentDetailsModal;
