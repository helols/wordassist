var Assist = function(options) {
	
	if(options === undefined) {
		alert("You must define options.");
		return;
	}
	
	var callback = options.callback || function() {alert("Options havn't callback function");};
    
    var self = this;
    var element = jQuery('#assist');
    
    //한글채크            
    var isHangul = function(str) {
        han = /[ㄱ-힣]/g;
        chk_han = str.match(han);

        if(str.length === chk_han.length) {
            return true;
        } else {
            return false;
        }
    };

    //영어 채크
    var isEnglish = function(str) {
        eng = /[a-z|A-Z]/g;
        chk_eng = str.match(eng);

        if(str.length === chk_eng.length) {
            return true;
        } else {
            return false;
        }        
    };

    var korean = function(q) {
        var API_KEY = "7346eb8352778b08bb5bedb006f1bee3bd4375e8";
        var URL = "http://apis.daum.net/dic/krdic";
        
        jQuery.getJSON(URL + "?apikey="+ API_KEY + "&q=" + q + "&kind=WORD&callback=?&output=json",
            function(data) {                 
                console.log(data);
        });
    };

    var english = function(q) {
        
    };
    
    this.start = function(top, left, str) {
        
        if(isHangul(str)) {
            
        } else if(isEnglish(str)) {
            
        } else {
            
        }
        
        element.css('top', top).css('left', left).show();
    };
    
    this.keyEventProcess = function(action) {
    	// UP, DOWN, ENTER
    };
    
    this.close = function(isCallCallBackFunc) {
        isCallCallBackFunc = isCallCallBackFunc || false;
        
        if(isCallCallBackFunc) {
        	callback();
        }
    };
    
    this.callbackTest = callback;
};    
