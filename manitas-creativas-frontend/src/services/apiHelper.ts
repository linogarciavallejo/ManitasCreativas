import axios from "axios";
import { getCurrentUsername } from './authService';

//axios.defaults.withCredentials = true; // Ensure cookies are sent with requests

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

// Dynamically determine the API base URL
// In development, use the hardcoded URL
// In production (when served from the API), use the current origin
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment 
  ? "https://localhost:7144" 
  : ""; // Empty string means it will use relative URLs from current origin

const getFullUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to add audit information to data payloads
export const addAuditInfo = (data: any, isCreate: boolean): any => {
  const username = getCurrentUsername();
  
  // Clone the original data
  const dataWithAudit = { ...data };
  
  // Add audit information
  if (isCreate) {
    dataWithAudit.usuarioCreacion = username;
  } else {
    dataWithAudit.usuarioActualizacion = username;
  }
  
  return dataWithAudit;
};

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

  // Handle FormData differently than JSON data
  let requestData = data;
  if (data && !(data instanceof FormData) && (method === "POST" || method === "PUT")) {
    // Only add audit information for regular JSON objects, not FormData
    requestData = addAuditInfo(data, method === "POST");
  }
  
  // Special config for FormData
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
