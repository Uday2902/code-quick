
const vscode = require('vscode');
const { extractCodeFromResponse } = require('./extractCodeFromResponse');
const {responseFromGpt} = require('./responseFromGpt')


const fixEntireCode = async () => {

    const userCode = await vscode.window.activeTextEditor.document.getText();

    vscode.window.withProgress({

        location: vscode.ProgressLocation.Notification,
        title: "Fixing errors in entire code...",
        cancellable: true

    }, async (progress, token) => {

        token.onCancellationRequested(() => {
            console.log("User canceled the code generation process.");
        });

        const startTime = Date.now();

        const response = await responseFromGpt("","","error-fixing-entire-code", userCode);

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

const fixSelectedCode = async () => {

    const editor = vscode.window.activeTextEditor;
    const selection = editor.selection;
    
    if (selection && !selection.isEmpty) {

        const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
        const selectedText = editor.document.getText(selectionRange);

        vscode.window.withProgress({

            location: vscode.ProgressLocation.Notification,
            title: "Fixing errors in your code...",
            cancellable: true

        }, async (progress, token) => {

            token.onCancellationRequested(() => {
                console.log("User canceled the code generation process.");
            });

            const startTime = Date.now();
            const response = await responseFromGpt(selectedText,"", "error-fixing-selected-code","");
            let codeToWrite = "";
            if (response.includes("```")) {
                codeToWrite = await extractCodeFromResponse(response)
            } else {
                codeToWrite = response;
            }

            editor.edit((editBuilder) => {
                editBuilder.replace(selection, codeToWrite);
            })

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

}

module.exports = {

    fixEntireCode,
    fixSelectedCode

}