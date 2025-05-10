import axios from "axios";
import { getCurrentUserId, getCurrentUsername } from './authService';

// Credentials are sent with requests
type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

// Determine the API base URL
// In development, use the hardcoded URL
// In production (when served from the API), use the current origin
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment 
  ? "https://localhost:7144" 
  : ""; // Empty string means it will use relative URLs from current origin

const getFullUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to make API requests with proper error handling
export async function makeApiRequest<T>(
  endpoint: string,
  method: RequestMethod = "GET",
  data?: any,
  withCredentials: boolean = true
): Promise<T> {
  const url = getFullUrl(endpoint);
  
  // Prepare headers
  const headers: Record<string, string> = {};
  
  // Add the X-Username header to every request
  headers['X-Username'] = getCurrentUsername();

  // Process data for audit fields
  let requestData = data;
  if (data && !(data instanceof FormData) && (method === "POST" || method === "PUT")) {
    // Add user ID for audit fields
    const userId = getCurrentUserId();
    if (userId > 0) {
      requestData = { ...data };
      
      // Add user ID for creation on new entities
      if (method === "POST" && !requestData.usuarioCreacionId) {
        requestData.usuarioCreacionId = userId;
      }
      
      // Add user ID for updates on existing entities
      if (method === "PUT" && !requestData.usuarioActualizacionId) {
        requestData.usuarioActualizacionId = userId;
      }
    }
  }
  
  // Special config for requests
  const config: any = { 
    withCredentials,
    headers
  };
  
  // FormData handling - don't set Content-Type for FormData
  if (data instanceof FormData) {
    console.log("Sending FormData object");
    // Let axios set the appropriate content type with boundary for FormData
  } else {
    // For JSON data, explicitly set the Content-Type
    config.headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    if (method === "GET") {
      response = await axios.get(url, config);
    } else if (method === "POST") {
      console.log("POST request data type:", requestData instanceof FormData ? "FormData" : typeof requestData);
      response = await axios.post(url, requestData, config);
    } else if (method === "PUT") {
      response = await axios.put(url, requestData, config);
    } else if (method === "DELETE") {
      response = await axios.delete(url, config);
    } else {
      throw new Error("Invalid request method");
    }
    
    if (response) {
      return response.data;
    } else {
      throw new Error("Response is undefined");
    }
  } catch (error: any) {
    console.error(`API request error for ${method} ${endpoint}:`, error);
    if (error.response) {
      console.error(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    throw error;
  }
}
