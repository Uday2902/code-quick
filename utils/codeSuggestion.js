const vscode = require('vscode');
const { responseFromGpt } = require('./responseFromGpt');

const codeSuggestion = async () => {

    try {

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
                            vscode.window.showErrorMessage('Switch to Editor');
                            return [];
                        }

                        const currentPosition = editor.selection.active;
                        const startPosition = new vscode.Position(0, 0);

                        const selectionRange = new vscode.Range(startPosition, currentPosition);
                        const selectedText = document.getText(selectionRange);
                        let suggestionText = "";
                        try{
                            suggestionText = await responseFromGpt("", "", "code-completion", selectedText);
                        }catch(err){
                            console.log("An error occurred during the API call.", err);
                        }


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

    } catch (err) {

        console.log("There seems to be an issue with the code suggestion : ",err);
        vscode.window.showErrorMessage('There seems to be an issue with the code suggestion!');

    }

}

module.exports = {
    codeSuggestion
}