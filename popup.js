/* JS that is loaded with the html frame
 */

"use strict";

// acquire the reference to the background page
var backgroundPage = chrome.extension.getBackgroundPage();

 // return, enter key
var keyPressedToStore = 13;

// shorten the variable
var storage = backgroundPage.storage;

$(document).ready(function() {

    // use function from background to get the original ua in pieces
    let userAgentPieces = backgroundPage.getUserAgentPieces();

    // initialize the symbols string
    let piecesSymbols = "";

    for (var piecesIndex = 0; piecesIndex < userAgentPieces.length; ++piecesIndex) {
        piecesSymbols += "${{" + piecesIndex.toString() + "}}";
        piecesSymbols += " > ";
        piecesSymbols += userAgentPieces[piecesIndex];
        piecesSymbols += "<br>";
    }

    // write the data to the popup
    $("#user-agent-now").html(backgroundPage.originalUserAgent);
    $("#user-agent-pieces").html(piecesSymbols);

    // get the status and show it in the button
    $("#on-or-not").prop("checked", backgroundPage.localVariables["status"]);
    // create the on change callback
    $("#on-or-not").change(function() {

        // store the new state
        let isChecked = $(this).prop("checked");

        // store it
        storage.set({"status": isChecked}, function(){
            if (chrome.runtime.lastError) alert("Error on setting the status data");
        });

        // update local items and update the icon
        backgroundPage.localVariables["status"] = isChecked;
        backgroundPage.updateIcon();

        updateAgent();

    });

    // set the value on start
    $("#regex-input").val(backgroundPage.localVariables["localString"]);
    // create the callback on keypress
    $("#regex-input").keypress(function(eventKey) {

        // enter key is pressed
        if (eventKey.which == 13) {

            // cache string
            let valueString = $(this).val();

            // store it
            storage.set({"localString": valueString}, function(){
                if (chrome.runtime.lastError) alert("Error on setting the storage data");
            });

            // update the local variable
            backgroundPage.localVariables["localString"] = valueString;

            updateAgent();

            return false;
        }

    });

    updateAgent();

    // change the focus to the input bar
    $("#regex-input").focus();

});

// update the user agent and show it
function updateAgent() {
    backgroundPage.updateAgent();
    $("#user-agent-preview").html(backgroundPage.userAgentString);
}
