const vscode = require('vscode');

const askUserForAPIKey = async () => {

    let configuration = vscode.workspace.getConfiguration('code-quick');
    const apikey = configuration.get('apikey')

    let userAPIKey = vscode.window.showInputBox({
        prompt: "Enter your API key"
    });

    if (userAPIKey) {
        configuration.update('apiKey', ((await userAPIKey).toString()).trim(), vscode.ConfigurationTarget.Global);
    } else {
        configuration.update('apiKey', apikey, vscode.ConfigurationTarget.Global)
    }

}

module.exports = {

    askUserForAPIKey

}