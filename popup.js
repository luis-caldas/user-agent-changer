// Waits for popup to load so it can start to add listeners to elements

var background_page = chrome.extension.getBackgroundPage();

var storage = chrome.storage.local;

$(document).ready(function() {
    var user_agent_now = navigator.userAgent;
    var regex_spaces = / (?=(?:"[^"]*"|\([^()]*\)|\[[^\[\]]*\]|\{[^{}]*}|[^"\[{}()\]])*$)/
    var user_agent_pieces = user_agent_now.split(regex_spaces);

    var string_pieces_and_symbols = "";
    for (var pieces_index = 0, pieces_length = user_agent_pieces.length; pieces_index < pieces_length; ++pieces_index) {
        string_pieces_and_symbols += "${{" + pieces_index.toString() + "}}";
        string_pieces_and_symbols += " > ";
        string_pieces_and_symbols += user_agent_pieces[pieces_index];
        string_pieces_and_symbols += "</br>";
    }

    $("#user_agent_now").html(user_agent_now);
    $("#user_agent_pieces").html(string_pieces_and_symbols);

    $("#on_or_not").prop("checked", background_page.on_or_not);
    $("#on_or_not").change(function() {
        var is_checked = $(this).prop("checked");
        storage.set({"status": is_checked}, function(){
            if (chrome.runtime.lastError) alert("Error on setting the status data");
            else {
                background_page.on_or_not = is_checked;
                background_page.update_icon();
                update_agent();
            }
        });
    });

    $("#regex_input").val(background_page.local_string);
    $("#regex_input").keypress(function(event_key) {
        if (event_key.which == 13) {
            var value_string = $(this).val();

            storage.set({"string": value_string}, function(){
                if (chrome.runtime.lastError) alert("Error on setting the storage data");
                else {
                    background_page.local_string = value_string;
                    update_agent();
                }
            });

            return false;
        }
    });

    update_agent();

    $("#regex_input").focus();
});

function update_agent() {
    built_agent = background_page.build_agent();
    background_page.user_agent_string = built_agent;
    $("#user_agent_preview").html(built_agent);
}
