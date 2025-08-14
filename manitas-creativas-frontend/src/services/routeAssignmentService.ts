import { AlumnoRuta, AlumnoRutaDetailed, AlumnoOption } from '../types/routeAssignment';
import { makeApiRequest } from './apiHelper';

export const routeAssignmentService = {
  // Get all students assigned to a specific transport route
  async getStudentsByRoute(rubroTransporteId: number): Promise<AlumnoRutaDetailed[]> {
    const url = `/alumnos/rutas/by-route/${rubroTransporteId}`;
    
    try {
      const response = await makeApiRequest<AlumnoRutaDetailed[]>(url, 'GET');
      return response;
    } catch (error) {
      console.error('Error fetching students by route:', error);
      throw error;
    }
  },

  // Get route assignment for a specific student and route
  async getStudentRouteAssignment(alumnoId: number, rubroTransporteId: number): Promise<AlumnoRuta | null> {
    const url = `/alumnos/${alumnoId}/rutas/${rubroTransporteId}`;
      try {
      const response = await makeApiRequest<AlumnoRuta>(url, 'GET');
      return response;
    } catch (error) {
      const axiosError = error as { response?: { status: number } };
      if (axiosError.response?.status === 404) {
        return null;
      }
      console.error('Error fetching student route assignment:', error);
      throw error;
    }
  },

  // Assign a student to a transport route
  async assignStudentToRoute(assignment: AlumnoRuta): Promise<AlumnoRuta> {
    const url = '/alumnos/rutas';
    
    try {
      const response = await makeApiRequest<AlumnoRuta>(url, 'POST', assignment);
      return response;
    } catch (error) {
      console.error('Error assigning student to route:', error);
      throw error;
    }
  },

  // Update a student's route assignment dates
  async updateStudentRouteAssignment(assignmentId: number, assignment: Omit<AlumnoRuta, 'id' | 'alumnoId' | 'rubroTransporteId'>): Promise<void> {
    const url = `/alumnos/rutas/${assignmentId}`;
    
    try {
      await makeApiRequest<void>(url, 'PUT', assignment);
    } catch (error) {
      console.error('Error updating student route assignment:', error);
      throw error;
    }
  },
  // Remove a student from a transport route (by assignment ID)
  async removeStudentFromRoute(assignmentId: number): Promise<void> {
    const url = `/alumnos/rutas/${assignmentId}`;
    
    try {
      console.log('API call - removeStudentFromRoute:', { assignmentId, url });
      const response = await makeApiRequest<void>(url, 'DELETE');
      console.log('API call successful - removeStudentFromRoute');
      return response;
    } catch (error) {
      console.error('Error removing student from route:', error);
      console.error('API call details:', { assignmentId, url });
      throw error;
    }
  },

  // Legacy method - remove by alumnoId and rubroTransporteId (keep for backward compatibility)
  async removeStudentFromRouteLegacy(alumnoId: number, rubroTransporteId: number): Promise<void> {
    const url = `/alumnos/${alumnoId}/rutas/${rubroTransporteId}`;
    
    try {
      console.log('API call - removeStudentFromRouteLegacy:', { alumnoId, rubroTransporteId, url });
      const response = await makeApiRequest<void>(url, 'DELETE');
      console.log('API call successful - removeStudentFromRouteLegacy');
      return response;
    } catch (error) {
      console.error('Error removing student from route:', error);
      console.error('API call details:', { alumnoId, rubroTransporteId, url });
      throw error;
    }
  },
  // Search for students for route assignment
  async searchStudents(query: string): Promise<AlumnoOption[]> {
    const url = `/alumnos/search?query=${encodeURIComponent(query)}`;
    
    try {
      const response = await makeApiRequest<AlumnoOption[]>(url, 'GET');
      return response;
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  },
  // Check if a student is assigned to any route
  async getStudentAllRouteAssignments(alumnoId: number): Promise<AlumnoRuta[]> {
    const url = `/alumnos/${alumnoId}/rutas`;
    
    try {
      const response = await makeApiRequest<AlumnoRuta[]>(url, 'GET');
      return response;
    } catch (error) {
      const axiosError = error as { response?: { status: number } };
      if (axiosError.response?.status === 404) {
        return [];
      }
      console.error('Error fetching student route assignments:', error);
      throw error;
    }
  }
};
