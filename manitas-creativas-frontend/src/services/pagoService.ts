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
  imagenesPago: PagoImagen[];
  // Student information
  alumnoId?: number;
  alumnoNombre?: string;
  gradoNombre?: string;
}

export interface PagoImagen {
  id: number;
  pagoId: number;
  url: string;
}

// Service functions
export const pagoService = {
  // Get payments for editing with optional filters
  getPaymentsForEdit: async (cicloEscolar: number, gradoId?: number, alumnoId?: string) => {
    let url = `/pagos/edit?cicloEscolar=${cicloEscolar}`;
    
    if (gradoId) {
      url += `&gradoId=${gradoId}`;
    }
    
    if (alumnoId) {
      url += `&alumnoId=${alumnoId}`;
    }
    
    console.log("Calling API endpoint:", url);
    const response = await makeApiRequest<Pago[]>(url, "GET");
    console.log("API response type:", typeof response, "Is array:", Array.isArray(response));
    
    // Ensure we return an array
    return Array.isArray(response) ? response : [];
  },
  
  // Void a payment (to be implemented in a future iteration)
  voidPayment: async (pagoId: number, motivo: string, usuarioId: number) => {
    const url = `/pagos/${pagoId}/void`;
    const data = {
      motivoAnulacion: motivo,
      usuarioAnulacionId: usuarioId
    };
    
    // This is a placeholder for the future implementation
    // For now, just log that this would be called
    console.log("Future API call:", url, data);
    
    // Return a mock success response
    return { success: true, message: "Pago anulado correctamente" };
    
    // When actually implemented, it would look like:
    // return await makeApiRequest(url, "POST", data);
  },
};
