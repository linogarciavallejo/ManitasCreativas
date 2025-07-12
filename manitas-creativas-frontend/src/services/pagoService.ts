import { makeApiRequest } from "./apiHelper";

// Define interfaces
export interface Pago {
  id: number;
  monto: number;
  fecha: string;
  cicloEscolar: number;
  medioPagoDescripcion: string;
  rubroId: number;
  rubroDescripcion: string;
  tipoRubroDescripcion: string;
  esColegiatura: boolean;
  mesColegiatura?: number;
  anioColegiatura?: number;
  notas: string;
  esAnulado: boolean;
  motivoAnulacion?: string;
  fechaAnulacion?: string;
  usuarioAnulacionId?: number;
  usuarioNombre: string;
  // Audit fields
  usuarioCreacionId: number;
  usuarioActualizacionId?: number;
  imagenesPago: PagoImagen[];
  // Carnet payment fields
  esPagoDeCarnet?: boolean;
  estadoCarnet?: string;
  // Transport payment fields
  esPagoDeTransporte?: boolean;
  // Uniform payment fields
  esPagoDeUniforme?: boolean;
  // Student information
  alumnoId?: number;
  alumnoNombre?: string;
  gradoNombre?: string;
  seccion?: string;
}

export interface PagoImagen {
  id: number;
  pagoId: number;
  url: string;
  EsImagenEliminada?: boolean;
}

// Transport payments report interfaces
export interface PagoTransporteReportItemDto {
  id: number;
  monto: number;
  estado: string;
  mesColegiatura?: number;
  notas?: string;
  esPagoDeCarnet?: boolean;
  estadoCarnet?: string;
  esPagoDeTransporte?: boolean;
}

export interface PagoTransporteReportDto {
  numeroOrdinal: number;
  alumnoId: number;
  alumno: string;
  direccion: string;
  telefono: string;
  encargado: string;
  grado: string;
  pagosPorMes: { [mes: number]: PagoTransporteReportItemDto };
}

// Service functions
export const pagoService = {
  // Get payments for editing with optional filters
  getPaymentsForEdit: async (
    cicloEscolar: number,
    gradoId?: number,
    alumnoId?: string
  ) => {
    let url = `/pagos/edit?cicloEscolar=${cicloEscolar}`;

    if (gradoId) {
      url += `&gradoId=${gradoId}`;
    }

    if (alumnoId) {
      url += `&alumnoId=${alumnoId}`;
    }

    console.log("Calling API endpoint:", url);
    const response = await makeApiRequest<Pago[]>(url, "GET");
    console.log(
      "API response type:",
      typeof response,
      "Is array:",
      Array.isArray(response)
    );

    // Ensure we return an array
    return Array.isArray(response) ? response : [];
  },
  // Void a payment
  voidPayment: async (pagoId: number, motivo: string, usuarioId: number) => {
    const url = `/pagos/${pagoId}/void`;
    const data = {
      motivoAnulacion: motivo,
      usuarioAnulacionId: usuarioId,
    };

    return await makeApiRequest(url, "POST", data);
  },
  // Update a payment
  updatePayment: async (pagoId: number, pagoData: FormData) => {
    const url = `/pagos/${pagoId}`;
    return await makeApiRequest<Pago>(url, "PUT", pagoData);
  },

  // Remove a single payment image (soft deletion)
  removePaymentImage: async (imagenId: number) => {
    const url = `/pagos/images/${imagenId}`;
    return await makeApiRequest<{ message: string; imagenId: number }>(url, "DELETE");
  },

  // Remove multiple payment images (soft deletion)
  removeMultiplePaymentImages: async (imagenesIds: number[]) => {
    const url = `/pagos/images`;
    return await makeApiRequest<{ message: string; count: number }>(url, "DELETE", imagenesIds);
  },
  
  // Get transport payments report
  getTransportPaymentsReport: async (cicloEscolar: number, rubroId: number) => {
    const url = `/pagos/transport-report?cicloEscolar=${cicloEscolar}&rubroId=${rubroId}`;
    return await makeApiRequest<{
      alumnos: PagoTransporteReportDto[],
      rubroDescripcion: string,
      cicloEscolar: number
    }>(url, "GET");
  },
};
