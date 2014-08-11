var windowTabs;
var curTabID;
var localStorageObj = {};

$(document).ready(function(){

    $("#clearStorage").click(function(){
        localStorageObj = {};
        chrome.extension.sendMessage({method: "setLocalStorage",data:localStorageObj}, function(response) { }
        );

    })

    //$("#new-list-name").live("click",function(){
    //  var curListName = $(this).text();
    //  $(this).parent().prepend("<input id='input-list-name' value='"+curListName+"'/>");
    //  $("#input-list-name").focus();
    //  $(this).remove();
    //})

    $("#input-list-name").live("keypress",function(e){
        if(e.which == 13){
            //var curListName = $(this).attr("value");
            if(curListName == "") $(this).val("New List");
            //$(this).parent().prepend("<span id='new-list-name'>"+curListName+"</span>");
            $(this).blur();
            return false;
        }
    })

    $("#create-page-tab").click(function(){
        $("#view-page-tab").removeClass("page-selected");
        $(this).addClass("page-selected");
        $("#create-dossier-page").css("display","block");
        $("#view-dossier-list-page").css("display","none");
    })

    $("#view-page-tab").click(function(){
        $("#create-page-tab").removeClass("page-selected");
        $(this).addClass("page-selected");
        $("#view-dossier-list-page").css("display","block");
        $("#create-dossier-page").css("display","none");
    })

/*
    $("#edit-list-name").click(function(){
        if($("#edit-list-name").text() == "edit"){
            var curListName = $("#new-list-name").text();
            $("#new-list-name").parent().prepend("<input id='input-list-name' value='"+curListName+"'/>");
            $("#new-list-name").remove();
            $("#input-list-name").focus();
            $("#edit-list-name").text("done");
        }
        if($("#edit-list-name").text() == "done"){
            var curListName = $("#input-list-name").attr("value");
            $("#input-list-name").parent().prepend("<span id='new-list-name'>"+curListName+"</span>");
            $("#input-list-name").remove();
            $("#edit-list-name").text("edit");
        }
    })
*/

    chrome.windows.getCurrent(function(window){

        console.log(window);

        chrome.tabs.query({active: true},function(t){
            curTabID = t.id;
            console.log(t);

            chrome.tabs.query({windowId: window.id},function(tabs){
                console.log(tabs);

                windowTabs = tabs.slice(0);
                var currentTabCount = 0;

                //tabs.forEach(function(tab){
                $.each(tabs,function(key,tab){
                    if(tab.url.indexOf("chrome://") && tab.url != "" && tab.url.indexOf("dossier_collection") < 0){

                        var tabDiv = '<div id="tab-'+tab.index+'" class="tab-element"><img class="tab-favicon" src="'+tab.favIconUrl+'"/>'+tab.title.substring(0,50)+
                        (tab.title.length > 50 ? '...': '')+'<img src="check.png" class="check"/></div>';
                        $("#tab-container").append(tabDiv);
                        currentTabCount++;
                    }
                });


                //if($("#select-page-container").css("visibility") == "visible" && currentTabCount == 0){
                    // in conditions where there are lists, but no open tabs, show lists first
                //  $("#select-page-container").css("visibility","hidden");
                //  $("#view-dossier-list-page").css("display","block");
                //  $("#create-dossier-page").css("display","none");
                //}

                $(".tab-element").bind("click",function(){
                    $("#select-all").removeClass("selection-toggle");
                    $("#select-none").removeClass("selection-toggle");

                    if($(this).hasClass("selected")){
                        $(this).removeClass("selected");
                        $(this).find(".check").css("display","none");
                    } else {
                        $(this).addClass("selected");
                        $(this).find(".check").css("display","block");
                    }
                    checkSelectedTabs();
                })

                $(".tab-element").addClass("selected");
            });

            chrome.extension.sendMessage({method: "getLocalStorage"}, function(response) {

                if(response.data != "" && response.data != "undefined") {
                    localStorageObj = JSON.parse(response.data);

                    if(localStorageObj.lists != undefined && localStorageObj.lists != "{}"){

                        var listCount = 0;
                        $.each(localStorageObj.lists,function(key, lists){
                            listCount++;
                        });
                        if(listCount > 0){
                            $("#select-page-container").css("visibility","visible");


                            $.each(localStorageObj.lists, function(key, lists){
    //                      localStorageObj.lists.forEach(function(lists){
                                var listItem = "<div class='list-element-collection' style='cursor:pointer' id='"+ lists.date + "'>&#0187; " + lists.title + " (" + lists.tabs.length + " tabs)</div>";

                                $("#lists-container").append(listItem);

                            })
                        }
                    }
                }
            });
        });

    })

    $(".list-element-collection").live("click",function(){
        var thisID = $(this).attr("id");
        var thisList = localStorageObj.lists[thisID];
        localStorageObj.tabToBuild = thisID;
        chrome.extension.sendMessage({method: "setLocalStorage",data:localStorageObj}, function(response) {

            openTabsInNewTab(thisList.title,thisList,false, false);
        });
    })

    $("#select-all").click(function(){
        $(this).addClass("selection-toggle");
        $("#select-none").removeClass("selection-toggle");
        $(".tab-element").each(function(){
            $(this).addClass("selected");
            $(this).find(".check").css("display","block");
        });
        checkSelectedTabs();
    })

    $("#select-none").click(function(){
        $(this).addClass("selection-toggle");
        $("#select-all").removeClass("selection-toggle");
        $(".tab-element").each(function(){
            $(this).removeClass("selected");
            $(this).find(".check").css("display","none");
        });
        checkSelectedTabs();
    })

    function checkSelectedTabs(){
        if($(".selected").length > 0){
            $("#action-bundle").css("opacity",1);
            $("#action-bundle-keep").css("opacity",1);
        } else {
            $("#action-bundle").css("opacity",0.5);
            $("#action-bundle-keep").css("opacity",0.5);
        }
    }

    $("#action-bundle-keep").click(function(){
        sendTabsToCollection(false);
    })

    $("#action-bundle").click(function(){
        sendTabsToCollection(true);
    });

    function sendTabsToCollection(removeFromWindow){
        if($(".selected").length > 0){
            var tabsChecked = 0;
            var tabsCaptured = Array();

            for(var i=0;i<windowTabs.length;i++){
                var tab = windowTabs[i];

                if($("#tab-"+tab.index+"").hasClass("selected")){
                    //stringToEmail += windowTabs[i].title + encodeURIComponent("\n") + windowTabs[i].url + encodeURIComponent("\n\n");
                    tabsCaptured.push(windowTabs[i]);
                    tabsChecked++;
                }
            }
            if(tabsChecked > 0){
                var titleOfList = $("#input-list-name").val();
                if(titleOfList == "") titleOfList = "New List"; //$("#input-list-name").attr("value");

                var creationDate = new Date();
                var cDateString = creationDate.toUTCString().replace(/ /g,"");
                var newListElement = {method: "newTab", title:titleOfList, tabs: tabsCaptured, date:cDateString};

                if(localStorageObj.lists == undefined) localStorageObj.lists = {};

                localStorageObj.lists[cDateString] = newListElement;
                localStorageObj.tabToBuild = cDateString;
                chrome.extension.sendMessage({method: "setLocalStorage",data:localStorageObj}, function(response) {

                    openTabsInNewTab(titleOfList, newListElement, removeFromWindow, true);
                });


            }
        }
    }

    function openTabsInNewTab(listTitle, tabsToList, removeFromWindow, closePopover){
        chrome.tabs.create({ url: "dossier_collection.html" },function(tab){
            chrome.extension.sendMessage(tabsToList, function(response) { });
        });
        if(removeFromWindow) {
            var tabCount = tabsToList.tabs.length;
            var tabsRemoved = 0;
            $.each(tabsToList.tabs,function(key,tabCap){
                chrome.tabs.remove(tabCap.id,function(){
                    tabsRemoved++;
                    if(tabsRemoved == tabCount){
                        if(closePopover){
                            self.close();
                        }
                    }
                });
            });
        } else {
            if(closePopover) self.close();
        }

    }

})
