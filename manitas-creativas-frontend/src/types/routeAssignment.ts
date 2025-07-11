export interface AlumnoRuta {
  alumnoId: number;
  rubroTransporteId: number;
  fechaInicio: string;
  fechaFin?: string;
}

export interface AlumnoRutaDetailed {
  alumnoId: number;
  rubroTransporteId: number;
  fechaInicio: string;
  fechaFin?: string;
  alumnoNombre: string;
  alumnoApellidos: string;
  alumnoCompleto: string;
  grado: string;
  seccion: string;
  sede: string;
}

export interface RouteAssignmentFilter {
  rubroTransporteId?: number;
}

export interface AlumnoOption {
  value: string;
  label: string;
  codigo: string;
  id: number;
  primerNombre: string;
  segundoNombre?: string;
  tercerNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  grado: string;
  seccion: string;
  sede: string;
}
