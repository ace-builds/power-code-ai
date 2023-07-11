import * as vscode from "vscode";

export const getFileType = () => {
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const languageId = activeEditor.document.languageId;
    return languageId;
  }
  return null;
};
