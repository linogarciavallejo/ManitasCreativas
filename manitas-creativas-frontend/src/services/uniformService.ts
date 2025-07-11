import { makeApiRequest } from './apiHelper';

// Interface that matches the backend PrendaUniformeDto
export interface PrendaUniforme {
  id: number;
  descripcion: string;
  sexo: string; // "M", "F", "Unisex"
  talla: string; // (1, 2, 3, .... n) || (XXS, XS, ... XXXL)
  precio: number;
  existenciaInicial: number;
  entradas: number;
  salidas: number;
  notas?: string;
  
  // Navigation properties
  imagenesPrenda: PrendaUniformeImagen[];

  // Audit fields
  fechaCreacion: string;
  fechaActualizacion?: string;
  usuarioCreacionId: number;
  usuarioActualizacionId?: number;
  esEliminado: boolean;
  motivoEliminacion?: string;
  fechaEliminacion?: string;
  usuarioEliminacionId?: number;
}

// Interface for PrendaUniformeSimpleDto
export interface PrendaUniformeSimple {
  id: number;
  descripcion: string;
  sexo: string;
  talla: string;
  precio: number;
  existenciaActual: number;
  existenciaInicial: number;
  entradas: number;
  salidas: number;
  esEliminado: boolean;
}

// Interface for PrendaUniformeCreateDto
export interface PrendaUniformeCreate {
  descripcion: string;
  sexo: string;
  talla: string;
  precio: number;
  existenciaInicial: number;
  notas?: string;
  imagenes: PrendaUniformeImagenCreate[];
}

// Interface for uniform images
export interface PrendaUniformeImagen {
  id: number;
  prendaUniformeId: number;
  imagen: string; // URL of the image
  base64Content: string;
  fileName: string;
  contentType: string;
}

// Interface for creating uniform images
export interface PrendaUniformeImagenCreate {
  base64Content: string;
  fileName: string;
  contentType: string;
}

// Interface for stock entry
export interface EntradaUniforme {
  id: number;
  fecha: string;
  notas?: string;
  detalles: EntradaUniformeDetalle[];
  
  // Audit fields
  fechaCreacion: string;
  fechaActualizacion?: string;
  usuarioCreacionId: number;
  usuarioActualizacionId?: number;
}

// Interface for stock entry details
export interface EntradaUniformeDetalle {
  id: number;
  entradaUniformeId: number;
  prendaUniformeId: number;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
  
  // Navigation properties for display
  prendaUniformeDescripcion: string;
}

// Interface for creating stock entries
export interface EntradaUniformeCreate {
  fecha: string;
  notas?: string;
  detalles: EntradaUniformeDetalleCreate[];
}

// Interface for creating stock entry details
export interface EntradaUniformeDetalleCreate {
  prendaUniformeId: number;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
}

// Interface for rubro-uniform relationships
export interface RubroUniformeDetalle {
  id: number;
  rubroId: number;
  prendaUniformeId: number;
  precio: number;
  
  // Navigation properties for display
  rubroDescripcion: string;
  prendaUniformeDescripcion: string;
  prendaUniformeSexo: string;
  prendaUniformeTalla: string;
  
  // Audit fields
  fechaCreacion: string;
  fechaActualizacion?: string;
  usuarioCreacionId: number;
  usuarioActualizacionId?: number;
}

// Interface for creating rubro-uniform relationships
export interface RubroUniformeDetalleCreate {
  rubroId: number;
  prendaUniformeId: number;
  precio: number;
}

// Service for interacting with Uniform API endpoints
export const uniformService = {
  // ==================== PRENDA UNIFORME ENDPOINTS ====================
  
  // Get all uniform garments
  getAllPrendasUniforme: async (): Promise<PrendaUniforme[]> => {
    return await makeApiRequest<PrendaUniforme[]>('/prendas-uniforme', 'GET');
  },

  // Get all uniform garments (simple version)
  getAllPrendasUniformeSimple: async (): Promise<PrendaUniformeSimple[]> => {
    return await makeApiRequest<PrendaUniformeSimple[]>('/prendas-uniforme/simple', 'GET');
  },

  // Get active uniform garments
  getActivePrendasUniforme: async (): Promise<PrendaUniforme[]> => {
    return await makeApiRequest<PrendaUniforme[]>('/prendas-uniforme/active', 'GET');
  },

  // Get a specific uniform garment by id
  getPrendaUniformeById: async (id: number): Promise<PrendaUniforme> => {
    return await makeApiRequest<PrendaUniforme>(`/prendas-uniforme/${id}`, 'GET');
  },

  // Get uniform garments by sexo
  getPrendasUniformeBySexo: async (sexo: string): Promise<PrendaUniforme[]> => {
    return await makeApiRequest<PrendaUniforme[]>(`/prendas-uniforme/by-sexo/${sexo}`, 'GET');
  },

  // Get uniform garments by talla
  getPrendasUniformeByTalla: async (talla: string): Promise<PrendaUniforme[]> => {
    return await makeApiRequest<PrendaUniforme[]>(`/prendas-uniforme/by-talla/${talla}`, 'GET');
  },

  // Get uniform garments by sexo and talla
  getPrendasUniformeBySexoAndTalla: async (sexo: string, talla: string): Promise<PrendaUniforme[]> => {
    return await makeApiRequest<PrendaUniforme[]>(`/prendas-uniforme/by-sexo-talla/${sexo}/${talla}`, 'GET');
  },

  // Create a new uniform garment
  createPrendaUniforme: async (prenda: PrendaUniformeCreate, usuarioCreacionId: number): Promise<PrendaUniforme> => {
    return await makeApiRequest<PrendaUniforme>(`/prendas-uniforme?usuarioCreacionId=${usuarioCreacionId}`, 'POST', prenda);
  },

  // Update an existing uniform garment
  updatePrendaUniforme: async (id: number, prenda: PrendaUniformeCreate, usuarioActualizacionId: number): Promise<PrendaUniforme> => {
    return await makeApiRequest<PrendaUniforme>(`/prendas-uniforme/${id}?usuarioActualizacionId=${usuarioActualizacionId}`, 'PUT', prenda);
  },

  // Delete a uniform garment (soft delete)
  deletePrendaUniforme: async (id: number, motivoEliminacion: string, usuarioEliminacionId: number): Promise<void> => {
    await makeApiRequest<void>(`/prendas-uniforme/${id}?motivoEliminacion=${encodeURIComponent(motivoEliminacion)}&usuarioEliminacionId=${usuarioEliminacionId}`, 'DELETE');
  },

  // Check if uniform garment exists
  checkPrendaUniformeExists: async (id: number): Promise<{ exists: boolean }> => {
    return await makeApiRequest<{ exists: boolean }>(`/prendas-uniforme/${id}/exists`, 'GET');
  },

  // ==================== ENTRADA UNIFORME ENDPOINTS ====================
  
  // Get all stock entries
  getAllEntradasUniforme: async (): Promise<EntradaUniforme[]> => {
    return await makeApiRequest<EntradaUniforme[]>('/entradas-uniforme', 'GET');
  },

  // Get a specific stock entry by id
  getEntradaUniformeById: async (id: number): Promise<EntradaUniforme> => {
    return await makeApiRequest<EntradaUniforme>(`/entradas-uniforme/${id}`, 'GET');
  },

  // Create a new stock entry
  createEntradaUniforme: async (entrada: EntradaUniformeCreate, usuarioCreacionId: number): Promise<EntradaUniforme> => {
    return await makeApiRequest<EntradaUniforme>(`/entradas-uniforme?usuarioCreacionId=${usuarioCreacionId}`, 'POST', entrada);
  },

  // ==================== RUBRO UNIFORME DETALLE ENDPOINTS ====================
  
  // Get all rubro-uniform relationships
  getAllRubrosUniformeDetalle: async (): Promise<RubroUniformeDetalle[]> => {
    return await makeApiRequest<RubroUniformeDetalle[]>('/rubro-uniforme-detalles', 'GET');
  },

  // Get a specific rubro-uniform relationship by id
  getRubroUniformeDetalleById: async (id: number): Promise<RubroUniformeDetalle> => {
    return await makeApiRequest<RubroUniformeDetalle>(`/rubro-uniforme-detalles/${id}`, 'GET');
  },

  // Create a new rubro-uniform relationship
  createRubroUniformeDetalle: async (detalle: RubroUniformeDetalleCreate, usuarioCreacionId: number): Promise<RubroUniformeDetalle> => {
    return await makeApiRequest<RubroUniformeDetalle>(`/rubro-uniforme-detalles?usuarioCreacionId=${usuarioCreacionId}`, 'POST', detalle);
  },

  // Update an existing rubro-uniform relationship
  updateRubroUniformeDetalle: async (id: number, detalle: RubroUniformeDetalleCreate, usuarioActualizacionId: number): Promise<RubroUniformeDetalle> => {
    return await makeApiRequest<RubroUniformeDetalle>(`/rubro-uniforme-detalles/${id}?usuarioActualizacionId=${usuarioActualizacionId}`, 'PUT', detalle);
  },

  // Delete a rubro-uniform relationship
  deleteRubroUniformeDetalle: async (id: number): Promise<void> => {
    await makeApiRequest<void>(`/rubro-uniforme-detalles/${id}`, 'DELETE');
  }
};
