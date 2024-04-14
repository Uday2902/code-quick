const vscode = require('vscode');
const { extractCodeFromResponse} = require('./extractCodeFromResponse')
const {responseFromGpt} = require('./responseFromGpt');

const transformEntireFile = async () => {
    console.log("Here1")
    vscode.window.showInformationMessage('Transform Entire File!');

    const userCode = await vscode.window.activeTextEditor.document.getText();
    const userInput = await vscode.window.showInputBox();

    if (userInput.trim() === "") {
        return;
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
        console.log("Here2")
        const response = await responseFromGpt("", userInput, "insert-code-entire-file", userCode);
        console.log("Here3", response);

        let editor = vscode.window.activeTextEditor;

        if (editor) {

            const document = editor.document;
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );
            editor.edit(editBuilder => {
                editBuilder.replace(fullRange, response);
            });

        }

        const endTime = Date.now();
        const elapsedTime = endTime - startTime;

        if (elapsedTime < 5000) {

            const remainingTime = 5000 - elapsedTime;

            setTimeout(() => {
                progress.report({ increment: 100, message: "Operation completed!" });
            }, remainingTime);

        }

    });

}

const insertAtCursor = async () => {

    vscode.window.showInformationMessage('Insert Code at Current Cursor Position!');

    const userInput = await vscode.window.showInputBox();

    if (userInput.trim() === "") {
        return;
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

        const response = await responseFromGpt("",userInput, "insert-code-at-cursor","");
        const codeToWrite = await extractCodeFromResponse(response)

        let editor = vscode.window.activeTextEditor;

        if (editor) {
            let position = editor.selection.active;
            editor.edit(editBuilder => {
                editBuilder.insert(position, codeToWrite);
            });
        }

        const endTime = Date.now();
        
        const elapsedTime = endTime - startTime;

        if (elapsedTime < 5000) {
            const remainingTime = 5000 - elapsedTime;
            setTimeout(() => {
                progress.report({ increment: 100, message: "Operation completed!" });
            }, remainingTime);
        }

    });

}

module.exports = {

    transformEntireFile,
    insertAtCursor

}