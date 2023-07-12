import { getFileType } from "./script";

export const generateCodePrompt = (input: string) => {
  const script = getFileType();
  let prompt;
  // qualify the prompt
  if (script) {
    prompt = `You are an experienced ${script} developer, write out ${script} code to ${input}`;
  } else {
    prompt = `write out the code to ${input}`;
  }

  prompt = prompt.toLowerCase();
  return prompt;
};

export const generateExplanationPrompt = (input: string, context?: string) => {
  const script = getFileType();
  let prompt;
  // qualify the prompt
  if (script) {
    prompt = `You are an experienced ${script} developer, explain this code: ${input}; ${
      context ? `in context of ${context}` : ""
    }`;
  } else {
    prompt = `explain this code ${input}`;
  }

  prompt = prompt.toLowerCase();

  return prompt;
};
