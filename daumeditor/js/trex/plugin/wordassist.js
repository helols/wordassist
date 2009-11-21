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
//            _self._isWordassist = true;
            var tmpNode = _self.addTmpSpan(); // 임시 span 삽입
            if(tmpNode === null){
//                $tom.remove(tmpNode); // 일단.. 삭제
                console.log('tmpNode null!!');
                return ; // 끝내는곳 호출하기
            }
            _self.calTmpSpanPosition(tmpNode); //좌표 계산.폰트 사이즈 만큼 내려주기.

            var prevTmpNode = _self.skipWhiteSpace(tmpNode);
            if(prevTmpNode !== null){
                _self.selectedTextNode(prevTmpNode);
            }
            _self.openPopupLayer();
            $tom.remove(tmpNode); // div 삭제.
        }else{
//            $tom.remove(t); // div 삭제.
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
        //cleanWhitespace(_aNode.parentNode);
		var t = this.skipWhiteSpace(_aNode);
        console.log(t);
        if(t !== null)
        console.log(t.nodeType +' // ' + t.nodeName )
//        $tx('tx_article_title').value = '';
//        $tx('tx_article_title').value +=this.skipWhiteSpace(_aNode).nodeValue + ' // ';
//        $tx('tx_article_title').value +=this.skipWhiteSpace(_aNode).nodeType + ' // ';
//        $tx('tx_article_title').value +=$tom.divideText(this.skipWhiteSpace(_aNode),2).nodeValue+' // ';
        $tom.remove(_aNode); // 일단.. 삭제
        return null;
//        return _aNode;
    },
    /**
     * marker 없이 순수 node만 endNode에 추가 시킨다.
     * @param node 추가시킬 노드.
     */
    purePasteNode:function(node){
        var _rng = this.getCurrentProcessor().getRange();
		var _endContainer = _rng.endContainer;
		var _endOffset = _rng.endOffset;
		console.log(_endContainer);
//		console.log(_endContainer.textContent);
       $tx('tx_article_title').value = '';
        $tx('tx_article_title').value =_endContainer.textContent + ' // ';
        $tx('tx_article_title').value +=_endContainer.nodeType + ' // ';
        $tx('tx_article_title').value +=_endContainer.nodeName;
        return null;
        if (_endContainer.nodeType == 3) {
            console.log("parentNode.insertBefore");
            console.log(_endContainer);
            console.log(this.isPassableNode(_endContainer.nodeValue));
            if(this.isPassableNode(_endContainer.nodeValue)){
                _endContainer.splitText(_endOffset);
                _endContainer.parentNode.insertBefore(node, _endContainer.nextSibling);
            }else{
                return null;
            }
		} else {
            console.log("insertBefore");
            var beforeNode = this.skipWhiteSpace(_endContainer.childNodes[_endOffset]); //이렇게 처리 하는 이유는 whitespace 뒤에 tmpspan을 붙이지 않으려구.. ;;
            console.log(beforeNode);
            if(beforeNode !== null && this.isPassableNode(beforeNode.nodeValue)){
                _endContainer.insertBefore(node, _endContainer.childNodes[_endOffset]);
            }else{
                return null;
            }
		}
        return node;
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
            var offset = this.changeToSpace(prevTmpNode.nodeValue).lastIndexOf(' ')+1;
            var _sNode = $tom.divideText(prevTmpNode,offset);
            this._selectedNode.push({_sNode:_sNode,offset:offset,_pNode:_sNode.previousSibling});
            console.log(this._selectedNode);
        }else if(prevTmpNode.nodeType == 1){

        }else{
            return; // 끝내는곳 불러주기.
        }
    },

     /**
     * 공백 -> space 로 변경.
     */
    changeToSpace : function(str){
        return str.replace(/\s/g,' ')
    },
    
    /**
    * pop 띄우기.
    */
    openPopupLayer : function(){
//        this.toggleKeyDownEvent();
        this._popupLayer.searchWord('scho');  // 팝업열기.
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
        var idx = _canvas.jobObservers[evName] === undefined ?-1:_canvas.jobObservers[evName].indexOf(ev);
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
                if(_pNode !== undefined && _pNode !== null){ // 단독 node가 아닐경우.. 차일드 삭제.
                    _pNode.parentNode.removeChild(_sNode);
                    _pNode.insertData(nodes.offset,str);
                    _self.moveFocusToTextEnd(_pNode);
                }else{
                    console.log('_pNode undefined !!')
                    _sNode.nodeValue = str;
                    _self.moveFocusToTextEnd(_sNode);
                }
            }
        }catch(e){
        }finally{
            _self._selectedNode = [];
        }
    },

    moveFocusToTextEnd : function(node){
        this.getCurrentProcessor().getRange().setEnd(node,node.length);
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
        console.log("search_str>>"+search_str);
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

function cleanWhitespace( element ) {
    // If no element is provided, do the whole HTML document
    element = element || document;
    // Use the first child as a starting point
    var cur = element.firstChild;

    // Go until there are no more child nodes
    while ( cur != null ) {

        // If the node is a text node, and it contains nothing but whitespace
        if ( cur.nodeType == 3 && ! /\S/.test(cur.nodeValue) ) {
            // Remove the text node
            element.removeChild( cur );

        // Otherwise, if it’s an element
        } else if ( cur.nodeType == 1 ) {
             // Recurse down through the document
             cleanWhitespace( cur );
        }

        cur = cur.nextSibling; // Move through the child nodes
    }
}