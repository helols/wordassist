var Assist = function(options) {
	
	if(options === undefined) {
		alert("You must define options.");
		return;
	}
	
    var self = this;
	var callback = options.callback || function() {alert("Options havn't callback function");};
    var element = jQuery('#assist');
    
    //한글채크            
    var isHangul = function(str) {
        var han = /[ㄱ-힣]/g;
        var chk_han = str.match(han);

        if(str.length === chk_han.length) {
            return true;
        } else {
            return false;
        }
    };

    //영어 채크
    var isEnglish = function(str) {
        var eng = /[a-z|A-Z]/g;
        var chk_eng = str.match(eng);

        if(str.length === chk_eng.length) {
            return true;
        } else {
            return false;
        }        
    };    
    
    var insertItems = function(list) {
        console.log(list);
        var i=0;
        for(i=0 ; i < list.length; i++) {
        	console.log(list[i]);
        	element.appendTo("<li>"+ list[i].word +" : " + list[i].desc +"</li>");
        }
    }

    var korean = function(q) {
        var API_KEY = "7346eb8352778b08bb5bedb006f1bee3bd4375e8";
        var URL = "http://apis.daum.net/dic/krdic";
        
        jQuery.getJSON(URL + "?apikey="+ API_KEY + "&q=" + q + "&kind=WORD&callback=?&output=json",
            function(data) {
            	var i =0;
                var channel = data.channel;
                
                var list = [];                
                for(i=0; i<channel.result; i++) {
                    list.push({word : channel.item[i].title, desc : channel.item[i].description});	
                }
                
                insertItems(list);
        });
    };

    var english = function(q) {
        
    };
    
    this.start = function(top, left, str) {
    	var wordList;
    	
        if(element.size() === 0 ) {
            element = jQuery('#assist');        
        }
        
        if(isHangul(str)) {
            korean(str);
        } else if(isEnglish(str)) {
            
        } else {
            
        }
        
        element.css('top', top).css('left', left).show();
    };
    
    this.keyEventProcess = function(action) {
    	// UP, DOWN, ENTER
    };
    
    this.close = function(isCallCallBackFunc) {
    	element.hide();
    	
        isCallCallBackFunc = isCallCallBackFunc || false;
        
        if(isCallCallBackFunc) {
        	callback();
        }
    };
    
    this.callbackTest = callback;
};    

function test() {
	var a = new Assist({});
	a.start(300, 300, '생각');
}