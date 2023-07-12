import * as keytar from "keytar";
import { credentials } from "../config";
import { executeCommand, showErrorMessage } from "../utils/vscode";

// Store the OpenAI API key
export async function setApiKey(apiKey: string) {
  await keytar.setPassword(
    credentials.openaiKeyService,
    credentials.openaiKeyAccount,
    apiKey
  );
}

// Get the stored OpenAI API key
export async function getApiKey() {
  return await keytar.getPassword(
    credentials.openaiKeyService,
    credentials.openaiKeyAccount
  );
}

export async function removeAPiKey() {
  return await keytar.deletePassword(
    credentials.openaiKeyService,
    credentials.openaiKeyAccount
  );
}

export const isApiKeySet = async (hideMessage?: boolean) => {
  const apiKey = await getApiKey();

  if (!apiKey && !hideMessage) {
    showErrorMessage(
      `You do not have an open AI key, kindly set it by opening command palette and type: power-code API key`
    );
    executeCommand("powerCodeAi.updateKey");
    return false;
  }

  return true;
};
