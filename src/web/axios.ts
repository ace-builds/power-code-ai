import axios from "axios";
import { getApiKey } from "./storage/apiKeyStorage";

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use(async (request) => {
  const apiKey = await getApiKey(); // Retrieve the API key from storage
  if (apiKey) {
    request.headers["Authorization"] = `Bearer ${apiKey}`; // Add the bearer token to the request headers
  }
  return request;
});

export default axiosInstance;
