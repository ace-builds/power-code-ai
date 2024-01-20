import * as keytar from "keytar";
import { credentials } from "../config";
import { executeCommand, showErrorMessage } from "../utils/vscode";
import { SecretStorage } from "vscode";

export interface ICredentialsProvider {

  getApiKey(): Promise<string | undefined>;
  setApiKey(apiKey: string): Promise<void>;
  removeAPiKey(): Promise<boolean>;

}

export class ApiKeyCredentialsProvider implements ICredentialsProvider {
  constructor(private secretStorage: SecretStorage) {
    if (secretStorage) {
      this.secretStorage = secretStorage
    }
  }

  getApiKey(): Promise<string | undefined> {
    const secret = this.secretStorage;
    if (!secret) {
      throw Error("secret storage not initialized");
    }
    return new Promise((resolve) => {
      secret.get(credentials.openaiKeyService).then((value) => resolve(value));
    });
  }

  async isApiKeySet(hideMessage?: boolean): Promise<boolean> {
    const apiKey = await this.getApiKey();

    if (!apiKey && !hideMessage) {
      showErrorMessage(
        `You do not have an open AI key, kindly set it by opening the command palette and type: power-code API key`
      );
      executeCommand("powerCodeAi.updateKey");
      return false;
    }

    return true;
  }

  setApiKey(apiKey: string): Promise<void> {
    const secret = this.secretStorage;
    if (!secret) {
      throw Error("secret storage not initialized");
    }
    return new Promise((resolve) => {
      resolve(secret.store(credentials.openaiKeyService, apiKey));
    });
  }

  removeAPiKey(): Promise<boolean> {
    const secret = this.secretStorage;
    if (!secret) {
      throw Error("secret storage not initialized");
    }
    return new Promise((resolve) => {
      secret.delete(credentials.openaiKeyService).then((_) => resolve(true));
    });
  }
}
