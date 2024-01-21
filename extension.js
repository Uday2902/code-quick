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
	let disposable = vscode.commands.registerCommand('code-quick.start', async function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Code Quick!');
		const userCode = await vscode.window.activeTextEditor.document.getText();
		const userInput = await vscode.window.showInputBox();

		const getResponseFromGPT = async (userInput, userCode) => {

			let apiMessages = [{ role: "user", content: `My code: "${userCode}".\n My prompt: "${userInput}"` }];

			const systemMessage = {
				role: "system",
				// content: "The user has requested code. Please generate the necessary code based on the provided context. If the user has provided any existing code, analyze it and generate the updated code accordingly. Do not write the code from scratch if existing code is provided. If no code is provided by the user, then write the code from scratch. Ensure that the response contains only the code, without any additional text or dummy data. The response should strictly adhere to the user's request and context."
				content: "The user has requested code. Please generate the necessary code based on the provided context. If the user has provided any existing code, analyze it and generate the updated code accordingly and do not make unnecessary changes. Do not write the code from scratch if existing code is provided. Ensure that the response contains only the code, without any additional text or dummy data not even single line of extra text should be there in response. If user has queried for anything else which is not related to generation of code then you have to give back user's whole code as it is along with added one line of comment which indicated user not requested for code generation."
			}

			const apiRequestBody = {
				"model": "gpt-3.5-turbo",
				"messages": [
					systemMessage,
					...apiMessages
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
			}).then((data) => {
				const codeToWrite = data.choices[0].message.content
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

					// Define the new content
					let newContent = codeToWrite;

					editor.edit(editBuilder => {
						editBuilder.replace(fullRange, newContent);
					});
				}

			}
			)
		}


		getResponseFromGPT(userInput, userCode)


	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
