const vscode = require('vscode');
const { responseFromGpt } = require('./responseFromGpt');

const codeCompletion = async () => {

    let timeout = null;
    let canSuggest = false;

    vscode.workspace.onDidChangeTextDocument(event => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            // console.log('User stopped typing');
            canSuggest = true;
            vscode.commands.executeCommand('editor.action.inlineSuggest.trigger');
            timeout = null;
        }, 5000);
    });

    const providerDisposable = vscode.languages.registerInlineCompletionItemProvider(
        '*',
        {
            async provideInlineCompletionItems(document, position, context, token) {
                if (!canSuggest) {
                    return [];
                }

                console.log("Here1")
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    return [];
                }
                // const suggestionText = "Hello World";
                const currentPosition = editor.selection.active;
                const startPosition = new vscode.Position(0, 0); // Starting position of the document
                const selectionRange = new vscode.Range(startPosition, currentPosition);
                const selectedText = document.getText(selectionRange);
                // console.log("Selected text",selectedText);

                const suggestionText = await responseFromGpt("","","code-completion",selectedText);
                // console.log("Suggestion Text", suggestionText);

                const cursorPosition = editor.selection.active;

                const range = new vscode.Range(cursorPosition, cursorPosition);

                const inlineSuggestion = new vscode.InlineCompletionItem(suggestionText, range);

                canSuggest = false;
                return [inlineSuggestion]
            }
        }
    );

    return providerDisposable;

}

module.exports = {
    codeCompletion
}