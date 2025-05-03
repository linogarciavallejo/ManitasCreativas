import { makeApiRequest } from '../services/apiHelper';
import { Usuario } from '../types/usuario';

// Local storage keys
const USER_KEY = 'manitasCreativas_user';
const USER_NAME_KEY = 'manitasCreativas_username';

// Store user in localStorage
export const storeUser = (user: Usuario): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Store username separately for easier access
  localStorage.setItem(USER_NAME_KEY, `${user.nombres} ${user.apellidos}`);
};

// Get current user from localStorage
export const getCurrentUser = (): Usuario | null => {
  const userJson = localStorage.getItem(USER_KEY);
  if (userJson) {
    return JSON.parse(userJson);
  }
  return null;
};

// Get current username from localStorage
export const getCurrentUsername = (): string => {
  return localStorage.getItem(USER_NAME_KEY) || 'system';
};

// Check if user is logged in
export const isAuthenticated = (): boolean => {
  return localStorage.getItem(USER_KEY) !== null;
};

// Sign out user
export const signOut = (): void => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_NAME_KEY);
};

export const signIn = async (codigoUsuario: string, password: string): Promise<Usuario> => {
  try {
    const user = await makeApiRequest<Usuario>('/usuarios/signin', "POST", { 
      codigoUsuario, 
      password 
    });
    
    // Store user in localStorage after successful login
    storeUser(user);
    
    return user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};