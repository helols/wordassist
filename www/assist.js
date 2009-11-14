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
    	if(list.length == 0 ){
            this.close();
            return false;
        }
    	var table = jQuery('<table class="ptable" cellspacing="0" cellpadding="0" style="width: 293px;">')
    	
        list.each(function(data){
            table.append('<tr><td class="assist_word">'+ data.word +'</td><td class="assist_des">' + data.desc +'</td></tr>');
        });
        console.log(table.find('tr'));
        table.find("tr").hover(function(){
                jQuery('.assist_select').removeClass();
                jQuery(this).addClass('assist_select');
            }, function(){
               //NOP
        }).click(function() {self.close(true);});
        
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
        var URL = 'http://suggestqueries.google.com/complete/search?client=suggest&hjson=t&ds=d&hl=ko&jsonp=?&q='+q+'&cp='+q.length;
        jQuery.getJSON(URL, function(datas) {
        
            var list = [];
            
            datas[1].each((function(data){
                list.push({word : data[0], desc : data[1]});
            }));
            
            insertItems(list);
        });
    };
    
    this.start = function(str, top, left) {
   	    console.log("Call Start!!!");
   	    console.log(str);
   	    
   	    str = jQuery.trim(str);  
   	    
        if(element.size() === 0 ) {
            element = jQuery('#assist');        
        }
        
        if(isHangul(str)) {
            if(top !== undefined)
                korean(str);
        } else if(isEnglish(str)) {
            english(str);          
        } else {
            alert("입력값이 없거나, 한글/영어가 혼합되어 있습니다.")
        }
        
        if(top !== undefined || left !== undefined) {
            element.css('top', top).css('left', left).html('<img id="ajaxloding" src="./daumeditor/images/deco/loading.gif" />').show();
        }
    };
    
    this.keyEventProcess = function(action) {
    	// UP, DOWN, ENTER
        var command = action.toLowerCase();
        switch(command){
            case 'down' :
                    var selected = jQuery('.assist_select');
                    if(selected.size() === 0) {
                        jQuery('#assist table tr:first').addClass('assist_select');
                    } else {
                    	var next = jQuery('.assist_select').removeClass().next();
                    	if(next.size() === 0) {
                    	   jQuery('#assist table tr:first').addClass('assist_select');
                    	} else {
                    	   next.addClass("assist_select");
                    	}
                    }
                break;
            case 'up' :
                    var selected = jQuery('.assist_select');
                    if(selected.size() === 0) {
                        jQuery('#assist table tr:last').addClass('assist_select');
                    } else {
                        var prev = jQuery('.assist_select').removeClass().prev();
                        if(prev.size() === 0) {
                           jQuery('#assist table tr:last').addClass('assist_select');
                        } else {
                           prev.addClass("assist_select");
                        }
                    }
                break;
            case 'enter':
                this.close(true);                
                break;
            default:
                this.close();
        }
    };
    
    this.close = function(isCallCallBackFunc) {

    	element.hide();
        isCallCallBackFunc = isCallCallBackFunc || false;
    	
        var selected = jQuery('.assist_select');
        var str = null;
        
        if(selected.size !== 0) {
           str = jQuery('.assist_select').children('.assist_word').text();    
        }
        
        if(isCallCallBackFunc) {
        	callback(str);
        }
        Editor.getPlugin("wordassist").close();
    };
    
    this.callbackTest = callback;
};    

function test() {
	var a = new Assist({callback : function(str) {alert(str)}});
	a.start(300, 300, '하늘');
	alert("영어 테스트");
	a.start(300, 300, 'scho');
}