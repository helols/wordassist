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
		Trex.I.JobObservable,
        Trex.I.JSRequester
	],
    _assistTop:0,
    _assistLeft:0,
    _dataString:null,
    _editor:null,
	initialize: function(editor, config) {
        if(!editor) {return;}
        var _self = this;

        _self._editor = editor;
        var _canvas = editor.getCanvas();
        var _initializedId = editor.getInitializedId();
        var _isWordassist = false;  // 어시스트가 열려 있는지 여부. 
        var _isWordassistEvent = false; //어시스트 관련 KEY EVENT 사용 여부.

        // 팝업 div에서 선택했을때 문자열을 가지고 selectspan 문자열 치환.
        var _selectedCallback = function(str){
            var selectspan  = $tx('tx_canvas_wysiwyg').contentDocument.getElementById('selectspan');
            if(selectspan != null && selectspan !== undefined && str.length !== 0){
                selectspan.innerHTML = str;
            }
            _wordAssistExpires(); // 키이벤트 없애고 ... 팝업닫고.
        }.bind(this);
        
        var popupDiv = function(){
            _isWordassistEvent = true;
            _assist.start(_self._dataString,_self._assistTop, _self._assistLeft);  // 팝업열기.
        }

        var _assist = new Assist({callback:_selectedCallback});
        /**
         * todo
         * 1.포커스에 div 넣기. 포커스 계산후에 바로 삭제. - 완료.
         * 2.선택영역만들어서 span으로 감싸기.  완료
         * 3.span에 keydown 이벤트 주기 . (키업/키다운 주기. 그외 키입력시 검색 불러주기.) 완료
         * 4.선택영역 팝업 text 로 넣어주기.
         * 5.팝업 사라질때 콜백호출해주기. span영역.. 다시 해제시키기.
         * 6.자동저장시.. span 지워주는.. 거시기 .. ;; 만들어줌.
         */
        var t = null;
        var _toggleAssist = function() {
            if(!_isWordassist) {
                _isWordassist = true;
                var tmpNode = _self.addTmpSpan(); // 임시 div 삽입
                t = tmpNode;
                if(tmpNode === null){
                    console.log('tmpNode null!!');
                    return ; // 끝내는곳 호출하기
                }
                _self.calTmpSpanPosition(tmpNode); //좌표 계산.폰트 사이즈 만큼 내려주기.
                var prevTmpNode = _self.skipWhiteSpace(tmpNode);
                if(prevTmpNode !== null){
                    _self.selectedTextNode(prevTmpNode);
                }
                //$tom.remove(tmpNode); // div 삭제.
			}else{
//                    _wordAssistExpires();
//                    _assist.close(); // pup닫기.
//                t.parent.childNodes
                $tom.remove(t); // div 삭제.
                this.toggleKeyDownEvent(true);
                _isWordassist = false;
                }
			}.bind(this);
        var _wordAssistExpires = function(){
            _isWordassistEvent = false;
            _isWordassist = false;
            var tmpNode = $tx('tx_canvas_wysiwyg').contentDocument.getElementById('tmpMarking');
            if(tmpNode !== null || tmpNode !== undefined){
                $tom.remove(tmpNode);
            }
            var selectspan =  $tx('tx_canvas_wysiwyg').contentDocument.getElementById('selectspan')
            if(selectspan != null)$tom.unwrap(selectspan);
        }.bind(this);
//        _canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEDOWN, function(){
//            if(_isWordassist){
//                _wordAssistExpires;
//                _assist.close();
//            }
//        });
        this.execute = _toggleAssist;
        this.wordAssistExpires = _wordAssistExpires;
        this.selectedCallback = _selectedCallback;


	},

    /**
     * 현재 canvas에 processor을 가져옴.
     */
    getCurrentProcessor: function(){
        return this._editor.getCanvas().getProcessor();  
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
        var _attributes = {'id': 'tmpMarking'	};
        var _aNode = processor.create("span", _attributes);
        return this.purePasteNode(_aNode);
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
        if (_endContainer.nodeType == 3) {
            console.log("parentNode.insertBefore");
            console.log(_endContainer);
            console.log(this.isPassableNode(_endContainer.textContent));
            if(this.isPassableNode(_endContainer.textContent)){
                _endContainer.splitText(_endOffset);
                _endContainer.parentNode.insertBefore(node, _endContainer.nextSibling);
            }else{
                return null;
            }
		} else {
            console.log("insertBefore");
            console.log(this.isPassableNode(beforeNode.textContent));
            var beforeNode = this.skipWhiteSpace(_endContainer.childNodes[_endOffset]); //이렇게 처리 하는 이유는 whitespace 뒤에 tmpspan을 붙이지 않으려구.. ;;
            if(beforeNode !== null && this.isPassableNode(beforeNode.textContent)){
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
      return (str.trim() != 0 && str.lastIndexOf(" ")+1 !== str.length)
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
        if(node.previousSibling !== null){
            if(node.previousSibling.isElementContentWhitespace){
                return this.skipWhiteSpace(node.previousSibling);
            }else{
                return node.previousSibling;
            }
        }else{
            if(node.isElementContentWhitespace){
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
        console.log("selectedTextNode");
        console.log(prevTmpNode);
        var processor = this.getCurrentProcessor();

        if(prevTmpNode.nodeType == 3){ //textNode 일때.
            var data = prevTmpNode.nodeValue;
            console.log('>>'+data+'<<');
        }else if(prevTmpNode.nodeType == 1){

        }else{
            return; // 끝내는곳 불러주기.
        }


        var sliceTextNode = $tom.divideText(tmpNode.previousSibling.previousSibling,spaceIdx);
        var span = processor.create("span", {id:'selectspan',name:'selectspan'});
        //             _self._dataString = sliceTextNode.data;
        $tom.insertAt(span, sliceTextNode);
        $tom.append(span,sliceTextNode);
    },

    /**
    * pop 띄우기.
    */
    openPopupLayer : function(){
//        this.toggleKeyDownEvent();
        //this.popupDiv();
    },

    /**
     * PopupLayer close after callback
     */
    closeAfterCallback: function(){
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
     * selected span remove.
     */
    removeSelectedSpan : function(){

    },
    /**
     * replace selectedData
     */
    replaceData : function(){
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
                    alert('ddd');
//                  _assist.close();
//                 _wordAssistExpires();
                break;
        }
    }

});

Trex.Plugin.WordAssist.PopupLayer = {
    
}