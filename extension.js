
const vscode = require('vscode');
const {shareCode, receiveCode, showInformationMessageToAddAPIKey,transformEntireFile, insertAtCursor, fixSelectedCode, fixEntireCode, askUserForAPIKey} = require('./utils/index')

/**
 * @param {vscode.ExtensionContext} context
 */

// class YourWebviewViewProvider {
// 	constructor(extensionUri) {
// 		this._extensionUri = extensionUri;
// 	}

// 	resolveWebviewView(webviewView) {
// 		webviewView.webview.options = {
// 			enableScripts: true,
// 			localResourceRoots: [this._extensionUri]
// 		};

// 		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
// 	}

// 	_getHtmlForWebview(webview) {

// 		const panel = vscode.window.createWebviewPanel(
// 			'Code Quick API Sharing',
// 			'Code Quick',
// 			vscode.ViewColumn.One,
// 			{}
// 		);
// 		const apiKey_confg = vscode.workspace.getConfiguration().get('code-quick.apiKey');
// 		panel.webview.postMessage({ type: 'apiKey', value: apiKey_confg });

// 		const filePath = path.join(this._extensionUri.fsPath, './assets/chatbot.html');

// 		// Read the file's contents and return as a string
// 		const html = fs.readFileSync(filePath, 'utf8');

// 		return html;
// 	}
// }

function activate(context) {

	// vscode.commands.executeCommand('setContext', 'myContext', `value`);

	// context.subscriptions.push(
	// 	vscode.window.registerWebviewViewProvider(
	// 		'codequick',
	// 		new YourWebviewViewProvider(context.extensionUri)
	// 	)
	// );
	
	let configuration = vscode.workspace.getConfiguration('code-quick');
	let apiKey = configuration.get('apiKey');
	
	if (apiKey === undefined || apiKey === "") {
		vscode.commands.executeCommand('code-quick.ShowInformationMessageToAddAPIKey');
	}

	let AskUserForAPIKey = vscode.commands.registerCommand('code-quick.AskUserForAPIKey', askUserForAPIKey);

	let ShowInformationMessageToAddAPIKey = vscode.commands.registerCommand('code-quick.ShowInformationMessageToAddAPIKey', showInformationMessageToAddAPIKey);

	let TransformEntireFile = vscode.commands.registerCommand('code-quick.TransformEntireFile', transformEntireFile);

	let InsertAtCursor = vscode.commands.registerCommand('code-quick.InsertAtCursor', insertAtCursor);

	let FixSelectedCode = vscode.commands.registerCommand('code-quick.FixSelectedCode', fixSelectedCode);

	let FixEntireCode = vscode.commands.registerCommand('code-quick.FixEntireCode', fixEntireCode);

	let ShareCode = vscode.commands.registerCommand('code-quick.ShareCode', shareCode);

	let ReceiveCode = vscode.commands.registerCommand('code-quick.ReceiveCode', receiveCode);

	context.subscriptions.push(...[TransformEntireFile, AskUserForAPIKey, ReceiveCode, ShareCode, InsertAtCursor, ShowInformationMessageToAddAPIKey, FixEntireCode, FixSelectedCode]);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}