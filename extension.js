const vscode = require('vscode');
const {codeCompletion} = require('./utils/codeCompletion');
const { shareCode, receiveCode, showInformationMessageToAddAPIKey, transformEntireFile, insertAtCursor, fixSelectedCode, fixEntireCode, askUserForAPIKey } = require('./utils/index')

/**
 * @param {vscode.ExtensionContext} context
 */

class YourWebviewViewProvider {

    constructor(extensionUri) {
        this._extensionUri = extensionUri;
    }

    async resolveWebviewView(webviewView) {

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        await this._openHtmlFileInNewTab(webviewView.webview);
    }

    async _openHtmlFileInNewTab(webview) {

        const extensionUri = this._extensionUri;
        const fileUri = vscode.Uri.joinPath(extensionUri, 'assets', 'chatbot.html');
        const fileContent = await vscode.workspace.fs.readFile(fileUri);

        let configuration = vscode.workspace.getConfiguration('code-quick');
        let apiKey = configuration.get('apiKey');

        const htmlContentWithApiKey = this._injectApiKeyIntoHtml(fileContent.toString(), apiKey);

        webview.html = htmlContentWithApiKey;
    }

    _injectApiKeyIntoHtml(htmlContent, apiKey) {

        const placeholder = 'Bearer xxxxxxxx';
        const index = htmlContent.indexOf(placeholder);

        if (index !== -1) {
            const apiKeyScript = `Bearer ${apiKey}`;
            return htmlContent.slice(0, index) + apiKeyScript + htmlContent.slice(index + placeholder.length);
        } else {
            return htmlContent + `<script>const apiKey = '${apiKey}';</script>`;
        }
    }
}

function activate(context) {

    // vscode.commands.executeCommand('setContext', 'myContext', `value`);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'codequick',
            new YourWebviewViewProvider(context.extensionUri)
        )
    );

    // let timeout = null;
    // let canSuggest = false;
    
    // vscode.workspace.onDidChangeTextDocument(event => {
    //     if (timeout !== null) {
    //         clearTimeout(timeout);
    //     }
    
    //     timeout = setTimeout(() => {
    //         console.log('User stopped typing');
    //         canSuggest = true;
    //         vscode.commands.executeCommand('editor.action.inlineSuggest.trigger');
    //         timeout = null;
    //     }, 5000);
    // });
    
    // const providerDisposable = vscode.languages.registerInlineCompletionItemProvider(
    //     '*',
    //     {
    //         async provideInlineCompletionItems(document, position, context, token) {
    //             if (!canSuggest) {
    //                 return [];
    //             }
    
    //             console.log("Here1")
    //             const editor = vscode.window.activeTextEditor;
    //             if (!editor) {
    //                 return [];
    //             }
    
    //             // const suggestionText = "Hello World";
    //             const suggestionText = await responseFromGpt();
    
    //             const cursorPosition = editor.selection.active;
    
    //             const range = new vscode.Range(cursorPosition, cursorPosition);
    
    //             const inlineSuggestion = new vscode.InlineCompletionItem(suggestionText, range);
    
    //             canSuggest = false; // Reset the flag
    //             return [inlineSuggestion]
    //         }
    //     }
    // );

    
    let configuration = vscode.workspace.getConfiguration('code-quick');
    let apiKey = configuration.get('apiKey');
    
    if (apiKey === undefined || apiKey === "") {
        vscode.commands.executeCommand('code-quick.ShowInformationMessageToAddAPIKey');
    }

    let CodeCompletion = codeCompletion();
    
    let AskUserForAPIKey = vscode.commands.registerCommand('code-quick.AskUserForAPIKey', askUserForAPIKey);

    let ShowInformationMessageToAddAPIKey = vscode.commands.registerCommand('code-quick.ShowInformationMessageToAddAPIKey', showInformationMessageToAddAPIKey);

    let TransformEntireFile = vscode.commands.registerCommand('code-quick.TransformEntireFile', transformEntireFile);

    let InsertAtCursor = vscode.commands.registerCommand('code-quick.InsertAtCursor', insertAtCursor);

    let FixSelectedCode = vscode.commands.registerCommand('code-quick.FixSelectedCode', fixSelectedCode);

    let FixEntireCode = vscode.commands.registerCommand('code-quick.FixEntireCode', fixEntireCode);

    let ShareCode = vscode.commands.registerCommand('code-quick.ShareCode', shareCode);

    let ReceiveCode = vscode.commands.registerCommand('code-quick.ReceiveCode', receiveCode);

    context.subscriptions.push(...[TransformEntireFile, AskUserForAPIKey, ReceiveCode, ShareCode, InsertAtCursor, ShowInformationMessageToAddAPIKey, FixEntireCode, FixSelectedCode, CodeCompletion]);

}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
    activate,
    deactivate
}