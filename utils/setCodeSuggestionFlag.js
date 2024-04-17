const vscode = require('vscode');

const setCodeSuggestionFlag = async () => {

    const configuration = vscode.workspace.getConfiguration('code-quick');
    const codeSuggestionFlag = configuration.get('codeSuggestionFlag');

    let timeout = 15000;

    Promise.race([

        vscode.window.showInformationMessage(codeSuggestionFlag?"Are you sure want to turn off code suggestion ?":"Are you sure want to turn on code suggestion (This will increase the number of your API calls)", "Yes", "No"),

        new Promise(resolve => setTimeout(() => resolve('Timeout'), timeout))

    ]).then(selection => {

        if (selection === "Yes") {

            codeSuggestionFlag ? configuration.update('codeSuggestionFlag', false, vscode.ConfigurationTarget.Global) : configuration.update('codeSuggestionFlag', true, vscode.ConfigurationTarget.Global)

        } else if (selection === 'Timeout' || selection === "No") {
            
        }

    });


}

module.exports = {
    setCodeSuggestionFlag
}