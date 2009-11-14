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

        if(chk_han !== null && str.length === chk_han.length) {
            return true;
        } else {
            return false;
        }
    };

    //영어 채크
    var isEnglish = function(str) {
        var eng = /[a-z|A-Z]/g;
        var chk_eng = str.match(eng);

        if(chk_eng !== null && str.length === chk_eng.length) {
            return true;
        } else {
            return false;
        }        
    };    
    
    var insertItems = function(list) {
    	
    	var table = jQuery("<table>")
    	
        list.each(function(data){
            table.append('<tr><td>'+ data.word +'</td><td>' + data.desc +'</td></tr>');
        });
        
    	element.html('').append(table);
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
        var URL = 'http://suggestqueries.google.com/complete/search?client=suggest&hjson=t&ds=d&hl=ko&jsonp=?&q='+q+'&cp=3';
        jQuery.getJSON(URL, function(datas) {
        
            var list = [];
            
            datas[1].each((function(data){
                list.push({word : data[0], desc : data[1]});
            }));
            
            insertItems(list);
        });
    };
    
    this.start = function(str, top, left) {
   	    
        if(element.size() === 0 ) {
            element = jQuery('#assist');        
        }
        
        if(isHangul(str)) {
            korean(str);
        } else if(isEnglish(str)) {
            english(str);          
        } else {
            
        }
        
        if(top !== undefined || left !== undefined) {
            element.css('top', top).css('left', left).show();
        }
    };
    
    this.keyEventProcess = function(action) {
    	// UP, DOWN, ENTER
        var command = action.toLowerCase();
        switch(command){
            case 'down' :
                    jQuery('#assist table tr').each(function(){
                        console.log(jQuery(this));
                    })
                break;
            case 'up' :

                break;
            case 'enter':
                break;
            default:
                this.close();
        }
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
	a.start(300, 300, '하늘');
	alert("영어 테스트");
	a.start(300, 300, 'scho');
}