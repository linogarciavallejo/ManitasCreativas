import axios, { AxiosRequestConfig } from "axios";

axios.defaults.withCredentials = true; // Ensure cookies are sent with requests

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

const API_BASE_URL = "https://localhost:7144";

const getFullUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

export async function makeApiRequest<T>(
  endpoint: string,
  method: RequestMethod = "GET",
  data?: any,
  config?: AxiosRequestConfig // Updated to use AxiosRequestConfig for better type compatibility
): Promise<T> {
  const url = getFullUrl(endpoint);

  let response;
  if (method === "GET") {
    response = await axios.get(url, config);
  } else if (method === "POST") {
    response = await axios.post(url, data, config);
  } else if (method === "PUT") {
    response = await axios.put(url, data, config);
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
}

export const getAntiforgeryToken = async () => {
  try {
    const url = getFullUrl("/antiforgery-token");
    const response = await axios.get(url, { withCredentials: true });
    return response.data.token;
  } catch (error) {
    console.error("Error fetching anti-forgery token:", error);
    throw error;
  }
};
