const { showInformationMessageToAddAPIKey } = require('./showInformationMessageToAddAPIKey');
const { fixEntireCode, fixSelectedCode } = require('./fixErrors');
const { insertAtCursor, transformEntireFile } = require('./codeGeneration');
const { receiveCode, shareCode } = require('./codeSharing');
const {askUserForAPIKey} = require('./askUserForAPIKey');

module.exports = {

    shareCode,
    receiveCode,
    insertAtCursor,
    transformEntireFile,
    fixSelectedCode,
    fixEntireCode,
    askUserForAPIKey,
    showInformationMessageToAddAPIKey

}