import { makeApiRequest } from '../services/apiHelper';
import { Usuario } from '../types/usuario';
import { featureFlagsService } from './featureFlagsService';

// Local storage keys
const USER_KEY = 'manitasCreativas_user';
const USER_NAME_KEY = 'manitasCreativas_username';
const USER_ID_KEY = 'manitasCreativas_userId';
const SESSION_EXPIRY_KEY = 'manitasCreativas_sessionExpiry';

// Session duration in milliseconds (e.g., 1 hour)
const SESSION_DURATION_MS = 60 * 60 * 1000;

export const isSessionExpired = (): boolean => {
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  return expiry !== null && Date.now() > parseInt(expiry, 10);
};

const updateSessionExpiry = (): void => {
  localStorage.setItem(
    SESSION_EXPIRY_KEY,
    (Date.now() + SESSION_DURATION_MS).toString()
  );
};

// Store user in localStorage
export const storeUser = (user: Usuario): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Store username separately for easier access
  localStorage.setItem(USER_NAME_KEY, `${user.nombres} ${user.apellidos}`);
  // Store user ID separately for audit fields
  localStorage.setItem(USER_ID_KEY, user.id.toString());
  updateSessionExpiry();
};

// Get current user from localStorage
export const getCurrentUser = (): Usuario | null => {
  if (isSessionExpired()) {
    signOut();
    return null;
  }
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

// Get current user ID from localStorage
export const getCurrentUserId = (): number => {
  const userId = localStorage.getItem(USER_ID_KEY);
  return userId ? parseInt(userId, 10) : 0;
};

// Check if user is logged in and has valid status
export const isAuthenticated = (): boolean => {
  if (isSessionExpired()) {
    signOut();
    return false;
  }
  
  const user = getCurrentUser();
  if (!user) {
    return false;
  }
  
  // Check if user status is active (assuming 'Activo' means active)
  if (user.estadoUsuario !== 'Activo') {
    signOut(); // Sign out users who are no longer active
    return false;
  }
  
  return true;
};

// Check if current user is an admin
export const isCurrentUserAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.esAdmin === true;
};

// Check if user has admin role authorization
export const hasAdminAccess = (): boolean => {
  return isAuthenticated() && isCurrentUserAdmin();
};

// Check if a specific feature is available for the current user
export const isFeatureAvailable = async (featureName: string): Promise<boolean> => {
  const user = getCurrentUser();
  if (!user) return false;
  
  await featureFlagsService.ensureLoaded();
  return featureFlagsService.isFeatureAvailableForUser(featureName, {
    esAdmin: user.esAdmin,
    rol: user.rol
  });
};

// Get all available features for the current user
export const getAvailableFeatures = async (): Promise<string[]> => {
  const user = getCurrentUser();
  if (!user) return [];
  
  await featureFlagsService.ensureLoaded();
  return featureFlagsService.getAvailableFeatures({
    esAdmin: user.esAdmin,
    rol: user.rol
  });
};

// Sign out user
export const signOut = (): void => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(SESSION_EXPIRY_KEY);
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
  } catch (error: unknown) {
    console.error('Error signing in:', error);
    
    // Handle specific HTTP status codes for better error messages
    if (error && typeof error === 'object' && 'response' in error) {
      const httpError = error as { response: { status: number; data?: { message?: string } } };
      const status = httpError.response.status;
      const errorData = httpError.response.data;
      
      switch (status) {
        case 401:
          // Invalid credentials
          throw new Error(errorData?.message || 'Credenciales inválidas. Verifique su código de usuario y contraseña.');
        case 403:
          // User inactive or blocked
          throw new Error(errorData?.message || 'Su cuenta no está disponible. Contacte al administrador.');
        default:
          throw new Error(errorData?.message || 'Error al iniciar sesión. Inténtelo de nuevo.');
      }
    }
    
    throw error;
  }
};