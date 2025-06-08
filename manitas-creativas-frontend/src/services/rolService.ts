import { makeApiRequest } from './apiHelper';

export interface Rol {
  id: number;
  nombre: string;
  esAdmin: boolean;
}

export const rolService = {
  // Get all roles (we'll need to create this endpoint or use a simple approach)
  getAllRoles: async (): Promise<Rol[]> => {
    // For now, we'll return a hardcoded list since there's no endpoint for roles
    // You can create an endpoint later if needed
    return [
      { id: 1, nombre: 'Administrador', esAdmin: true },
      { id: 2, nombre: 'Usuario', esAdmin: false },
      { id: 3, nombre: 'Secretaria', esAdmin: false },
      { id: 4, nombre: 'Contador', esAdmin: false }
    ];
  }
};
