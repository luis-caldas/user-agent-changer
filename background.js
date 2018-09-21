/* Handles the background functions of the extension
 */

"use strict";

// save the original
var originalUserAgent = navigator.userAgent;

// local variable for the ua
var userAgentString = null;

// variables that will be mirrored to the storage
var localVariables = {
    "status": false,
    "localString": ""
};
var localVariablesKeys = Object.keys(localVariables);

// shorten the chrome storage var
var storage = chrome.storage.sync;

//--------------------------------------------//

function userAgentHandler(receivedDetails) {

    // dont mess with the headers if the extension is not on or the ua is invalid
    if (!localVariables["status"] || !userAgentString)
        return;

    // iterate the headers and change the user agent
    for (let headersIndex = 0; headersIndex < receivedDetails.requestHeaders.length; ++headersIndex) {
        if (receivedDetails.requestHeaders[headersIndex].name === 'User-Agent') {
            receivedDetails.requestHeaders[headersIndex].value = userAgentString;
            break;
        }
    }

    return { requestHeaders: receivedDetails.requestHeaders };
};

// add a listener to acquire the headers before the request
chrome.webRequest.onBeforeSendHeaders.addListener(
    userAgentHandler,
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]
);

function updateIcon() {
    // update the icon shown in the bar
    chrome.browserAction.setIcon({
        path: localVariables["status"] ?
        {
            "19": "/icons/icon19a.png",
            "38": "/icons/icon38a.png"
        } :
        {
            "19": "/icons/icon19.png",
            "38": "/icons/icon38.png"
        }
    })
}

function getUserAgentPieces() {
    let regexSpaces = / (?=(?:"[^"]*"|\([^()]*\)|\[[^\[\]]*\]|\{[^{}]*}|[^"\[{}()\]])*$)/
    return originalUserAgent.split(regexSpaces);
}

function buildAgent() {

    // get the original ua in pieces
    let userAgentPieces = getUserAgentPieces();

    // get the local string matched that will be replaced
    let matchedParts = localVariables["localString"].match(/\${{(.*?)}}/g);
    if (matchedParts === null) matchedParts = [];

    // initialize the variable that contains the final ua
    let outputAgent = localVariables["localString"];

    for (let piecesIndex = 0; piecesIndex < matchedParts.length; ++piecesIndex) {

        // check wich piece was selected
        let numberNow = parseInt(matchedParts[piecesIndex].match(/\${{(.*?)}}/)[1]);

        // match selected piece with the original ua list
        if ((numberNow >= 0) && (numberNow < userAgentPieces.length)) {
            outputAgent = outputAgent.replace(matchedParts[piecesIndex], userAgentPieces[numberNow]);
        } else {
            outputAgent = outputAgent.replace(matchedParts[piecesIndex], "");
        }

    }

    // return the build ua
    return outputAgent;

}

function updateAgent() {
    userAgentString = buildAgent();
}

// get the variables from the local storage
storage.get(localVariablesKeys, function(returnedData){

    let storageBuffer = {};

    let returnedDataKeys = Object.keys(returnedData);

    // iterate the local variables and initialize them
    for (let i = 0; i < localVariablesKeys.length; ++i) {

        // check if it was on the storage
        let keyNowOffset = returnedDataKeys.indexOf(localVariablesKeys[i]);

        if (keyNowOffset > -1) {
            // if it was found, set it to the local variables
            localVariables[localVariablesKeys[i]] = returnedData[returnedDataKeys[keyNowOffset]];
        } else {
            // if not add it to be stored
            storageBuffer[localVariablesKeys[i]] = localVariables[localVariablesKeys[i]];
        }

    }

    // store everything in the buffer
    storage.set(storageBuffer, function(){
        // raise alert if an error occurred
        if (chrome.runtime.lastError) alert("Error on setting the storage data");
    });

    // update the icon once the data is normalized
    updateIcon();

    // build the ua string
    if (localVariables["localString"] && localVariables["status"]) {
        userAgentString = buildAgent();
    }

});
