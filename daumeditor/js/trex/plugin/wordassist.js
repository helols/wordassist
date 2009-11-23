TrexConfig.addTool(
	"wordassist",
    {
		wysiwygonly: true,
		status: true
	}
);

/*
 * 추후 toolbar에 assist 관련 옵션 메뉴등록시 사용.
 */
Trex.Tool.WordAssist = Trex.Class.create({
	$const: {
		__Identity: 'wordassist'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
		var _editor = this.editor;

		var _toolHandler = function() {
			_editor.getPlugin("wordassist").execute();
		};

		this.canvas.observeKey({ // ctrl + space - wordassist
			ctrlKey: true,
			altKey: false,
			shiftKey: false,
			keyCode: Trex.__KEY.SPACE
		}, _toolHandler);
	}
});

TrexConfig.addPlugin('wordassist',{});

Trex.Plugin.WordAssist = Trex.Class.create({
	$const: {
		__Identity: 'wordassist'
	},
	$mixins: [
		Trex.I.JobObservable
	],
    _assistTop : 0,
    _assistLeft : 0,
    _editor : null,
    _selectedNode :[],
    _popupLayer : null,
    _isWordassist : null,
    _canvas : null,
    _tmp : null,
	initialize: function(editor, config) {
        if(!editor) {return;}
        var _self = this;
        _self._editor = editor;
        _self._canvas  = editor.getCanvas();
        _self._popupLayer = new Trex.Plugin.WordAssist.PopupLayer(this);
        this.execute = this.assistExecute;
	},

    assistExecute : function(){
        var _self = this;
        if(!_self._isWordassist) {
            _self._isWordassist = true;
            var tmpNode = _self.addTmpSpan(); // 임시 span 삽입
            if(tmpNode === null){
                $tom.remove(tmpNode); // 일단.. 삭제
                console.log('tmpNode null!!');
                return ; // 끝내는곳 호출하기
            }
            _self.calTmpSpanPosition(tmpNode); //좌표 계산.폰트 사이즈 만큼 내려주기.

            var prevTmpNode = _self.skipWhiteSpace(tmpNode);
            if(prevTmpNode !== null){
                _self.selectedTextNode(prevTmpNode);
                if(tmpNode.nextSibling !== null && (tmpNode.nextSibling.nodeType == 3 && !tmpNode.nextSibling.length)){
                    $tom.remove(tmpNode.nextSibling); // div 삭제.
                }
                $tom.remove(tmpNode); // div 삭제.
                _self.openPopupLayer();
            }
        }else{
            this.toggleKeyDownEvent(true);
            _self._isWordassist = false;
        }
    },

    /**
     * 현재 canvas에 processor을 가져옴.
     */
    getCurrentProcessor: function(){
        return this._canvas.getProcessor();  
    },

    /**
     * 현재 panel에 doc를 가져옴.
     */
    getCurrentDoc: function(){
        return this.getCurrentProcessor().doc;  
    },
    /**
    * position을 위한 temp span add
    */
    addTmpSpan : function(){
        var processor = this.getCurrentProcessor();
        if(!processor.isCollapsed()) {            
            return null;
        }
        var _attributes = {'id': 'tmpMarking'	};
        var _aNode = processor.create("span", _attributes);
		processor.pasteNode(_aNode, false);
        return _aNode;
    },

    /**
     * 공백으로 시작 하거나 whiteSpace node 일경우 체크람. ( 둘다 아닌경우에만 통과함.)
     * refactoring... 
     * @param str
     */
    isPassableNode : function(str){
      return (str.trim().length != 0 && this.changeToSpace(str).lastIndexOf(" ")+1 !== str.length)
    },
    /**
    * temp span 의 position 계산하기.
    */
    calTmpSpanPosition : function(tmpNode){
        var _self = this;
        var iframe = $tx('tx_canvas_wysiwyg');
        var itop = tmpNode.offsetTop ;
        var ileft = tmpNode.offsetLeft;
        var top = itop + parseInt(iframe.offsetParent.offsetTop + iframe.offsetParent.clientTop,10)+5; // +5
        var left = ileft+parseInt(iframe.offsetParent.offsetLeft + iframe.offsetParent.clientLeft,10)+5; //+5
        this._assistTop = top;
        this._assistLeft = left;
        console.log('_assistTop>>'+_self._assistTop);
        console.log("_assistLeft>>"+_self._assistLeft);
        $tx('tx_article_title').value  = '';
        $tx('tx_article_title').value += 'top['+this._assistTop + '] // ';
        $tx('tx_article_title').value += 'left['+this._assistLeft+ ']';
    },

    /**
     * whiteSpace skip 후 node 반환.
     * @param node
     */
    skipWhiteSpace : function(node){
        if($tx.msie) return node.previousSibling; //IE 일경우
        var cur = node.previousSibling;
        if(cur !== undefined && cur !== null){
            if ( cur.nodeType == 3 && !cur.length) {
                return this.skipWhiteSpace(cur);
            }else{
                return cur;
            }
        }else{
            if(cur === null){
                return null;
            }else{
                return node;
            }
        }
    },

    /**
    * 선택되어야 하는 TextNode 정하기.
    */
    selectedTextNode : function(prevTmpNode){
        if(prevTmpNode.nodeType == 3){ //textNode 일때.
            prevTmpNode.parentNode.normalize();
            console.log('['+prevTmpNode.nodeValue+']')
            var offset = this.changeToSpace(prevTmpNode.nodeValue).lastIndexOf(' ')+1; // 0 면 앞 노드 까지 검색하기 ? 
            var _sNode = $tom.divideText(prevTmpNode,offset);
            this._selectedNode.push({_sNode:_sNode,offset:offset,_pNode:_sNode.previousSibling});
            $tx('tx_article_title').value  = '';
            $tx('tx_article_title').value += '_sNode['+_sNode.nodeValue + ']';
        }else if(prevTmpNode.nodeType == 1){
            $tx('tx_article_title').value += 'prevTmpNode.nodeType[11111]';
        }else{
            return; // 끝내는곳 불러주기.
        }
    },

     /**
     * 공백 -> space 로 변경.
     */
    changeToSpace : function(str){
        return str.replace(/\s/g,' ');
    },
    
    /**
    * pop 띄우기.
    */
    openPopupLayer : function(){
        var _self = this;
        var nodes = _self._selectedNode[0];
        this.toggleKeyDownEvent();
        this._popupLayer.searchWord(nodes._sNode.nodeValue);  // 팝업열기.
    },

    /**
     * PopupLayer close after callback
     */
    closeAfterCallback: function(returnStr){
        this.replaceData(returnStr);
        //    this.wordAssistExpires();
    },

    /**
     * toggle keydown event
     */
    toggleKeyDownEvent : function(isExpire){
        this.toggleEvent(Trex.Ev.__CANVAS_PANEL_KEYDOWN,this.pupupOpenAfterKeyDownEvent,isExpire);
    },

    /**
     * toggle mouseDown event (popupLayer close.)
     */
    toggleMouseDownEvent : function(isExpire){
        this.toggleEvent(Trex.Ev.__CANVAS_PANEL_MOUSEDOWN,this.pupupOpenAfterKeyDownEvent,isExpire);
    },

    /**
     * common toggleEvent . jobObservers push & remove!!
     * 불필요한 이벤트를 방지하기 위한.! 
     * @param evName
     * @param ev
     * @param isExprie
     */
    toggleEvent : function(evName, ev, isExprie){
        if(isExprie === undefined) isExprie = false;
        var _canvas = this._editor.getCanvas();
        var idx = -1;
        if( _canvas.jobObservers[evName] !== null && _canvas.jobObservers[evName] !== undefined){
            if($tx.msie){
                for(var i = 0 ; i < _canvas.jobObservers[evName].length ; i++){
                    if(_canvas.jobObservers[evName][i] === ev){ idx = i; }
                }
            }else{
                idx = _canvas.jobObservers[evName].indexOf(ev);
            }
        }
        if(idx != -1  && (idx != -1 || isExprie)){
            _canvas.jobObservers[evName].splice(idx,1);
        }else if(!isExprie){
            _canvas.observeJob(evName, ev);
        }
    },

    /**
     * replace selectedData
     */
    replaceData : function(str){
        var _self = this;
        try{
            console.log('str>>'+str);
            if(_self._selectedNode.length == 1){
                var nodes = _self._selectedNode[0];
                var _pNode = nodes._pNode;
                var _sNode = nodes._sNode;
                var _tNode = this.getCurrentDoc().createTextNode(str);
                if(_pNode !== undefined && _pNode !== null){ // 단독 node가 아닐경우.. 차일드 삭제.
                    $tx('tx_article_title').value += '_pNode defined ';
                    $tom.insertNext(_tNode,_pNode);
                }else{
                    $tx('tx_article_title').value += '_pNode undefined ';
                    $tom.insertAt(_tNode,_sNode);
                }
                $tom.remove(_sNode);
                _self.moveFocusToTextEnd(_tNode);
                _tNode.parentNode.normalize();
            }
        }catch(e){
        }finally{
            _self._selectedNode = [];
        }
    },

    moveFocusToTextEnd : function(node){
        if($tx.msie) return;
        var _rng = this.getCurrentProcessor().getRange();
        _rng.setEnd(node,node.length);
        _rng.collapse(false);
    },
    /**
     * popup Layer control 하기 위한 keyEvent!!
     * 상하 이벤트 / 엔터이벤트(결정이벤트)/  좌우 이벤트시 닫기... etc... 
     * @param ev
     */
    pupupOpenAfterKeyDownEvent : function(ev) {
        switch(ev.keyCode){
            case $tx.KEY_DOWN :
            case $tx.KEY_UP :
            case $tx.KEY_RETURN :
                if($tx.KEY_UP === ev.keyCode){
                    //_assist.keyEventProcess("up");
                    alert('ddd');
                }
                else if($tx.KEY_DOWN === ev.keyCode){
                    //_assist.keyEventProcess("down");
                }
                else if($tx.KEY_RETURN === ev.keyCode){
                    //_assist.keyEventProcess("enter");
                }
                $tx.stop(ev);
                break;
            case $tx.KEY_LEFT :
            case $tx.KEY_RIGHT :
            case $tx.KEY_ESC:
//                  _assist.close();
//                 _wordAssistExpires();
                break;
        }
    }
});
Trex.Plugin.WordAssist.PopupLayer = Trex.Class.create({
	$mixins: [
        Trex.I.JSRequester
	],
    _wordassist : null,
    initialize: function(wordassist){
        this._wordassist = wordassist;
    },
    keyEventProcess : function(action) {
//        switch(action.toLowerCase()){
//            case 'down' :
//                var selected = jQuery('.assist_select');
//                if(selected.size() === 0) {
//                    jQuery('#tx_wordassist table tr:first').addClass('assist_select');
//                } else {
//                    var next = jQuery('.assist_select').removeClass().next();
//                    if(next.size() === 0) {
//                       jQuery('#tx_wordassist table tr:first').addClass('assist_select');
//                    } else {
//                       next.addClass("assist_select");
//                    }
//                }
//                break;
//            case 'up' :
//                var selected = jQuery('.assist_select');
//                if(selected.size() === 0) {
//                    jQuery('#tx_wordassist table tr:last').addClass('assist_select');
//                } else {
//                    var prev = jQuery('.assist_select').removeClass().prev();
//                    if(prev.size() === 0) {
//                       jQuery('#tx_wordassist table tr:last').addClass('assist_select');
//                    } else {
//                       prev.addClass("assist_select");
//                    }
//                }
//                break;
//            case 'enter':
//                this.close(true);
//                break;
//            default:
//                this.close();
//        }
    },
    
    close : function(isCallCallBackFunc){
        var _self = this;
//        element.hide();
//        isCallCallBackFunc = isCallCallBackFunc || false;
//
//        var selected = jQuery('.assist_select');
//        var str = null;
//
//        if(selected.size !== 0) {
//           str = jQuery('.assist_select').children('.assist_word').text();
//        }
//
        if(isCallCallBackFunc) {
        	_self._wordassist.closeAfterCallback('school');
        }
//        Editor.getPlugin("wordassist").close();
    },
    searchWord: function(search_str){
        $tx('tx_article_title').value += 'search_str['+search_str + ']';
        this.close(true);
    },
    /**
     * 문자열이 한글인지 확인.
     * @param str
     */
    isHangul : function(str) {
        var han = /[ㄱ-힣]/g;
        var chk_han = str.match(han);

        if(chk_han !== null && str.length === chk_han.length) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * 문자열이 영어인지 확인.
     * @param str
     */
   isEnglish : function(str) {
        var eng = /[a-z|A-Z]/g;
        var chk_eng = str.match(eng);

        if(chk_eng !== null && str.length === chk_eng.length) {
            return true;
        } else {
            return false;
        }
    }
});