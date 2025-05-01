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
  mesColegiatura?: number;
  diaLimitePagoAmarillo?: number;
  diaLimitePagoRojo?: number;
  mesLimitePago?: number;
  nivelEducativoId?: number;
  nivelEducativoNombre?: string;
  gradoId?: number;
  gradoNombre?: string;
  cicloEscolar?: number;
  montoPreestablecido?: number;
  notas?: string;
  activo: boolean;
  
  // Audit fields
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
  }
};