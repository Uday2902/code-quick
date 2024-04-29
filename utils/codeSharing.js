const vscode = require('vscode');

const shareCode = async () => {

    vscode.window.showInformationMessage('Code Sharing...');

    const editor = vscode.window.activeTextEditor;
    const selection = editor.selection;

    if (selection && !selection.isEmpty) {

        const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
        const selectedText = editor.document.getText(selectionRange);

        let channelName = await vscode.window.showInputBox({
            prompt: "Enter unique channel name"
        });

        // https://different-fish-onesies.cyclic.app/send
        
        await fetch("https://code-quick-backend.onrender.com/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: selectedText.toString(), channel: channelName.toString() })
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Code sharing failed...');
                }
            })
            .then(data => {
                // Handle successful response
                vscode.window.showInformationMessage('Code Sent Successfully...');
            })
            .catch(error => {
                vscode.window.showInformationMessage("Code sharing failed");
            });
            

    }

}

const receiveCode = async () => {

    let channelName = await vscode.window.showInputBox({
        prompt: "Enter unique channel name"
    });

    // https://different-fish-onesies.cyclic.app/receive

    await fetch("https://code-quick-backend.onrender.com/receive", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ channel: channelName.toString() })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error while receiving code...');
            }
        })
        .then(data => {
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                let position = editor.selection.active;
                editor.edit(editBuilder => {
                    editBuilder.insert(position, data.text);
                });
            }
            vscode.window.showInformationMessage("Code received successfully...");
        })
        .catch(error => {
            vscode.window.showInformationMessage(error.message);
        });

}

module.exports = {

    shareCode,
    receiveCode

}