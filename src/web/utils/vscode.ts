import * as vscode from "vscode";
import { sleep } from ".";

export const showInformationMessage = (text: string) => {
  return vscode.window.showInformationMessage(text);
};

export const showErrorMessage = (text: string) => {
  return vscode.window.showErrorMessage(text);
};
export const showWarningMessage = (text: string) => {
  return vscode.window.showWarningMessage(text);
};

export const getHighlightedText = () => {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    return selectedText;
  }
  return null;
};

export const insertTextIntoEditor = async (text: string, delay?: number) => {
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

export const getPreviousLinesOfCodes = (numberOfLines?: number) => {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const document = editor.document;
    const currentPosition = editor.selection.active;

    // Define the number of previous lines to retrieve
    const numPreviousLines = numberOfLines || 50;

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
};

export const executeCommand = async (commandName: string) => {
  try {
    await vscode.commands.executeCommand(commandName);
  } catch (error) {
    console.error(`Failed to execute command ${commandName}:`, error);
  }
};
