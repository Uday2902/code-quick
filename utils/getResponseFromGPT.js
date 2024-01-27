const vscode = require('vscode');

const getResponseFromGPT = async (apiRequestBody) => {

    // const extractCodeFromResponse = (response) => {

    //     const codePattern = /```(?:[^\n]+)?\n([\s\S]+?)\n```/g;
    //     let match;
    //     let finalCode = "";
    //     while ((match = codePattern.exec(response)) !== null) {
    //         const extractedCode = match[1];
    //         finalCode += extractedCode;
    //     }

    //     return finalCode;
    // }

    const configuration = vscode.workspace.getConfiguration('code-quick');
    const apiKey = configuration.get('apiKey');

    await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)

    }).then((response) => {

        return response.json();

    }).then(async (data) => {

        const response = data.choices[0].message.content;
        console.log("Response",response);
        // const codeToWrite = await extractCodeFromResponse(response)
        const codeToWrite = response
        console.log("Code to Write -> ", codeToWrite)
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );
            editor.edit(editBuilder => {
                editBuilder.replace(fullRange, codeToWrite);
            });
        }
    })
}

module.exports = {
    getResponseFromGPT
}