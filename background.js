

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {

		if (request.method == "getLocalStorage") {
			if(localStorage.clump == undefined) localStorage.clump = "";
			sendResponse({message:"getLocal",data: localStorage.clump});
		} else if(request.method == "setLocalStorage"){
			if(localStorage.clump == "undefined") localStorage.clump = "";
			localStorage.clump = JSON.stringify(request.data);
			sendResponse({message:"setLocal",data: JSON.parse(localStorage.clump)});
		} else if(request.method == "copyToClipboard"){
			var response = copy(request.text);
			sendResponse(response);
		} else {
			sendResponse({});
		}

});

