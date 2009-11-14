var Assist = function(options) {
	
	var callback = options.callback || function() {};

    var self = this;
    var element;
    
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
    
    this.start = function(x, y, str) {
        //open div
        element = jQuery('<div>').attr('id', '');
        
        if(isHangul(str)) {
            
        } else if(isEnglish(str)) {
            
        } else {
            
        }
    };
    
    this.keyEventProcess = function(action) {
    	// UP, DOWN, ENTER
    };
    
    this.close = function() {
    	
    };
};    
