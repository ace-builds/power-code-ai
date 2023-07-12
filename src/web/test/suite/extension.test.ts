import * as assert from "assert";
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as myExtension from "../../extension";

suite("Web Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Sample test", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });
});

describe("Extension", () => {
  it("should activate the extension", () => {
    const subscriptions = {
      subscriptions: [],
    } as unknown;
    const context = subscriptions as vscode.ExtensionContext;

    myExtension.activate(context);

    assert.strictEqual(context.subscriptions.length > 0, true);
    // Additional assertions or verifications can be added here
  });

  it("should deactivate the extension", () => {
    const context = {
      subscriptions: [{ dispose: () => {} }, { dispose: () => {} }],
    };

    myExtension.deactivate();

    assert.strictEqual(context.subscriptions.length, 0);
    // Additional assertions or verifications can be added here
  });
});
