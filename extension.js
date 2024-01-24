// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */


function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "code-quick" is now active!');
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let TransformEntireFile = vscode.commands.registerCommand('code-quick.TransformEntireFile', async function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Code Quick!');
		const userCode = await vscode.window.activeTextEditor.document.getText();
		const userInput = await vscode.window.showInputBox();
		if (userInput.trim() === "") {
			return;
		}
		const getResponseFromGPT = async (userInput, userCode) => {

			const extractCodeFromResponse = (response) => {
				const codePattern = /```(?:[^\n]+)?\n([\s\S]+?)\n```/g;
				let match;
				let finalCode = "";
				while ((match = codePattern.exec(response)) !== null) {
					const extractedCode = match[1];
					finalCode += extractedCode;
				}
				// console.log("Final code -> ", finalCode)
				return finalCode;
			}

			let apiMessages = {
				role: "user",
				content: `My code: "${userCode}".\n My prompt: "${userInput}"`
			};

			const systemMessage = {
				role: "system",
				content: "The user has requested code. Please generate the necessary code based on the provided context. If the user has provided any existing code, analyze it and generate code accordingly. Ensure that the response contains only the code, without any additional text or dummy data not even single line of extra text should be there in response."
			}

			const apiRequestBody = {
				"model": "gpt-3.5-turbo",
				"messages": [
					systemMessage,
					apiMessages
				]
			}

			await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Authorization": `Bearer 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`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(apiRequestBody)
			}).then((response) => {
				return response.json();
			}).then(async (data) => {
				const response = data.choices[0].message.content;
				const codeToWrite = await extractCodeFromResponse(response)
				// console.log("Code to Write -> ", codeToWrite)
				let editor = vscode.window.activeTextEditor;
				if (editor) {
					// let position = editor.selection.active;
					// editor.edit(editBuilder => {
					// 	editBuilder.insert(position, codeToWrite);
					// });
					const document = editor.document;
					const fullRange = new vscode.Range(
						document.positionAt(0),
						document.positionAt(document.getText().length)
					);
					editor.edit(editBuilder => {
						editBuilder.replace(fullRange, codeToWrite);
					});
				}
			})
		}
		getResponseFromGPT(userInput, userCode)
	});

	context.subscriptions.push(TransformEntireFile);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
