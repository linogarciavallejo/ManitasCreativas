import React from "react";
import { Modal, Button, Descriptions, Tag, Divider, Image } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Pago } from "../../services/pagoService";

// Configure dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

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
  activeFilter,
}) => {
  if (!payment) return null;

  return (
    <Modal
      title={`Detalles del Pago #${payment.id}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Cerrar
        </Button>,        !payment.esAnulado && (
          <Button
            key="void"
            danger
            onClick={onVoid}
          >
            Anular Pago
          </Button>        ),
      ]}
      width={900}
    >
      <Descriptions
        bordered
        column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
      >
        <Descriptions.Item label="ID">{payment.id}</Descriptions.Item>
        <Descriptions.Item label="Estado">
          <Tag color={payment.esAnulado ? "red" : "green"}>
            {payment.esAnulado ? "Anulado" : "Activo"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Fecha y Hora">
          {dayjs(payment.fecha).tz("America/Guatemala").format("DD/MM/YYYY HH:mm:ss")}
        </Descriptions.Item>{" "}
        <Descriptions.Item label="Monto">
          Q. {payment.monto.toFixed(2)}
        </Descriptions.Item>
        {payment.alumnoNombre && (
          <Descriptions.Item label="Alumno">
            {payment.alumnoNombre}
            {activeFilter === "alumno" &&
              (payment.gradoNombre || payment.seccion) && (
                <div
                  style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}
                >
                  {payment.gradoNombre && `Grado: ${payment.gradoNombre}`}
                  {payment.gradoNombre && payment.seccion && " • "}
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
        {(payment.esColegiatura || payment.esPagoDeTransporte) && payment.mesColegiatura && (
          <Descriptions.Item label={payment.esColegiatura ? "Mes Colegiatura" : "Mes Pago"}>
            {new Date(0, payment.mesColegiatura - 1).toLocaleString("es-ES", {
              month: "long",
            })}
          </Descriptions.Item>
        )}
        {(payment.esColegiatura || payment.esPagoDeTransporte) && payment.anioColegiatura && (
          <Descriptions.Item label={payment.esColegiatura ? "Año de Colegiatura" : "Año"}>
            {payment.anioColegiatura}
          </Descriptions.Item>
        )}
        {payment.esPagoDeCarnet && payment.estadoCarnet && (
          <Descriptions.Item label="Estado del Carnet">
            <Tag
              color={payment.estadoCarnet === "ENTREGADO" ? "green" : "orange"}
            >
              {payment.estadoCarnet}
            </Tag>
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
              {payment.motivoAnulacion || "No especificado"}
            </Descriptions.Item>
            {payment.fechaAnulacion && (
              <Descriptions.Item label="Fecha Anulación" span={2}>
                {dayjs(payment.fechaAnulacion).tz("America/Guatemala").format("DD/MM/YYYY HH:mm:ss")}
              </Descriptions.Item>
            )}
          </>
        )}
      </Descriptions>

      {payment.imagenesPago && payment.imagenesPago.length > 0 && (
        <>
          <Divider orientation="left">Imágenes del Pago</Divider>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {payment.imagenesPago.map((imagen) => (
              <Image
                key={imagen.id}
                src={imagen.url}
                alt={`Imagen de pago ${payment.id}`}
                style={{ width: 200, height: 200, objectFit: "cover" }}
              />
            ))}
          </div>
        </>
      )}
    </Modal>
  );
};

export default PaymentDetailsModal;
