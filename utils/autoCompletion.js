const { responseFromGpt } = require('./responseFromGpt');

const vscode = require('vscode');

const autoCompletion = async (context) => {

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
            // a simple completion item which inserts `console.log`
            const simpleCompletion = new vscode.CompletionItem('console.log');

            // a completion item that inserts its text as snippet,
            // the `insertText`-property is a `SnippetString` which will be
            // honored by the editor.
            const snippetCompletion = new vscode.CompletionItem('Good part of the day');
            snippetCompletion.insertText = new vscode.SnippetString('Good ${1|morning,afternoon,evening}. It is ${1}, right?');
            snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that lets you select the part of the day for your greeting.");

            // return all completion items as array
            return [
                simpleCompletion,
                snippetCompletion
            ];
        }
    }));
    
    const response = await responseFromGpt("","","code-completion",userCode);

}

module.exports = {

    autoCompletion

}