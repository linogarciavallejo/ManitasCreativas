import { makeApiRequest } from './apiHelper';

// Types for RubroUniformeDetalle
export interface RubroUniformeDetalle {
  id: number;
  rubroId: number;
  prendaUniformeId: number;
  rubroDescripcion: string;
  prendaUniformeDescripcion: string;
  prendaUniformeSexo: string;
  prendaUniformeTalla: string;
  prendaUniformePrecio: number;
  fechaCreacion: string;
  fechaActualizacion?: string;
  usuarioCreacionId: number;
  usuarioActualizacionId?: number;
  esEliminado: boolean;
  motivoEliminacion?: string;
  fechaEliminacion?: string;
  usuarioEliminacionId?: number;
}

export interface RubroUniformeDetalleCreate {
  rubroId: number;
  prendaUniformeId: number;
}

class RubroUniformeDetalleService {
  private readonly baseUrl = '/rubro-uniforme-detalles';

  // Get all rubro uniforme detalles
  async getAllRubroUniformeDetalles(): Promise<RubroUniformeDetalle[]> {
    return await makeApiRequest<RubroUniformeDetalle[]>(`${this.baseUrl}`, 'GET');
  }

  // Get active rubro uniforme detalles
  async getActiveRubroUniformeDetalles(): Promise<RubroUniformeDetalle[]> {
    return await makeApiRequest<RubroUniformeDetalle[]>(`${this.baseUrl}/active`, 'GET');
  }

  // Get rubro uniforme detalle by ID
  async getRubroUniformeDetalleById(id: number): Promise<RubroUniformeDetalle> {
    return await makeApiRequest<RubroUniformeDetalle>(`${this.baseUrl}/${id}`, 'GET');
  }

  // Get rubro uniforme detalles by rubro ID
  async getRubroUniformeDetallesByRubroId(rubroId: number): Promise<RubroUniformeDetalle[]> {
    return await makeApiRequest<RubroUniformeDetalle[]>(`${this.baseUrl}/by-rubro/${rubroId}`, 'GET');
  }

  // Get rubro uniforme detalles by prenda uniforme ID
  async getRubroUniformeDetallesByPrendaId(prendaUniformeId: number): Promise<RubroUniformeDetalle[]> {
    return await makeApiRequest<RubroUniformeDetalle[]>(`${this.baseUrl}/by-prenda/${prendaUniformeId}`, 'GET');
  }

  // Get specific rubro uniforme detalle by rubro and prenda
  async getRubroUniformeDetalleByRubroAndPrenda(rubroId: number, prendaUniformeId: number): Promise<RubroUniformeDetalle> {
    return await makeApiRequest<RubroUniformeDetalle>(`${this.baseUrl}/by-rubro-prenda/${rubroId}/${prendaUniformeId}`, 'GET');
  }

  // Create new rubro uniforme detalle
  async createRubroUniformeDetalle(data: RubroUniformeDetalleCreate, usuarioCreacionId: number): Promise<RubroUniformeDetalle> {
    return await makeApiRequest<RubroUniformeDetalle>(`${this.baseUrl}?usuarioCreacionId=${usuarioCreacionId}`, 'POST', data);
  }

  // Update rubro uniforme detalle
  async updateRubroUniformeDetalle(id: number, data: RubroUniformeDetalleCreate, usuarioActualizacionId: number): Promise<RubroUniformeDetalle> {
    return await makeApiRequest<RubroUniformeDetalle>(`${this.baseUrl}/${id}?usuarioActualizacionId=${usuarioActualizacionId}`, 'PUT', data);
  }

  // Delete rubro uniforme detalle (soft delete)
  async deleteRubroUniformeDetalle(id: number, motivoEliminacion: string, usuarioEliminacionId: number): Promise<void> {
    const params = new URLSearchParams({
      motivoEliminacion,
      usuarioEliminacionId: usuarioEliminacionId.toString(),
    });

    await makeApiRequest<void>(`${this.baseUrl}/${id}?${params}`, 'DELETE');
  }

  // Check if combination exists
  async existsRubroUniformeDetalle(rubroId: number, prendaUniformeId: number): Promise<boolean> {
    const response = await makeApiRequest<{ exists: boolean }>(`${this.baseUrl}/exists/${rubroId}/${prendaUniformeId}`, 'GET');
    return response.exists;
  }
}

export const rubroUniformeDetalleService = new RubroUniformeDetalleService();
