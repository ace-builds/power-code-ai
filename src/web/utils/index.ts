export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Check if the OpenAI API key is valid
export const isValidApiKey = (apiKey: string) => {
  // Add your own validation logic here if needed
  return apiKey.length > 0;
};
