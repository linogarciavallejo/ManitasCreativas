import { makeApiRequest } from './apiHelper';

export interface Alumno {
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
  seccion?: string;
  becado?: boolean;
  becaParcialPorcentaje?: number;
  direccion?: string;
  observaciones?: string;
  estado: number;
  contactos?: AlumnoContacto[];
  pagos?: any[];
}

export interface AlumnoSimple {
  id: number;
  codigo: string;
  fullName: string;
}

export interface AlumnoContacto {
  alumnoId: number;
  contactoId: number;
  contacto: Contacto;
  parentesco: string;
}

export interface Contacto {
  id: number;
  nombre: string;
  telefonoTrabajo?: string;
  celular?: string;
  email?: string;
  direccion?: string;
  nit?: string;
}

export const alumnoService = {
  // Get all students
  getAllAlumnos: async (): Promise<Alumno[]> => {
    return await makeApiRequest<Alumno[]>('/alumnos');
  },

  // Get active students (estado = 1)
  getActiveAlumnos: async (): Promise<Alumno[]> => {
    const allAlumnos = await makeApiRequest<Alumno[]>('/alumnos');
    return allAlumnos.filter(alumno => alumno.estado === 1);
  },

  // Get student by ID
  getAlumnoById: async (id: number): Promise<Alumno> => {
    return await makeApiRequest<Alumno>(`/alumnos/${id}`);
  },

  // Get student by code
  getAlumnoByCodigo: async (codigo: string): Promise<Alumno> => {
    return await makeApiRequest<Alumno>(`/alumnos/codigo/${codigo}`);
  },

  // Search students by name or surname
  searchAlumnosByName: async (nombre: string, apellido: string): Promise<Alumno[]> => {
    return await makeApiRequest<Alumno[]>(`/alumnos/search?nombre=${nombre}&apellido=${apellido}`);
  },

  // Get students with full name for dropdown/autocomplete
  getAlumnosWithFullName: async (): Promise<AlumnoSimple[]> => {
    return await makeApiRequest<AlumnoSimple[]>('/alumnos/full');
  },

  // Create new student
  createAlumno: async (alumno: Alumno): Promise<Alumno> => {
    return await makeApiRequest<Alumno>('/alumnos', 'POST', alumno);
  },

  // Update existing student
  updateAlumno: async (id: number, alumno: Alumno): Promise<void> => {
    await makeApiRequest<void>(`/alumnos/${id}`, 'PUT', alumno);
  },  // Logical delete - change estado to Inactivo (2)
  setInactiveAlumno: async (id: number): Promise<void> => {
    const alumno = await alumnoService.getAlumnoById(id);
    if (alumno) {
      alumno.estado = 2; // Inactivo
      await alumnoService.updateAlumno(id, alumno);
    } else {
      throw new Error('Alumno not found');
    }
  },

  // Get student with payments
  getAlumnoWithPagos: async (id: number): Promise<Alumno> => {
    return await makeApiRequest<Alumno>(`/alumnos/${id}/pagos`);
  },

  // Get student statement (detailed payment history)
  getAlumnoStatement: async (id: number): Promise<any[]> => {
    return await makeApiRequest<any[]>(`/alumnos/${id}/statement`);
  }
};