import axios from "axios";

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

export async function makeApiRequest<T>(
  endpoint: string,
  method: RequestMethod = "GET",
  data?: any,
  withCredentials: boolean = true
): Promise<T> {
  const url = getFullUrl(endpoint);

  let response;
  if (method === "GET") {
    response = await axios.get(url, { withCredentials });
  } else if (method === "POST") {
    response = await axios.post(url, data);
  } else if (method === "PUT") {
    response = await axios.put(url, data);
  } else if (method === "DELETE") {
    response = await axios.delete(url);
  } else {
    throw new Error("Invalid request method");
  }

  if (response) {
    return response.data;
  } else {
    throw new Error("Response is undefined");
  }
}
