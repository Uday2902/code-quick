require('dotenv').config({ path: '/.env' })
const vscode = require('vscode');
const fs = require('fs')
const path = require('path')
const axios = require('axios')

const MY_OPENAI_API_KEY = "sk-xxxxx";

/**
 * @param {vscode.ExtensionContext} context
 */

class YourWebviewViewProvider {
	constructor(extensionUri) {
		this._extensionUri = extensionUri;
	}

	resolveWebviewView(webviewView) {
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
	}

	_getHtmlForWebview(webview) {

		const panel = vscode.window.createWebviewPanel(
			'Code Quick API Sharing',
			'Code Quick',
			vscode.ViewColumn.One,
			{}
		);
		const apiKey_confg = vscode.workspace.getConfiguration().get('code-quick.apiKey');
		panel.webview.postMessage({ type: 'apiKey', value: apiKey_confg });

		const filePath = path.join(this._extensionUri.fsPath, './assets/chatbot.html');

		// Read the file's contents and return as a string
		const html = fs.readFileSync(filePath, 'utf8');

		return html;
	}
}

function activate(context) {

	vscode.commands.executeCommand('setContext', 'myContext', `value`);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			'codequick',
			new YourWebviewViewProvider(context.extensionUri)
		)
	);

	console.log('Congratulations, your extension "code-quick" is now active!');

	let configuration = vscode.workspace.getConfiguration('code-quick');
	let apiKey = configuration.get('apiKey');

	if (apiKey === "") {
		vscode.commands.executeCommand('code-quick.ShowInformationMessageToAddAPIKey');
	}

	let AskUserForAPIKey = vscode.commands.registerCommand('code-quick.AskUserForAPIKey', async function () {
		// console.log("Starting")
		// const telemetryService = (vscode.extensions.getExtension('code-quick'))?.exports;
		// console.log("Telementary Service - ",telemetryService)
		// if (telemetryService) {
		// 	const installationId = telemetryService.getExtensionInfo().installationId;
		// 	console.log('Installation ID:', installationId);
		// } else {
		// 	console.error('Telemetry service not available.');
		// }
		// console.log("ended")
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
		console.log("Showinf message");
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
				console.log("APi key - ", MY_OPENAI_API_KEY);
				configuration.update('apiKey', MY_OPENAI_API_KEY, vscode.ConfigurationTarget.Global);
			}
		});
	});

	let TransformEntireFile = vscode.commands.registerCommand('code-quick.TransformEntireFile', async function () {

		vscode.window.showInformationMessage('Transform Entire File!');
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
				console.log("Response", response);
				// const codeToWrite = await extractCodeFromResponse(response)
				const codeToWrite = response
				console.log("Code to Write -> ", codeToWrite)
				let editor = vscode.window.activeTextEditor;
				if (editor) {
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

			if (elapsedTime < 5000) {
				const remainingTime = 5000 - elapsedTime;
				setTimeout(() => {
					progress.report({ increment: 100, message: "Operation completed!" });
				}, remainingTime);
			}

		});
	});


	let InsertAtCursor = vscode.commands.registerCommand('code-quick.InsertAtCursor', async function () {

		vscode.window.showInformationMessage('Insert Code at Current Cursor Position!');
		const userInput = await vscode.window.showInputBox();
		const userCode = await vscode.window.activeTextEditor.document.getText();

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

				return finalCode;
			}

			let apiMessages = {
				role: "user",
				content: `Please ensure that your response only includes the specific part of the code snippet that I'm asking about because the code you will provide, i am directly gonna add it in my code so if you will provide extra code which is already in my code then it will gonna generate errors in my code so, do not include any additional or unnecessary parts of the code. Here's the specific part I'm asking about: ${userInput}`
			};

			const systemMessage = {
				role: "system",
				content: "User is making on code and want to add it's requested code in any specific line in his entire code so provide only necessary part of requested code so that inline code generation make sense"
			};


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
				console.log("Response -> ", response)
				const codeToWrite = await extractCodeFromResponse(response)
				console.log("Code to Write -> ", codeToWrite)
				let editor = vscode.window.activeTextEditor;
				if (editor) {
					let position = editor.selection.active;
					editor.edit(editBuilder => {
						editBuilder.insert(position, codeToWrite);
					});

					// const document = editor.document;
					// const fullRange = new vscode.Range(
					// 	document.positionAt(0),
					// 	document.positionAt(document.getText().length)
					// );
					// editor.edit(editBuilder => {
					// 	editBuilder.replace(fullRange, codeToWrite);
					// });
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

			if (elapsedTime < 5000) {
				const remainingTime = 5000 - elapsedTime;
				setTimeout(() => {
					progress.report({ increment: 100, message: "Operation completed!" });
				}, remainingTime);
			}

		});
	});


	let FixSelectedCode = vscode.commands.registerCommand('code-quick.FixSelectedCode', async function () {

		const configuration = await vscode.workspace.getConfiguration('code-quick');
		const apiKey = configuration.get('apiKey');

		const editor = vscode.window.activeTextEditor;
		const selection = editor.selection;
		console.log("Selection -->> ", selection);
		if (selection && !selection.isEmpty) {
			const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
			const selectedText = editor.document.getText(selectionRange);
			console.log(selectedText)

			const extractCodeFromResponse = (response) => {

				const codePattern = /```(?:[^\n]+)?\n([\s\S]+?)\n```/g;
				let match;
				let finalCode = "";
				while ((match = codePattern.exec(response)) !== null) {
					const extractedCode = match[1];
					finalCode += extractedCode;
				}

				return finalCode;
			}

			let apiMessages = {
				role: "user",
				content: `My code: "${selectedText}".\n My prompt: "Fix errors in this code snippet"`
			};

			const systemMessage = {
				role: "system",
				content: "The user has requested to fix errors in his code snippet please fix the errors. Ensure that the response contains only the code, without any additional text or dummy data. Just change the code snippet to make it correct."
			}

			const apiRequestBody = {
				"model": "gpt-3.5-turbo",
				"messages": [
					systemMessage,
					apiMessages
				]
			}

			await fetch('https://api.openai.com/v1/chat/completions', {
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
				console.log("response", response);
				let codeToWrite = "";
				if (response.includes("```")) {
					codeToWrite = await extractCodeFromResponse(response)
				} else {
					codeToWrite = response;
				}


				// console.log("Code to write", codeToWrite);
				editor.edit((editBuilder) => {
					editBuilder.replace(selection, codeToWrite);
				})
			})

		}

	});


	let FixEntireCode = vscode.commands.registerCommand('code-quick.FixEntireCode', async function () {

		vscode.window.showInformationMessage('Fixing errors of entire file...');
		const userCode = await vscode.window.activeTextEditor.document.getText();

		const getResponseFromGPT = async (userInput, userCode) => {

			const extractCodeFromResponse = (response) => {

				const codePattern = /```(?:[^\n]+)?\n([\s\S]+?)\n```/g;
				let match;
				let finalCode = "";
				while ((match = codePattern.exec(response)) !== null) {
					const extractedCode = match[1];
					finalCode += extractedCode;
				}

				return finalCode;
			}

			let apiMessages = {
				role: "user",
				content: `My code: "${userCode}".\n My prompt: "Solve errors in my code"`
			};

			const systemMessage = {
				role: "system",
				content: "The user has requested to fix errors in his code please fix the errors. Ensure that the response contains only the code, without any additional text or dummy data. Just change the code to make it correct."
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
				console.log("Response", response);
				// const codeToWrite = await extractCodeFromResponse(response)
				const codeToWrite = response
				console.log("Code to Write -> ", codeToWrite)
				let editor = vscode.window.activeTextEditor;
				if (editor) {
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
			await getResponseFromGPT(userCode, userCode);
			const endTime = Date.now();
			const elapsedTime = endTime - startTime;

			if (elapsedTime < 5000) {
				const remainingTime = 5000 - elapsedTime;
				setTimeout(() => {
					progress.report({ increment: 100, message: "Operation completed!" });
				}, remainingTime);
			}

		});

	});


	let ShareCode = vscode.commands.registerCommand('code-quick.ShareCode', async function () {
		vscode.window.showInformationMessage('Code Sharing...');
		const editor = vscode.window.activeTextEditor;
		const selection = editor.selection;
		console.log("Selection -->> ", selection);
		if (selection && !selection.isEmpty) {
			const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
			const selectedText = editor.document.getText(selectionRange);
			console.log(selectedText)
			let channelName = await vscode.window.showInputBox({
				prompt: "Enter unique channel name"
			});
			await axios.post("https://code-quick-backend.onrender.com/send", {text: selectedText.toString(), channel: channelName.toString()})
				.then((response) => {console.log("Code Sent", response);vscode.window.showInformationMessage('Code Sent Successfully...')})
				.catch(err => {console.log(err);vscode.window.showInformationMessage('Code sharing failed...');})
		}
	});


	let ReceiveCode = vscode.commands.registerCommand('code-quick.ReceiveCode', async function () {
		
		let channelName = await vscode.window.showInputBox({
			prompt: "Enter unique channel name"
		});
		await axios.post("https://code-quick-backend.onrender.com/receive",{channel: channelName.toString()})
			.then((response) => {
				console.log("Response ->>>",response.data.text)
				let editor = vscode.window.activeTextEditor;
				if (editor) {
					let position = editor.selection.active;
					editor.edit(editBuilder => {
						editBuilder.insert(position, response.data.text);
					});
				}
				vscode.window.showInformationMessage("Code received successfully...")
			})
			.catch(err => {console.log(err);vscode.window.showInformationMessage('Error while receiving code...');})
	});

	context.subscriptions.push(TransformEntireFile);
	context.subscriptions.push(AskUserForAPIKey);
	context.subscriptions.push(ReceiveCode);
	context.subscriptions.push(ShareCode);
	context.subscriptions.push(InsertAtCursor);
	context.subscriptions.push(ShowInformationMessageToAddAPIKey);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}