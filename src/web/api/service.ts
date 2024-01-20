import { AxiosError, AxiosResponse } from "axios";
import axiosInstance from "../axios";
import { CreateCompletionResponse } from "openai";
import { ApiKeyCredentialsProvider } from "../storage/apiKeyStorage";
import { executeCommand, showErrorMessage } from "../utils/vscode";

interface ValidationError {
  error: {
    message: string;
    code: string;
    param: string | null;
    type: string;
  };
}

function ApiService() {
  const apiKeyManager = ApiKeyCredentialsProvider.getInstance();
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
      const error = e as AxiosError<ValidationError, Record<string, unknown>>;
      if (error.response?.status === 401) {
        await apiKeyManager.removeAPiKey();
        showErrorMessage("Your open AI key is invalid, Insert a new one");
        await executeCommand("powerCodeAi.updateKey");
      } else {
        const errorMessage = error.response?.data?.error?.message as string;
        showErrorMessage(errorMessage);
        throw new Error(e);
      }
    }
  };

  const generateExplanation = async (
    prompt: string
  ): Promise<{ text: string; usage: string } | undefined> => {
    try {
      const response: AxiosResponse<CreateCompletionResponse> =
        await axiosInstance.post("https://api.openai.com/v1/completions", {
          prompt,
          model: "text-davinci-003",
          max_tokens: 1000, // Adjust the number of tokens as needed
          temperature: 0.7, // Adjust the temperature as needed
          n: 1, // Adjust the number of suggestions as needed
        });

      const usage = response.data.usage as unknown as string;
      const choices = response.data.choices;
      const text = choices[0].text?.trim();
      if (text && usage) {
        return { text, usage };
      }
    } catch (e: any) {
      const error = e as AxiosError<ValidationError, Record<string, unknown>>;
      if (error.response?.status === 401) {
        await apiKeyManager.removeAPiKey();
        showErrorMessage("Your open AI key is invalid, Insert a new one");
        await executeCommand("powerCodeAi.updateKey");
        return;
      } else {
        const errorMessage = error.response?.data?.error?.message as string;
        showErrorMessage(errorMessage);
        throw new Error(e);
      }
    }
  };

  return {
    generateCode,
    generateExplanation,
  };
}

export default ApiService;
