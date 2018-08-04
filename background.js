var user_agent_string = null;
var on_or_not = null;
var local_string = null;

var storage = chrome.storage.local;

var fn1 = false;
var fn2 = false;

storage.get("status", function(data){
    if (chrome.runtime.lastError) {

        storage.set({"status": false}, function(){
            if (chrome.runtime.lastError) alert("Error on setting the status data");
        });

        on_or_not = false;

    } else
        on_or_not = data["status"];

    fn1 = true;
    run_safely_after();
    update_icon();
});

storage.get("string", function(data){
    if (chrome.runtime.lastError) {
        storage.set({"string": ""}, function(){
            if (chrome.runtime.lastError) alert("Error on setting the storage data");
            else local_string = string_saved;
        });

    } else
        local_string = data["string"];

    fn2 = true;
    run_safely_after();
});

//callback function
function run_safely_after() {
    if (fn1 && fn2) {
        if ((local_string != "") && (on_or_not)) {
            user_agent_string = build_agent();
        }
    }
}

user_agent_handler = function (details) {

    if ((user_agent_string == null) || (!on_or_not)) return;

    for (var headers_index = 0, headers_length = details.requestHeaders.length; headers_index < headers_length; ++headers_index) {
        if (details.requestHeaders[headers_index].name === 'User-Agent') {
            details.requestHeaders[headers_index].value = user_agent_string;
            break;
        }
    }

    return { requestHeaders: details.requestHeaders };
};

chrome.webRequest.onBeforeSendHeaders.addListener(user_agent_handler, {urls: ["<all_urls>"]},  ["blocking", "requestHeaders"]);

function update_icon() {
    chrome.browserAction.setIcon({
        path: on_or_not ?
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

function build_agent() {

    var user_agent_now = navigator.userAgent;
    var regex_spaces = / (?=(?:"[^"]*"|\([^()]*\)|\[[^\[\]]*\]|\{[^{}]*}|[^"\[{}()\]])*$)/
    var user_agent_pieces = user_agent_now.split(regex_spaces);
    var pieces_agent_length = user_agent_pieces.length;

    var matched_parts = local_string.match(/\${{(.*?)}}/g);

    var output_agent = local_string;

    for (var pieces_index = 0, pieces_length = matched_parts.length; pieces_index < pieces_length; ++pieces_index) {
        var number = parseInt(matched_parts[pieces_index].match(/\${{(.*?)}}/)[1]);

        if ((number >= 0) && (number < pieces_agent_length)) {
            output_agent = output_agent.replace(matched_parts[pieces_index], user_agent_pieces[number]);
        } else {
            output_agent = output_agent.replace(matched_parts[pieces_index], "");
        }

    }

    if (on_or_not) return output_agent;
    else return user_agent_now;
}
