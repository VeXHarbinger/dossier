var tabs;
var thisID;
var curTabID;
var thisTitle;
var localStorageObj;
var stringToCopy;

chrome.windows.getCurrent(function(window){

    chrome.tabs.getSelected(window.id,function(t){
        curTabID = t.id;
    });
});

$(document).ready(function(){
    $("#remove-list-button").click(function(){
        $("#remove-list-popover").slideDown();
    })
    $("#remove-button-yes").click(function(){
        chrome.extension.sendMessage({method: "getLocalStorage"}, function(response) {

            if(response.data != "" && response.data != "undefined") {
                localStorageObj = JSON.parse(response.data);

                delete localStorageObj.lists[thisID];

                chrome.extension.sendMessage({method: "setLocalStorage",data:localStorageObj}, function(response) {
                        chrome.tabs.remove(curTabID,function(){ })
                    }
                );
            }
        });
    });
    $("#remove-button-no").click(function(){
        $("#remove-list-popover").slideUp();
    });

    $("#action-copy").click(function(){
        copyToClipboard(stringToCopy);
        $(this).text("Copied!").css("background-color","#F22");

        // window.location.href = stringToEmail;
    })

    $("#action-restore").click(function(){
        //tabs.forEach(function(tab){
        $.each(tabs,function(key,tab){
            var tabInfo = {};
            tabInfo.url = tab.url;
            tabInfo.selected = false;
            chrome.tabs.create(tabInfo, function(){ });
        });
    })

});

function copyToClipboard( text ) {
  var input = document.getElementById( 'hidden-copy-input' );
  input.innerText = text;
  input.focus();
  input.select();
  document.execCommand( 'Copy' );
  input.blur();
}

function setCopyText(){
    var batchString = "Dossier: "+thisTitle+ "\r\n\r\n";

    $.each(tabs,function(key,tab){
        batchString += tab.title.toString() + "\r\n" + tab.url.toString() + "\r\n\r\n";
    });

    stringToCopy = batchString;
}

chrome.extension.sendMessage({method: "getLocalStorage"}, function(response) {
    console.log(response.data);
    if(response.data != "" && response.data != "undefined") {
        localStorageObj = JSON.parse(response.data);

        var thisTabObj = localStorageObj.lists[localStorageObj.tabToBuild];
        tabs = localStorageObj.lists[localStorageObj.tabToBuild].tabs; //request.tabs.slice(0);
        thisID = thisTabObj .date;

        $("#title").text("Dossier: "+thisTabObj.title);
        document.title = thisTabObj.title;
        thisTitle = thisTabObj.title;

        //request.tabs.forEach(function(tab){
        $.each(thisTabObj.tabs,function(key,tab){
            var tabDiv = '<div class="tab-element-collection"><img class="tab-favicon" src="'
            + tab.favIconUrl+'"/>'+
            tab.title+'<a href="'+tab.url+'" target="_blank">link</a></div>';

            $("#dossier-tabs-saved-container").append(tabDiv);

        });
        setCopyText();
    }
});


chrome.extension.onMessage.addListener(
    function(requester, sender, sendMessage) {
        if(requester.method == "newTab"){
            //if (request.tabs.length > 0){
                sendMessage({success: true});



            //}
        }
});
