const extractCodeFromResponse = (response) => {

    const codePattern = /```(?:[^\n]+)?\n([\s\S]+?)\n```/g;
    let match;
    let finalCode = "";
    while ((match = codePattern.exec(response)) !== null) {
        const extractedCode = match[1];
        finalCode += extractedCode;
    }

    return finalCode;
}

module.exports = {
    extractCodeFromResponse
}