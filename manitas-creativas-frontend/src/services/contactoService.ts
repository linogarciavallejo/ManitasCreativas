import { makeApiRequest } from './apiHelper';

export interface Contacto {
  id: number;
  nombre: string;
  telefonoTrabajo?: string;
  celular?: string;
  email?: string;
  direccion?: string;
  nit?: string;
  alumnoId?: number;
}

export interface AlumnoContacto {
  alumnoId: number;
  contactoId: number;
  contacto: Contacto;
  parentesco: string;
}

export const contactoService = {
  // Get all contacts
  getAllContactos: async (): Promise<Contacto[]> => {
    return await makeApiRequest<Contacto[]>('/contactos');
  },

  // Get contact by ID
  getContactoById: async (id: number): Promise<Contacto> => {
    return await makeApiRequest<Contacto>(`/contactos/${id}`);
  },

  // Create new contact
  createContacto: async (contacto: Contacto): Promise<Contacto> => {
    return await makeApiRequest<Contacto>('/contactos', 'POST', contacto);
  },

  // Update contact
  updateContacto: async (id: number, contacto: Contacto): Promise<void> => {
    await makeApiRequest<void>(`/contactos/${id}`, 'PUT', contacto);
  },

  // Delete contact
  deleteContacto: async (id: number): Promise<void> => {
    await makeApiRequest<void>(`/contactos/${id}`, 'DELETE');
  },

  // Associate a contact with a student
  associateContacto: async (alumnoId: number, contactoId: number, parentesco: string): Promise<AlumnoContacto> => {
    return await makeApiRequest<AlumnoContacto>('/alumnocontactos', 'POST', {
      alumnoId,
      contactoId,
      parentesco
    });
  },

  // Remove association between contact and student
  removeAssociation: async (alumnoId: number, contactoId: number): Promise<void> => {
    await makeApiRequest<void>(`/alumnocontactos/${alumnoId}/${contactoId}`, 'DELETE');
  },

  // Get all contacts for a student
  getContactosByAlumnoId: async (alumnoId: number): Promise<AlumnoContacto[]> => {
    return await makeApiRequest<AlumnoContacto[]>(`/alumnocontactos/alumno/${alumnoId}`);
  },

  // Update association (e.g., update relationship type)
  updateAssociation: async (alumnoId: number, contactoId: number, parentesco: string): Promise<void> => {
    await makeApiRequest<void>(`/alumnocontactos/${alumnoId}/${contactoId}`, 'PUT', { 
      alumnoId, 
      contactoId, 
      parentesco 
    });
  }
};