// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import axios from "axios";
import * as vscode from "vscode";
// import { OpenAIApi, Configuration } from "openai";
// import * as keytar from "keytar";
// OpenAI API credentials
const openaiKeyService = "OpenAI";
const openaiKeyAccount = "chineduezeh19@gmail.com";
const openaiKey = "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";

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY || openaiKey,
// });
// const openai = new OpenAIApi(configuration);

// Initialize OpenAI API client
// let openaiClient;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getScriptType = () => {
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const languageId = activeEditor.document.languageId;
    return languageId;
  }
  return null;
};

function getHighlightedText() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    return selectedText;
  }
  return null;
}

const insertTextIntoEditor = async (text: string, delay?: number) => {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const position = editor.selection.active;
    const currentPosition = editor.document.offsetAt(position);

    if (delay) {
      // Type each character with a delay
      for (let i = 0; i < text.length; i++) {
        await sleep(delay);
        await editor.edit((editBuilder) => {
          editBuilder.insert(editor.document.positionAt(i), text.charAt(i));
        });
      }
    } else {
      // Insert text at the current cursor position
      editor.edit((editBuilder) => {
        editBuilder.insert(position, text);
      });
    }

    // Move the cursor to the end of the inserted text
    const newPosition = editor.document.positionAt(
      currentPosition + text.length
    );
    editor.selection = new vscode.Selection(newPosition, newPosition);
  }
};

function getPreviousCodeLines() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const document = editor.document;
    const currentPosition = editor.selection.active;

    // Define the number of previous lines to retrieve
    const numPreviousLines = 50;

    // Calculate the starting line number
    let startLine = Math.max(0, currentPosition.line - numPreviousLines);

    // Retrieve the code lines
    const codeLines = [];
    for (let line = startLine; line < currentPosition.line; line++) {
      const lineText = document.lineAt(line).text;
      codeLines.push(lineText);
    }

    return codeLines.join("\n");
  }

  return null;
}

const showInformationMessage = (text: string) => {
  return vscode.window.showInformationMessage(text);
};

const generateExplanation = async (text: string, context?: string) => {
  const script = getScriptType();
  let prompt;
  // qualify the prompt
  if (script) {
    prompt = `You are an experienced ${script} developer, explain this code: ${text}; ${
      context ? `in context of ${context}` : ""
    }`;
  } else {
    prompt = `explain this code ${text}`;
  }

  prompt = prompt.toLowerCase();

  console.log(prompt);

  // Send the text to OpenAI API for autocompletion
  const completion = await axios.post(
    "https://api.openai.com/v1/completions",
    {
      prompt,
      model: "text-davinci-003",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      max_tokens: 1000, // Adjust the number of tokens as needed
      temperature: 0.7, // Adjust the temperature as needed
      n: 1, // Adjust the number of suggestions as needed
    },
    {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Bearer ${openaiKey}`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "Content-Type": "application/json",
      },
    }
  );
  // const completion = await openai.createCompletion();
  const usage = completion.data.usage;

  const choices = completion.data.choices;
  const generatedText = choices[0].text?.trim();
  console.log(generatedText);

  vscode.window.showInformationMessage(generatedText);
  console.log(usage);
};

const makeOpenAiCallAndInsertText = async (text: string) => {
  const script = getScriptType();
  let prompt;
  // qualify the prompt
  if (script) {
    prompt = `You are an experienced ${script} developer, write out ${script} code to ${text}`;
  } else {
    prompt = `write out the code to ${text}`;
  }

  prompt = prompt.toLowerCase();

  // Send the text to OpenAI API for autocompletion
  const completion = await axios.post(
    "https://api.openai.com/v1/completions",
    {
      prompt,
      model: "text-davinci-003",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      max_tokens: 1000, // Adjust the number of tokens as needed
      temperature: 0.7, // Adjust the temperature as needed
      n: 1, // Adjust the number of suggestions as needed
    },
    {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Bearer ${openaiKey}`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "Content-Type": "application/json",
      },
    }
  );
  // const completion = await openai.createCompletion();
  const usage = completion.data.usage;

  const choices = completion.data.choices;
  const generatedText = choices[0].text?.trim();
  if (typeof generatedText === "string") {
    insertTextIntoEditor(generatedText);
  }

  console.log(usage);
  vscode.window.showInformationMessage(
    `${usage?.total_tokens} tokens were used in this request`
  );
};

// Register a command that generates and inserts text

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "power-code-ai" is now active in the web extension host!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "powerCodeAi.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      vscode.window.showInformationMessage(
        "Hello World from Power Code AI in a web extension host!"
      );
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
            makeOpenAiCallAndInsertText(text);
            // Task completed, hide the loading section
            vscode.window.setStatusBarMessage("code generated!", 3000);
          });
          // const progress = vscode.window.withProgress(
          //   {
          //     location: vscode.ProgressLocation.Notification,
          //     title: "Loading...",
          //     cancellable: false,
          //   },
          //   async (progress) => {

          //   }
          // );

          // // Wait for the task to complete
          // await progress;

          // // Extract the generated suggestions from the API response
          // const suggestions = completion.data.choices.map((choice) => {
          //   if (choice.text) {
          //     return choice.text.trim();
          //   } else {
          //     return "null";
          //   }
          // });

          // // Show the suggestions in QuickPick menu
          // const selectedSuggestion = await vscode.window.showQuickPick(
          //   suggestions
          // );

          // Insert the selected suggestion into the editor
          // if (selectedSuggestion) {
          //   editor.edit((editBuilder) => {
          //     editBuilder.replace(editor.selection, selectedSuggestion);
          //   });
          // }
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
      const previousCode = getPreviousCodeLines();

      if (!highlightedText) {
        // Display a message box to the user
        vscode.window.showInformationMessage(
          "Highlight the code you want to be explained"
        );
        return;
      }
      await execFunctionWithProgress(
        generateExplanation(highlightedText, previousCode || undefined)
      );
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(generateAndInsertText);
  context.subscriptions.push(explainThisCode);
}

// This method is called when your extension is deactivated
export function deactivate() {}

// // Store the OpenAI API key
// async function storeApiKey(apiKey: string) {
//   await keytar.setPassword(openaiKeyService, openaiKeyAccount, apiKey);
// }

// // Get the stored OpenAI API key
// async function getStoredApiKey() {
//   return await keytar.getPassword(openaiKeyService, openaiKeyAccount);
// }

// // Check if the OpenAI API key is stored
// async function isApiKeyStored() {
//   const storedApiKey = await getStoredApiKey();
//   return !!storedApiKey;
// }
