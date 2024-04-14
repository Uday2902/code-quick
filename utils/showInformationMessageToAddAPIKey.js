const vscode = require('vscode');

const showInformationMessageToAddAPIKey = async () => {

    let timeout = 15000;

    Promise.race([

        vscode.window.showInformationMessage('Code Quick : Add your Openai API key. ( Read instructions on how to get your FREE API key here : https://marketplace.visualstudio.com/items?itemName=uday2902.code-quick )', 'Add your API key', 'Will add later'),

        new Promise(resolve => setTimeout(() => resolve('Timeout'), timeout))

    ]).then(selection => {

        if (selection === "Add your API key") {

            vscode.commands.executeCommand('code-quick.AskUserForAPIKey');

        } else if (selection === 'Timeout') {

            let configuration = vscode.workspace.getConfiguration('code-quick');
            configuration.update('apiKey', "<<-- Add your API key here -->>", vscode.ConfigurationTarget.Global);

        } else {

            let configuration = vscode.workspace.getConfiguration('code-quick');
            configuration.update('apiKey', "<<-- Add your API key here -->>", vscode.ConfigurationTarget.Global);

        }

    });

}

module.exports = {

    showInformationMessageToAddAPIKey

}