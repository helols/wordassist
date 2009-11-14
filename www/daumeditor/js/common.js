// Height auto resizing 
function autoResizeHeight( fixedWidth, heightOffset){
	if (typeof fixedWidth == 'number') {
		//fixedWidth += $tx.gecko ? 16 : 0;  
		var __STATUSBAR_SIZE = 50;
		var __SCROLLBAR_SIZE = 30;
		var __ASSUMPTION_MIN_HEIGHT = 300;
		if ( !heightOffset ) heightOffset = 0;
	
		var win = window.top;
		var dl = self.document.documentElement;
	
		var diff = {}, pos = {x:0, y:0};
		var left = (win.screenLeft)?win.screenLeft:win.screenX;
		var top = (win.screenTop)?win.screenTop:win.screenY;
		
		win.resizeTo( fixedWidth, __ASSUMPTION_MIN_HEIGHT);
	
		var contentScreentHeight = (dl.clientHeight == dl.scrollHeight && dl.scrollHeight != dl.offsetHeight )?dl.offsetHeight:dl.scrollHeight;
		var contentScreentWidth = (dl.clientWidth == dl.scrollWidth && dl.scrollWidth != dl.offsetWidth )?dl.offsetWidth:dl.scrollWidth;
		if(contentScreentHeight > dl.clientHeight){
			diff.height = contentScreentHeight - dl.clientHeight;
		}else{ // for chrome -_-
			diff.width = 8;
			diff.height = dl.clientHeight - contentScreentHeight + 35;
		}
		pos.y = Math.min(screen.availHeight - contentScreentHeight - top - __STATUSBAR_SIZE,0) ;
		pos.x = Math.min(screen.availWidth - contentScreentWidth - left - __SCROLLBAR_SIZE,0);
		
		if ( pos.x || pos.y ) {
			if (!$tx.chrome) {
				win.moveBy(pos.x, pos.y);
			} 
			win.resizeTo( fixedWidth, __ASSUMPTION_MIN_HEIGHT );
		}
		setTimeout(function(){
			win.resizeBy(0, diff.height + heightOffset);
		},20)
	} else {
		setTimeout(function(){
			var obj = fixedWidth;
			if(!obj)obj = document.getElementsByTagName('HTML')[0];
			var doc = document.getElementsByTagName('HTML')[0];
			var clientW = doc.clientWidth||doc.scrollWidth;
			var clientH = doc.clientHeight||doc.scrollHeight;
			var offsetW = obj.offsetWidth||obj.scrollWidth;
			var offsetH = obj.offsetHeight||obj.scrollHeight;
			//alert( clientW + " : " + clientH + " / " + offsetW + " : " + offsetH )   
		    var gapWidth = offsetW - clientW ;
		    var gapHeight = offsetH - clientH;
		    if(gapWidth || gapHeight){
		        window.resizeBy(gapWidth,gapHeight);
		    }
		}, 100);
	}
}

function Querystring(query){
	
	this.params = new Object();
	this.get = function(key, defaultValue){
		if (defaultValue == null) {
			defaultValue = null;
		}
		var value = this.params[key];
		if (value == null) {
			value = defaultValue;
		}
		return value;
	};
	this.getUTF8 = function(key, defaultValue){
		if (defaultValue == null) {
			defaultValue = null;
		}
		var value = unescape(this.params[key]);
		if (value == null) {
			value = defaultValue;
		}
	return value;
	};
	
	var qs;
	if (query) {
		qs = query;
	}else {
		qs = location.search.substring(1, location.search.length)
	}
	
	if (qs.length == 0) {
		return;
	}
	
	qs = qs.replace(/\+/g, ' ');
	var args = qs.split('&');
	
	for (var i = 0; i < args.length; i++) {
		var value;
		var pair = args[i].split('=');
		var name = unescape(pair[0]);
		
		if (pair.length == 2) {
			value = pair[1];
		} else {
			value = name;
		}
		this.params[name] = value;
	}
}

var qs = new Querystring();

function closeWindow(){
	completeAttach();
	
	top.opener = self;
	top.close();
	
	var _opener;
	if (opener && !opener.closed) {
		_opener = opener;
	}else{
		_opener = parent.opener;
	}
	if(_opener.Editor) {
		_opener.Editor.focus();	
	} else {
		_opener.focus();
	}
}

function stripTags(str){
	return str.replace(/<\/?[^>]+>/gi, '');
}

function getAttacher(name) {
	return PopupUtil.getOpener().Editor.getSidebar().getAttacher(name);
}

function getEmbeder(name) {
	return PopupUtil.getOpener().Editor.getSidebar().getEmbeder(name);
}

function registerAction(attacher) {
	if(!attacher) {
		return; 
	}
	window.execAttach = attacher.attachHandler;
}

function registerSearch(searcher) {
	if(!searcher) {
		return; 
	}
	window.execSearch = searcher.insertHandler;	
}

function registerEmded(embeder) {
	if(!embeder) {
		return; 
	}
	window.execEmbed = embeder.embedHandler;
}

function modifyResult() {} //For Theme
function completeAttach() {} //For Theme

function existEntry(attacher) {
	if(!attacher) {
		return false; 
	}
	return attacher.existEntry();
}

function getFirstEntryData(attacher) {
	if(!attacher) {
		return false; 
	}
	return attacher.getFirstEntryData();
}
function getAttrOfElement( elementStr, attrName ){
	var regExp = new RegExp(attrName+"=['\"]?([^\"'>]*)[\"' ]","i");
	var result = regExp.exec( elementStr );
	
	if ( result){ 
		return result[1];
	}else{
		return null;
	}
}
function getParamValOfObjectTag( objectStr, paramName ){
	var regExp = new RegExp("<param([^>]*)name=['\"]"+paramName+"['\"]([^>]*)>","gi");
	var result = regExp.exec(objectStr, "gi");
	var value = null;
	
	if ( result ){
		regExp = new RegExp("value=['\"]([^>'\"]*)['\"]", "gi");
		value = regExp.exec( result[0] );
		if ( value ){
			return value[1];
		}
	}
	
	return null;
}
var PopupUtil = {
	getOpener : function(){
		var _opener;
		if(opener && opener.Editor){
			_opener = opener;
		} else if(parent.opener && parent.opener.Editor){
			_opener = parent.opener;
		} else if(opener.opener && opener.opener.Editor){
			_opener = opener.opener;
		}
		return _opener;
	}		
};

function getDateFormat(date, format) {
	date = date ? date.trim() : '';
	if ((date.length != 8) || (date.indexOf('0') == 0)) return '';
	var year = date.substr(0, 4) + (format || '년 ');
	var _m = (date.substr(4, 2).indexOf('0') == 0) ? date.substr(5, 1) : date.substr(4, 2);
	var _d = (date.substr(6, 2).indexOf('0') == 0) ? date.substr(7, 1) : date.substr(6, 2);
	var month = (_m != '0') ? _m + (format || '월 ') : '';
	var day = ( _d != '0') ? (_d + (format ? '' : '일')) : '';
	return year + month + day;
}

function getDashedDateFormat(date) {
	date = date.trim();
	if (date.length != 8 || date.indexOf('00') == 0) return '';
	var yy = removeZero(date.substr(0, 4), '');
	var mm = removeZero(date.substr(4, 2), '-');
	var dd = removeZero(date.substr(6, 2), '-');
	return yy + mm + dd;
}

function removeZero(number, fmt) {
	return (number.indexOf('00') == 0) ? '' : fmt + number;
}

function getYearFormat(date) {
	date = date.trim() || '';
	if (date.length != 8) return "";
	return date.substr(0, 4) + '년 ';
}

function getDayFormat(date) {
	try {
		date = date.trim();
		if (date.length != 8) return date;
		var d = new Date(date.substr(0, 4), date.substr(4, 2) - 1, date.substr(6, 2));
		var dayFormat = ['일', '월', '화', '수', '목', '금', '토'];
		return dayFormat[d.getDay()];
	} catch(e) {}
	return '';
}

function stripBracket(text) {
	var splitText = text.trim().split(',');
	var result = [];
	splitText.each(function(txt) {
		result.push(txt.replace(/\[\[[\w]*\]\]/, ''));
	});
	return result.join(', ');
}

function getFieldJson(name, value) {
	if (value)
		return {name: name, value: value.stripTags()};
	return null;
}
