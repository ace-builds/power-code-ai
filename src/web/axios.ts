import axios from "axios";
import { ApiKeyCredentialsProvider } from "./storage/apiKeyStorage";

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use(async (request) => {
  const apiKey = await ApiKeyCredentialsProvider.getInstance().getApiKey(); // Retrieve the API key from storage
  if (apiKey) {
    request.headers["Authorization"] = `Bearer ${apiKey}`; // Add the bearer token to the request headers
  }
  return request;
});

export default axiosInstance;
