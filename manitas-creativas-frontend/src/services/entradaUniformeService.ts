import { makeApiRequest } from './apiHelper';

// Types for EntradaUniforme
export interface EntradaUniforme {
  id: number;
  fechaEntrada: string;
  usuarioCreacionId: number;
  fechaCreacion: string;
  notas?: string;
  total: number;
  entradaUniformeDetalles: EntradaUniformeDetalle[];
  // Audit fields
  fechaActualizacion?: string;
  usuarioActualizacionId?: number;
  esEliminado: boolean;
  motivoEliminacion?: string;
  fechaEliminacion?: string;
  usuarioEliminacionId?: number;
}

export interface EntradaUniformeDetalle {
  id: number;
  entradaUniformeId: number;
  prendaUniformeId: number;
  cantidad: number;
  subtotal: number;
  // Navigation properties for display
  prendaUniformeDescripcion: string;
  prendaUniformeSexo: string;
  prendaUniformeTalla: string;
  prendaUniformePrecio: number;
}

export interface EntradaUniformeCreate {
  fechaEntrada: string;
  notas?: string;
  detalles: EntradaUniformeDetalleCreate[];
}

export interface EntradaUniformeDetalleCreate {
  prendaUniformeId: number;
  cantidad: number;
  subtotal: number;
}

class EntradaUniformeService {
  private readonly baseUrl = '/entradas-uniforme';

  // Get all entradas uniforme
  async getAllEntradasUniforme(): Promise<EntradaUniforme[]> {
    return await makeApiRequest<EntradaUniforme[]>(`${this.baseUrl}`, 'GET');
  }

  // Get active entradas uniforme
  async getActiveEntradasUniforme(): Promise<EntradaUniforme[]> {
    return await makeApiRequest<EntradaUniforme[]>(`${this.baseUrl}/active`, 'GET');
  }

  // Get entrada uniforme by ID
  async getEntradaUniformeById(id: number): Promise<EntradaUniforme> {
    return await makeApiRequest<EntradaUniforme>(`${this.baseUrl}/${id}`, 'GET');
  }

  // Get entradas uniforme by date range
  async getEntradasUniformeByDateRange(startDate: string, endDate: string): Promise<EntradaUniforme[]> {
    return await makeApiRequest<EntradaUniforme[]>(
      `${this.baseUrl}/by-date-range?startDate=${startDate}&endDate=${endDate}`, 
      'GET'
    );
  }

  // Get entradas uniforme by usuario creation ID
  async getEntradasUniformeByUsuario(usuarioId: number): Promise<EntradaUniforme[]> {
    return await makeApiRequest<EntradaUniforme[]>(`${this.baseUrl}/by-usuario/${usuarioId}`, 'GET');
  }

  // Create new entrada uniforme
  async createEntradaUniforme(data: EntradaUniformeCreate, usuarioCreacionId: number): Promise<EntradaUniforme> {
    return await makeApiRequest<EntradaUniforme>(
      `${this.baseUrl}?usuarioCreacionId=${usuarioCreacionId}`, 
      'POST', 
      data
    );
  }

  // Update entrada uniforme
  async updateEntradaUniforme(id: number, data: EntradaUniformeCreate, usuarioActualizacionId: number): Promise<EntradaUniforme> {
    return await makeApiRequest<EntradaUniforme>(
      `${this.baseUrl}/${id}?usuarioActualizacionId=${usuarioActualizacionId}`, 
      'PUT', 
      data
    );
  }

  // Delete entrada uniforme (soft delete)
  async deleteEntradaUniforme(id: number, motivoEliminacion: string, usuarioEliminacionId: number): Promise<void> {
    return await makeApiRequest<void>(
      `${this.baseUrl}/${id}?motivoEliminacion=${encodeURIComponent(motivoEliminacion)}&usuarioEliminacionId=${usuarioEliminacionId}`, 
      'DELETE'
    );
  }

  // Check if entrada uniforme exists
  async existsEntradaUniforme(id: number): Promise<boolean> {
    try {
      await this.getEntradaUniformeById(id);
      return true;
    } catch {
      return false;
    }
  }
}

export const entradaUniformeService = new EntradaUniformeService();
