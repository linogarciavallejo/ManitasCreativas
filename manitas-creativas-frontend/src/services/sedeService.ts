import { makeApiRequest } from './apiHelper';

export interface Sede {
  id: number;
  nombre: string;
  direccion: string;
}

export const sedeService = {
  // Get all sedes
  getAllSedes: async (): Promise<Sede[]> => {
    return await makeApiRequest<Sede[]>('/sedes');
  },

  // Get sede by ID
  getSedeById: async (id: number): Promise<Sede> => {
    return await makeApiRequest<Sede>(`/sedes/${id}`);
  },

  // Create new sede
  createSede: async (sede: Sede): Promise<Sede> => {
    return await makeApiRequest<Sede>('/sedes', 'POST', sede);
  },

  // Update existing sede
  updateSede: async (id: number, sede: Sede): Promise<void> => {
    await makeApiRequest<void>(`/sedes/${id}`, 'PUT', sede);
  },

  // Delete sede
  deleteSede: async (id: number): Promise<void> => {
    await makeApiRequest<void>(`/sedes/${id}`, 'DELETE');
  }
};