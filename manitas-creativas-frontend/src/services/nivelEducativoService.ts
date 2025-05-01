import { makeApiRequest } from './apiHelper';

// Interface that matches the backend NivelEducativoDto 
export interface NivelEducativo {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  
  // Audit fields
  fechaCreacion: string;
  fechaActualizacion?: string;
  usuarioCreacion: string;
  usuarioActualizacion?: string;
}

// Service for interacting with NivelEducativo API endpoints
export const nivelEducativoService = {
  // Get all niveles educativos
  getAllNivelesEducativos: async (): Promise<NivelEducativo[]> => {
    return await makeApiRequest<NivelEducativo[]>('/niveleseducativos', 'GET');
  },

  // Get all active niveles educativos
  getActiveNivelesEducativos: async (): Promise<NivelEducativo[]> => {
    return await makeApiRequest<NivelEducativo[]>('/niveleseducativos/activos', 'GET');
  },

  // Get a specific nivel educativo by id
  getNivelEducativoById: async (id: number): Promise<NivelEducativo> => {
    return await makeApiRequest<NivelEducativo>(`/niveleseducativos/${id}`, 'GET');
  },

  // Create a new nivel educativo
  createNivelEducativo: async (nivelEducativo: Omit<NivelEducativo, 'id' | 'fechaCreacion' | 'usuarioCreacion'>): Promise<NivelEducativo> => {
    // The audit fields will be set on the server side
    return await makeApiRequest<NivelEducativo>('/niveleseducativos', 'POST', nivelEducativo);
  },

  // Update an existing nivel educativo
  updateNivelEducativo: async (id: number, nivelEducativo: NivelEducativo): Promise<void> => {
    // The audit fields will be updated on the server side
    await makeApiRequest<void>(`/niveleseducativos/${id}`, 'PUT', nivelEducativo);
  },

  // Delete a nivel educativo
  deleteNivelEducativo: async (id: number): Promise<void> => {
    await makeApiRequest<void>(`/niveleseducativos/${id}`, 'DELETE');
  }
};