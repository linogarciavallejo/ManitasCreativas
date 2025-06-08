import { makeApiRequest } from './apiHelper';

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  codigoUsuario: string;
  email: string;
  celular: string;
  password: string;
  estadoUsuario: string;
  rol: string;
}

export interface UsuarioLogin {
  codigoUsuario: string;
  password: string;
}

export const usuarioService = {
  // Get all users
  getAllUsuarios: async (): Promise<Usuario[]> => {
    return await makeApiRequest<Usuario[]>('/usuarios');
  },

  // Get user by ID
  getUsuarioById: async (id: number): Promise<Usuario> => {
    return await makeApiRequest<Usuario>(`/usuarios/${id}`);
  },

  // Create new user
  createUsuario: async (usuario: Usuario): Promise<Usuario> => {
    return await makeApiRequest<Usuario>('/usuarios', 'POST', usuario);
  },

  // Update user
  updateUsuario: async (id: number, usuario: Usuario): Promise<void> => {
    await makeApiRequest<void>(`/usuarios/${id}`, 'PUT', usuario);
  },

  // Delete user
  deleteUsuario: async (id: number): Promise<void> => {
    await makeApiRequest<void>(`/usuarios/${id}`, 'DELETE');
  },

  // Sign in user
  signIn: async (loginData: UsuarioLogin): Promise<Usuario> => {
    return await makeApiRequest<Usuario>('/usuarios/signin', 'POST', loginData);
  }
};
