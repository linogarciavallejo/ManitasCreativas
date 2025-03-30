import { makeApiRequest } from '../services/apiHelper';
import { Usuario } from '../types/usuario';

export const signIn = async (codigoUsuario: string, password: string): Promise<Usuario> => {
  try {
    return await makeApiRequest<Usuario>('/usuarios/signin', "POST", { 
      codigoUsuario, 
      password 
    });
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};