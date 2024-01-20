// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ApiKeyCredentialsProvider } from "./storage/apiKeyStorage";
import ApiService from "./api/service";
import {
  executeCommand,
  getHighlightedText,
  getPreviousLinesOfCodes,
  insertTextIntoEditor,
  showErrorMessage,
  showInformationMessage,
  showWarningMessage,
} from "./utils/vscode";
import { generateCodePrompt, generateExplanationPrompt } from "./utils/prompt";
import { isValidApiKey } from "./utils";



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate({
  subscriptions,
  secrets,
}: vscode.ExtensionContext) {
  const { generateCode, generateExplanation: explainCode } = ApiService(secrets);

  const generateExplanation = async (text: string, context?: string) => {

    const prompt = generateExplanationPrompt(text, context);

    try {
      const result = await explainCode(prompt);
      if (!result?.text || !result.usage) {
        return;
      }
      if (text) {
        showInformationMessage(text);
      }
    } catch (e) {
      showErrorMessage("An error occured");
    }
  };

  const suggestCode = async (text: string) => {

    const prompt = generateCodePrompt(text);

    try {
      // Send the text to OpenAI API for autocompletion
      const result = await generateCode(prompt);
      // const completion = await openai.createCompletion();
      if (!result?.text || !result.usage) {
        return;
      }
      if (typeof result.text === "string") {
        insertTextIntoEditor(result.text);
      }
      console.log(result.usage);
      showInformationMessage(
        `${result.usage?.total_tokens} tokens were used in this request`
      );
    } catch (e) {
      showErrorMessage("An error occured");
    }
  };

  let updateKey = vscode.commands.registerCommand(
    "powerCodeAi.updateKey",
    async () => {
      // The code you place here will be executed every time your command is executed

      const apiKey = await vscode.window.showInputBox({
        prompt: "Enter your OpenAI API key",
        ignoreFocusOut: true,
        password: true,
      });

      if (apiKey && isValidApiKey(apiKey)) {
        const apiKeyManager = new ApiKeyCredentialsProvider(secrets);
        await apiKeyManager.setApiKey(apiKey);
        showInformationMessage("OpenAI API key has been saved successfully.");
      } else {
        showWarningMessage(
          "Invalid OpenAI API key. Please enter a valid key to use this extension."
        );
        return;
      }
    }
  );

  const execFunctionWithProgress = (func: any, displayText?: string) => {
    const progress = vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: displayText || "Loading...",
        cancellable: false,
      },
      async (progress) => {
        if (typeof func === "function") {
          await func();
        } else {
          const aFunc = await func;
        }
      }
    );
    return progress;
  };

  const generateAndInsertText = vscode.commands.registerCommand(
    "powerCodeAi.generateText",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        try {
          // Get the selected text or entire document content
          // const text = editor.document.getText(editor.selection);

          const text = await vscode.window.showInputBox({
            prompt: "what code do you want to generate",
            placeHolder: "Type something...",
          });

          if (!text) {
            vscode.window.showInformationMessage(`You didn't enter a text`);
            return;
          }

          await execFunctionWithProgress(() => {
            suggestCode(text);
            // Task completed, hide the loading section
            vscode.window.setStatusBarMessage("code generated!", 3000);
          });
        } catch (error) {
          console.error("OpenAI API error:", error);
          vscode.window.showErrorMessage(
            "An error occured while trying to connect to openAi"
          );
        }
      }
    }
  );

  const explainThisCode = vscode.commands.registerCommand(
    "powerCodeAi.explainThisCode",
    async () => {
      const highlightedText = getHighlightedText();
      const previousCode = getPreviousLinesOfCodes();

      if (!highlightedText) {
        // Display a message box to the user
        showInformationMessage("Highlight the code you want to be explained");
        return;
      }
      await execFunctionWithProgress(
        generateExplanation(highlightedText, previousCode || undefined)
      );
    }
  );

  subscriptions.push(updateKey, generateAndInsertText, explainThisCode);
}

// This method is called when your extension is deactivated
export function deactivate() { }
