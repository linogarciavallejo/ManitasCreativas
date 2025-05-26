import { makeApiRequest } from './apiHelper';

// Interface that matches the backend RubroDto 
export interface Rubro {
  id: number;
  descripcion: string;
  tipo: string; // Changed from number to string to match expected values
  penalizacionPorMoraMonto?: number;
  penalizacionPorMoraPorcentaje?: number;
  fechaLimitePagoAmarillo?: string;
  fechaLimitePagoRojo?: string;
  esColegiatura: boolean; // Changed: added esColegiatura instead of mesColegiatura
  diaLimitePagoAmarillo?: number;
  diaLimitePagoRojo?: number;
  mesLimitePago?: number;
  nivelEducativoId?: number;
  nivelEducativoNombre?: string;
  gradoId?: number;
  gradoNombre?: string;
  cicloEscolar?: number;  montoPreestablecido?: number;
  fechaInicioPromocion?: string; // Added: new field for promotion start date
  fechaFinPromocion?: string; // Added: new field for promotion end date
  notas?: string;
  activo: boolean;
  ordenVisualizacionGrid?: number; // Added: new field for display order in grid
  esPagoDeCarnet?: boolean; // Added: new field for ID card payment flag
  
  // Audit fields
  fechaCreacion: string;
  fechaActualizacion?: string;
  usuarioCreacion: string;
  usuarioActualizacion?: string;
}

// Interface for payment data
export interface PagoItem {
  id: number;
  monto: number;
  fecha: string;
  cicloEscolar: number;
  medioPago: number;
  medioPagoDescripcion: string;
  rubroId: number;
  rubroDescripcion: string;
  tipoRubro: number;
  tipoRubroDescripcion: string;
  esColegiatura: boolean;
  mesColegiatura?: number;
  anioColegiatura?: number;
  notas: string;
  imagenesPago: Array<{
    id: number;
    pagoId: number;
    url: string;
    nombreArchivo: string;
    fechaCreacion: string;
    usuarioCreacion: string;
  }>;
  montoPreestablecido?: number;
  penalizacionPorMoraMonto?: number;
  penalizacionPorMoraPorcentaje?: number;
  fechaLimitePagoAmarillo?: string;
  fechaLimitePagoRojo?: string;  diaLimitePagoAmarillo?: number;
  diaLimitePagoRojo?: number;
  mesLimitePago?: number;
  ordenVisualizacionGrid?: number; // Added: new field for display order in grid
  esPagoDeCarnet?: boolean; // Added: new field for ID card payment flag
  usuarioId?: number;
  usuarioNombre: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
  usuarioCreacion: string;
  usuarioActualizacion?: string;
}

// Service for interacting with Rubro API endpoints
export const rubroService = {
  // Get all rubros
  getAllRubros: async (): Promise<Rubro[]> => {
    return await makeApiRequest<Rubro[]>('/rubros', 'GET');
  },

  // Get all active rubros
  getActiveRubros: async (): Promise<Rubro[]> => {
    return await makeApiRequest<Rubro[]>('/rubrosactivos', 'GET');
  },

  // Get a specific rubro by id
  getRubroById: async (id: number): Promise<Rubro> => {
    return await makeApiRequest<Rubro>(`/rubros/${id}`, 'GET');
  },

  // Create a new rubro
  createRubro: async (rubro: Omit<Rubro, 'id' | 'fechaCreacion' | 'usuarioCreacion'>): Promise<Rubro> => {
    // The audit fields will be set on the server side
    return await makeApiRequest<Rubro>('/rubros', 'POST', rubro);
  },

  // Update an existing rubro
  updateRubro: async (id: number, rubro: Rubro): Promise<void> => {
    // The audit fields will be updated on the server side
    await makeApiRequest<void>(`/rubros/${id}`, 'PUT', rubro);
  },

  // Delete a rubro
  deleteRubro: async (id: number): Promise<void> => {
    await makeApiRequest<void>(`/rubros/${id}`, 'DELETE');
  },

  // Get all pagos for a specific rubro
  getPagosByRubroId: async (rubroId: number): Promise<PagoItem[]> => {
    return await makeApiRequest<PagoItem[]>(`/rubros/${rubroId}/pagos`, 'GET');
  },

  // Get the count of pagos for a specific rubro
  getPagosCountByRubroId: async (rubroId: number): Promise<number> => {
    return await makeApiRequest<number>(`/rubros/${rubroId}/pagoscount`, 'GET');
  },
  
  // Check if a rubro can be safely deleted
  canDeleteRubro: async (rubroId: number): Promise<boolean> => {
    return await makeApiRequest<boolean>(`/rubros/${rubroId}/candelete`, 'GET');
  }
};