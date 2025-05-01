import { makeApiRequest } from './apiHelper';

export interface Grado {
  id: number;
  nombre: string;
  descripcion: string;
  nivelEducativoId: number;
  nivelEducativoNombre: string;
  activo: boolean;
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaActualizacion?: string;
  usuarioActualizacion?: string;
}

export const gradoService = {
  async getAllGrados(): Promise<Grado[]> {
    return await makeApiRequest<Grado[]>(`/api/grados`, 'GET');
  },

  async getGradoById(id: number): Promise<Grado> {
    return await makeApiRequest<Grado>(`/api/grados/${id}`, 'GET');
  },

  async getGradosByNivelEducativoId(nivelEducativoId: number): Promise<Grado[]> {
    return await makeApiRequest<Grado[]>(`/api/grados/nivel/${nivelEducativoId}`, 'GET');
  },

  async getActiveGrados(): Promise<Grado[]> {
    return await makeApiRequest<Grado[]>(`/api/grados/activos`, 'GET');
  },

  async createGrado(grado: Partial<Grado>): Promise<Grado> {
    return await makeApiRequest<Grado>(`/api/grados`, 'POST', grado);
  },

  async updateGrado(id: number, grado: Partial<Grado>): Promise<void> {
    await makeApiRequest<void>(`/api/grados/${id}`, 'PUT', grado);
  },

  async deleteGrado(id: number): Promise<void> {
    await makeApiRequest<void>(`/api/grados/${id}`, 'DELETE');
  }
};