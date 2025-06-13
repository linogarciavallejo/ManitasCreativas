export interface PagoImagenDto {
  id: number;
  pagoId: number;
  url: string;
  base64Content?: string;
  fileName?: string;
  contentType?: string;
}

export interface PagoReadDto {
  id: number;
  monto: number;
  fecha: string;
  cicloEscolar: number;
  medioPagoDescripcion: string;
  medioPago: number;
  rubroId: number;
  rubroDescripcion: string;
  tipoRubroDescripcion: string;
  tipoRubro: number;
  esColegiatura: boolean;
  mesColegiatura?: number;
  anioColegiatura?: number;
  notas: string;
  imagenesPago: PagoImagenDto[];
  montoPreestablecido?: number;
  penalizacionPorMora?: number;  ordenVisualizacionGrid?: number; // Added: new field for display order in grid
  usuarioId?: number;
  usuarioNombre: string;
  // Voided payment fields
  esAnulado?: boolean;
  motivoAnulacion?: string;
  fechaAnulacion?: string;
  usuarioAnulacionId?: number;
  usuarioAnulacionNombre?: string;
}

export interface AlumnoSimpleDto {
  id: number;
  codigo: string;
  fullName: string;
}

export interface ContactoDto {
  id: number;
  nombre: string;
  telefonoTrabajo?: string;
  celular?: string;
  email?: string;
  direccion?: string;
  nit?: string;
}

export interface AlumnoContactoDto {
  alumnoId: number;
  contactoId: number;
  contacto: ContactoDto;
  parentesco: string;
}

export interface AlumnoDto {
  id: number;
  codigo: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  sedeId: number;
  sedeNombre: string;
  gradoId: number;
  gradoNombre: string;
  seccion: string;
  becado: boolean;
  becaParcialPorcentaje: number;
  pagos: PagoReadDto[];
  contactos: AlumnoContactoDto[];
}
