const vscode = require('vscode');
const { responseFromGpt } = require('./responseFromGpt');

const codeSuggestion = async () => {

    let timeout = null;
    let canSuggest = false;

    vscode.workspace.onDidChangeTextDocument(event => {

        if (timeout !== null) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            canSuggest = true;
            vscode.commands.executeCommand('editor.action.inlineSuggest.trigger');
            timeout = null;
        }, 5000);

    });

    const providerDisposable = vscode.languages.registerInlineCompletionItemProvider(
        '*',
        {
            async provideInlineCompletionItems(document, position, context, token) {
                console.log("Resources");
                let configuration = vscode.workspace.getConfiguration('code-quick');
                let codeSuggestionFlag = configuration.get('codeSuggestionFlag');

                if (codeSuggestionFlag) {

                    if (!canSuggest) {
                        return [];
                    }

                    const editor = vscode.window.activeTextEditor;

                    if (!editor) {
                        return [];
                    }

                    const currentPosition = editor.selection.active;
                    const startPosition = new vscode.Position(0, 0);

                    const selectionRange = new vscode.Range(startPosition, currentPosition);
                    const selectedText = document.getText(selectionRange);
                    
                    const suggestionText = await responseFromGpt("", "", "code-completion", selectedText);

                    const cursorPosition = editor.selection.active;
                    const range = new vscode.Range(cursorPosition, cursorPosition);

                    const inlineSuggestion = new vscode.InlineCompletionItem(suggestionText, range);

                    canSuggest = false;

                    return [inlineSuggestion]
                } else {
                    return [];
                }
            }
        }
    );

    return providerDisposable;

}

module.exports = {
    codeSuggestion
}