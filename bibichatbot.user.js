// ==UserScript==
// @name       Bibi (Chatbot for FONFON)
// @namespace  http://about.me/andrestaltz
// @version    0.8
// @description  Para trollar o doigo automaticamente
// @match      https://www.facebook.com/messages/conversation-id.495430780509771
// @match      www.facebook.com/messages/conversation-id.495430780509771
// @include      https://www.facebook.com/messages/conversation-id.495430780509771
// @include      www.facebook.com/messages/conversation-id.495430780509771
// @include      *
// @copyright  2012+, You
// ==/UserScript==

var bot_name = "Bibi Chatbot";
var yes_or_no_question = "sim ou não?";
var responses = {};
var random_responses = {};
var laughter_responses = {};

var textArea = null;
var replyButton;
var replyEvt;
var lastAuthor = null;

function submit_msg(msg) {
	textArea.value = msg;
	textArea.className = textArea.className.replace('DOMControl_placeholder','');
	replyButton = document.getElementsByClassName('_1qp5')[3];
	replyEvt = document.createEvent('MouseEvents');
	replyEvt.initEvent('click',true,true);
	replyButton.dispatchEvent(replyEvt);
}

function refresh_data() {
	// console.log("Refreshing data...");
	GM_xmlhttpRequest({
		method: "GET",
		url: "http://raw.github.com/STALTZ/bibichatbot/master/responses.json",
		headers: {
			"Content-type": "charset=utf-8"
		},
		onload: function(response) {
			responses = eval("(" + response.responseText + ")");
			// console.log(responses);
		},
	});
	GM_xmlhttpRequest({
		method: "GET",
		url: "http://raw.github.com/STALTZ/bibichatbot/master/random.json",
		headers: {
			"Content-type": "charset=utf-8"
		},
		onload: function(response) {
			random_responses = eval("(" + response.responseText + ")");
			// console.log(random_responses);
		},
	});
	GM_xmlhttpRequest({
		method: "GET",
		url: "http://raw.github.com/STALTZ/bibichatbot/master/laughter.json",
		headers: {
			"Content-type": "charset=utf-8"
		},
		onload: function(response) {
			laughter_responses = eval("(" + response.responseText + ")");
			// console.log(laughter_responses);
		},
	});
}

function say_random() {
	if(lastAuthor != bot_name) {
		submit_msg( random_responses["Random"][Math.floor(Math.random()*random_responses["Random"].length)] );
	}
}

var previousPolledParagraph = null;
function poll() {
	// console.log("Polling the msgs...");
	var listMsgs = document.getElementsByClassName('webMessengerMessageGroup');
	if(listMsgs.length > 0) {
		var lastMsg = listMsgs[listMsgs.length-1];
		// console.log("Inspecting new msg: "+lastMsg);
		var msgAuthor = lastMsg.getElementsByClassName('_36')[0].children[0].innerHTML;
		lastAuthor = msgAuthor;
		if( msgAuthor != bot_name ) {
			// console.log("msgAuthor: "+msgAuthor);
			
			// Get most recent paragraph
			var paragraphs = lastMsg.getElementsByClassName('_38');
			var lastParagraph = paragraphs[paragraphs.length-1];
			if (lastParagraph != previousPolledParagraph) {
				previousPolledParagraph = lastParagraph;
				var msgContent = lastParagraph.children[0].innerHTML;
				msgContent = msgContent.toLowerCase().trim();
				
				// console.log("msgContent: "+msgContent);
				// Test the message against patterns:
				testLaughter: for(j = 0; j < laughter_responses["Laughter"].length; j++) {
					// Must have all the characters
					chars = laughter_responses["Laughter"][j].condition.split("");
					for (k = 0; k < chars.length; k++) {
						if(msgContent.search(chars[k]) === -1) {
							continue testLaughter;
						}
					}
					// Must have nothing else than the characters
					if(msgContent.replace(new RegExp("("+laughter_responses["Laughter"][j].condition.split("").join("|")+")","gi"), "").length === 0) {
						submit_msg( laughter_responses["Laughter"][j].response );
					}
				}
				for(j = 0; j < responses["Generic"].length; j++) {
					if(msgContent === responses["Generic"][j].condition) {
							submit_msg( responses["Generic"][j].response );
					}
				}
				for(j = 0; j < responses[msgAuthor].length; j++) {
					if(msgContent === responses[msgAuthor][j].condition) {
							submit_msg( responses[msgAuthor][j].response );
					}
				}
				if(msgContent.search(/bibi/) === 0 && msgContent.search(new RegExp(yes_or_no_question,"gi")) === msgContent.length - yes_or_no_question.length) {
					if(Math.random() < 0.5) {
						submit_msg("sss (y)");
					}
					else {
						submit_msg("non :D");
					}
				}
			}
		}
	}
}

// Initialization ----------------------------------
// console.log("Bibi started");
var tryGetTextArea = setInterval(function(){
  textArea = document.getElementsByClassName('_1rv')[0];
	clearInterval(tryGetTextArea);
},1000);
refresh_data();
setInterval(refresh_data, 120000);
var _interval_id_b = setInterval(poll,300);
setInterval(say_random, 1800000);
