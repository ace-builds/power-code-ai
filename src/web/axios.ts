import axios from "axios";
// import { ApiKeyCredentialsProvider } from "./storage/apiKeyStorage";

const createAxiosInstance = (key: string) => {
  const axiosInstance = axios.create();
  axiosInstance.interceptors.request.use(async (request) => {
    // const apiKey = await ApiKeyCredentialsProvider.getInstance().getApiKey(); // Retrieve the API key from storage
    if (key) {
      request.headers["Authorization"] = `Bearer ${key}`; // Add the bearer token to the request headers
    }
    return request;
  });
  return axiosInstance

}

export default createAxiosInstance;
