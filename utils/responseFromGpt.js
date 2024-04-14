
/*
    purpose : 
        - "error-fixing-selected-code"
        - "error-fixing-entire-code"
        - "insert-code-at-cursor"
        - "insert-code-entire-file"
*/

const vscode = require('vscode');

async function responseFromGpt(selectedText, userInput, purpose, userCode){
    
    const configuration = vscode.workspace.getConfiguration('code-quick');
	const apiKey = configuration.get('apiKey'); 

    let apiMessages = {
        role: "user"
    };

    let systemMessage = {
        role: "system"
    };

    let finalResponse = "";

    if(purpose === "error-fixing-entire-code") {

        apiMessages["content"] = `My code: "${userCode}".\n My prompt: "Fix errors in this code snippet"`;
        systemMessage["content"] = "The user has requested to fix errors in his code snippet please fix the errors. Ensure that the response contains only the code, without any additional text or dummy data. Just change the code snippet to make it correct."

    } else if(purpose === "error-fixing-selected-code") {

        apiMessages["content"] = `My code: "${selectedText}".\n My prompt: "Fix errors in this code snippet"`;
        systemMessage["content"] = "The user has requested to fix errors in his code snippet please fix the errors. Ensure that the response contains only the code, without any additional text or dummy data. Just change the code snippet to make it correct."

    } else if(purpose === "insert-code-at-cursor") {

        apiMessages["content"] = `Please ensure that your response only includes the specific part of the code snippet that I'm asking about because the code you will provide, i am directly gonna add it in my code so if you will provide extra code which is already in my code then it will gonna generate errors in my code so, do not include any additional or unnecessary parts of the code. Here's the specific part I'm asking about: ${userInput}`;
        systemMessage["content"] = "User is making on code and want to add it's requested code in any specific line in his entire code so provide only necessary part of requested code so that inline code generation make sense"

    }else if(purpose === "insert-code-entire-file"){

        apiMessages["content"] = `My code: "${userCode}".\n My prompt: "${userInput}"`;
        systemMessage["content"] = "The user has requested code. Please generate the necessary code based on the provided context. If the user has provided any existing code, analyze it and generate code accordingly. Ensure that the response contains only the code, without any additional text or dummy data not even single line of extra text should be there in response."

    }

    const apiRequestBody = {
        "model": "gpt-3.5-turbo",
        "messages": [
            systemMessage,
            apiMessages
        ]
    }
    console.log("Here1")
    await fetch('https://api.openai.com/v1/chat/completions', {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
    })
    .then((response) => {
        console.log("Here2")
        return response.json();
    })
    .then((response) => {
        console.log("Here4")
        finalResponse = response.choices[0].message.content;
        console.log(finalResponse);
    })
    console.log("Here5")
    console.log(finalResponse, "receiving")
    return finalResponse;

}


module.exports = {
    responseFromGpt
}