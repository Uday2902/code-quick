const vscode = require('vscode');
const {codeSuggestion} = require('./utils/codeSuggestion');
const {setCodeSuggestionFlag} = require('./utils/setCodeSuggestionFlag');
const { shareCode, receiveCode, showInformationMessageToAddAPIKey, transformEntireFile, insertAtCursor, fixSelectedCode, fixEntireCode, askUserForAPIKey } = require('./utils/index')

/**
 * @param {vscode.ExtensionContext} context
 */

// class YourWebviewViewProvider {

//     constructor(extensionUri) {
//         this._extensionUri = extensionUri;
//     }

//     async resolveWebviewView(webviewView) {

//         webviewView.webview.options = {
//             enableScripts: true,
//             localResourceRoots: [this._extensionUri]
//         };

//         await this._openHtmlFileInNewTab(webviewView.webview);
//     }

//     async _openHtmlFileInNewTab(webview) {

//         const extensionUri = this._extensionUri;
//         const fileUri = vscode.Uri.joinPath(extensionUri, 'assets', 'chatbot.html');
//         const fileContent = await vscode.workspace.fs.readFile(fileUri);

//         let configuration = vscode.workspace.getConfiguration('code-quick');
//         let apiKey = configuration.get('apiKey');

//         const htmlContentWithApiKey = this._injectApiKeyIntoHtml(fileContent.toString(), apiKey);

//         webview.html = htmlContentWithApiKey;
//     }

//     _injectApiKeyIntoHtml(htmlContent, apiKey) {

//         const placeholder = 'Bearer xxxxxxxx';
//         const index = htmlContent.indexOf(placeholder);

//         if (index !== -1) {
//             const apiKeyScript = `Bearer ${apiKey}`;
//             return htmlContent.slice(0, index) + apiKeyScript + htmlContent.slice(index + placeholder.length);
//         } else {
//             return htmlContent + `<script>const apiKey = '${apiKey}';</script>`;
//         }
//     }
// }

function activate(context) {

    // vscode.commands.executeCommand('setContext', 'myContext', `value`);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'codequick',
            {
                resolveWebviewView: async (webviewView) => {
                    const extensionUri = context.extensionUri;
                    const fileUri = vscode.Uri.joinPath(extensionUri, 'assets', 'chatbot.html');
                    const fileContent = await vscode.workspace.fs.readFile(fileUri);

                    const configuration = vscode.workspace.getConfiguration('code-quick');
                    const apiKey = configuration.get('apiKey');

                    const placeholder = 'Bearer xxxxxxxx';
                    const index = fileContent.indexOf(placeholder);
                    let htmlContent = fileContent.toString();

                    if (index !== -1) {
                        const apiKeyScript = `Bearer ${apiKey}`;
                        htmlContent = htmlContent.slice(0, index) + apiKeyScript + htmlContent.slice(index + placeholder.length);
                    } else {
                        htmlContent += `<script>const apiKey = '${apiKey}';</script>`;
                    }

                    webviewView.webview.options = {
                        enableScripts: true,
                        localResourceRoots: [extensionUri]
                    };

                    webviewView.webview.html = htmlContent;
                }
            }
        )
    );


    let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = "</>";
    statusBar.tooltip = "Code Quick : Code Suggestion"
    statusBar.command = 'code-quick.SetCodeSuggestionFlag';
    statusBar.show();

    let configuration = vscode.workspace.getConfiguration('code-quick');
    let apiKey = configuration.get('apiKey');
    
    if (apiKey === undefined || apiKey === "") {
        vscode.commands.executeCommand('code-quick.ShowInformationMessageToAddAPIKey');
    }
    
    
    let CodeSuggestion = codeSuggestion();
    
    let SetCodeSuggestionFlag = vscode.commands.registerCommand('code-quick.SetCodeSuggestionFlag', setCodeSuggestionFlag);

    let AskUserForAPIKey = vscode.commands.registerCommand('code-quick.AskUserForAPIKey', askUserForAPIKey);

    let ShowInformationMessageToAddAPIKey = vscode.commands.registerCommand('code-quick.ShowInformationMessageToAddAPIKey', showInformationMessageToAddAPIKey);

    let TransformEntireFile = vscode.commands.registerCommand('code-quick.TransformEntireFile', transformEntireFile);

    let InsertAtCursor = vscode.commands.registerCommand('code-quick.InsertAtCursor', insertAtCursor);

    let FixSelectedCode = vscode.commands.registerCommand('code-quick.FixSelectedCode', fixSelectedCode);

    let FixEntireCode = vscode.commands.registerCommand('code-quick.FixEntireCode', fixEntireCode);

    let ShareCode = vscode.commands.registerCommand('code-quick.ShareCode', shareCode);

    let ReceiveCode = vscode.commands.registerCommand('code-quick.ReceiveCode', receiveCode);

    // context.subscriptions.push(...[TransformEntireFile, AskUserForAPIKey, ReceiveCode, ShareCode, InsertAtCursor, ShowInformationMessageToAddAPIKey, FixEntireCode, FixSelectedCode, CodeSuggestion, SetCodeSuggestionFlag]);
    context.subscriptions.push(TransformEntireFile);
    context.subscriptions.push(AskUserForAPIKey);
    context.subscriptions.push(ReceiveCode);
    context.subscriptions.push(ShareCode);
    context.subscriptions.push(InsertAtCursor);
    context.subscriptions.push(ShowInformationMessageToAddAPIKey);
    context.subscriptions.push(FixEntireCode);
    context.subscriptions.push(FixSelectedCode);
    // context.subscriptions.push(CodeSuggestion);
    context.subscriptions.push(SetCodeSuggestionFlag);


}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
    activate,
    deactivate
}