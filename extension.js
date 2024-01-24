const vscode = require('vscode');
const MY_OPENAI_API_KEY = "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";

/**
 * @param {vscode.ExtensionContext} context
 */


function activate(context) {

	console.log('Congratulations, your extension "code-quick" is now active!');

	let configuration = vscode.workspace.getConfiguration('code-quick');
	let apiKey = configuration.get('apiKey');

	if (apiKey === "") {
		vscode.commands.executeCommand('code-quick.ShowInformationMessageToAddAPIKey');
	}

	let AskUserForAPIKey = vscode.commands.registerCommand('code-quick.AskUserForAPIKey', async function () {
		let configuration = vscode.workspace.getConfiguration('code-quick');
		let userAPIKey = vscode.window.showInputBox({
			prompt: "Enter your API key"
		});
		if (userAPIKey) {
			configuration.update('apiKey', ((await userAPIKey).toString()).trim(), vscode.ConfigurationTarget.Global);
		} else {
			configuration.update('apiKey', MY_OPENAI_API_KEY, vscode.ConfigurationTarget.Global)
		}
	});

	const ShowInformationMessageToAddAPIKey = vscode.commands.registerCommand('code-quick.ShowInformationMessageToAddAPIKey', async function () {
		let timeout = 15000;
		Promise.race([
			vscode.window.showInformationMessage('Code Quick prefers to use your own OpenAI API key. The default API key will include requests limits.', 'Add your API key', 'Continue with default API key'),
			new Promise(resolve => setTimeout(() => resolve('Timeout'), timeout))
		]).then(selection => {
			if (selection === "Add your API key") {
				vscode.commands.executeCommand('code-quick.AskUserForAPIKey');
			} else if (selection === 'Timeout') {
				let configuration = vscode.workspace.getConfiguration('code-quick');
				configuration.update('apiKey', MY_OPENAI_API_KEY, vscode.ConfigurationTarget.Global);
			} else {
				let configuration = vscode.workspace.getConfiguration('code-quick');
				configuration.update('apiKey', MY_OPENAI_API_KEY, vscode.ConfigurationTarget.Global);
			}
		});
	});




	let TransformEntireFile = vscode.commands.registerCommand('code-quick.TransformEntireFile', async function () {
		vscode.window.showInformationMessage('Transform Entire File!');
		const userCode = await vscode.window.activeTextEditor.document.getText();
		const userInput = await vscode.window.showInputBox();
		console.log()
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

			const configuration = vscode.workspace.getConfiguration('code-quick');
			const apiKey = configuration.get('apiKey');

			await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${apiKey}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(apiRequestBody)
			}).then((response) => {
				return response.json();
			}).then(async (data) => {
				const response = data.choices[0].message.content;
				const codeToWrite = await extractCodeFromResponse(response)
				console.log("Code to Write -> ", codeToWrite)
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

		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Your code is on the way...",
			cancellable: true
		}, async (progress, token) => {
			token.onCancellationRequested(() => {
				console.log("User canceled the code generation process.");
			});

			const startTime = Date.now();
			await getResponseFromGPT(userInput, userCode);
			const endTime = Date.now();
			const elapsedTime = endTime - startTime;

			// If the operation completed before the minimum expected duration, simulate more progress
			if (elapsedTime < 5000) {
				const remainingTime = 5000 - elapsedTime;
				setTimeout(() => {
					progress.report({ increment: 100, message: "Operation completed!" });
				}, remainingTime);
			}

		});
	});

	context.subscriptions.push(TransformEntireFile);
	context.subscriptions.push(AskUserForAPIKey);
	context.subscriptions.push(ShowInformationMessageToAddAPIKey);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
