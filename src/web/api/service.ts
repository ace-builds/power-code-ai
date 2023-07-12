import { AxiosError, AxiosResponse } from "axios";
import axiosInstance from "../axios";
import { CreateCompletionResponse } from "openai";

function ApiService() {
  const generateCode = async (prompt: string) => {
    try {
      const response: AxiosResponse<CreateCompletionResponse> =
        await axiosInstance.post("https://api.openai.com/v1/completions", {
          prompt,
          model: "text-davinci-003",
          max_tokens: 1000, // Adjust the number of tokens as needed
          temperature: 0.7, // Adjust the temperature as needed
          n: 1, // Adjust the number of suggestions as needed
        });

      const usage = response.data.usage;

      const choices = response.data.choices;
      const text = choices[0].text?.trim();
      return { text, usage };
    } catch (e: any) {
      console.log(e);
      throw new Error(e);
    }
  };

  const generateExplanation = async (prompt: string) => {
    try {
      const response: AxiosResponse<CreateCompletionResponse> =
        await axiosInstance.post("https://api.openai.com/v1/completions", {
          prompt,
          model: "text-davinci-003",
          max_tokens: 1000, // Adjust the number of tokens as needed
          temperature: 0.7, // Adjust the temperature as needed
          n: 1, // Adjust the number of suggestions as needed
        });

      const usage = response.data.usage;

      const choices = response.data.choices;
      const text = choices[0].text?.trim();
      return { text, usage };
    } catch (e: any) {
      console.log(e);
      throw new Error(e);
    }
  };

  return {
    generateCode,
    generateExplanation,
  };
}

export default ApiService;
