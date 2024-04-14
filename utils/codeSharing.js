const vscode = require('vscode');
const axios = require('axios');

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

        // https://code-quick-backend.onrender.com/send

        await axios.post("https://different-fish-onesies.cyclic.app/send", { text: selectedText.toString(), channel: channelName.toString() })
            .then(response => vscode.window.showInformationMessage('Code Sent Successfully...'))
            .catch(err => vscode.window.showInformationMessage('Code sharing failed...'))

    }

}

const receiveCode = async () => {

    let channelName = await vscode.window.showInputBox({
        prompt: "Enter unique channel name"
    });

    // https://code-quick-backend.onrender.com/receive

    await axios.post("https://different-fish-onesies.cyclic.app/receive", { channel: channelName.toString() })
        .then((response) => {
            
            let editor = vscode.window.activeTextEditor;

            if (editor) {
                let position = editor.selection.active;
                editor.edit(editBuilder => {
                    editBuilder.insert(position, response.data.text);
                });
            }

            vscode.window.showInformationMessage("Code received successfully...")
        })
        .catch(err => vscode.window.showInformationMessage('Error while receiving code...'))
}

module.exports = {

    shareCode,
    receiveCode
    
}