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
        if(!editor) {
            return;
        }
        var _self = this;
        _self._editor = editor;
        var _canvas = editor.getCanvas();
        var _initializedId = editor.getInitializedId();
        var _isWordassist = false;  //어시스트가 열려 있는지 여부.
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
        var keyEvent = function(ev) { // 상하 이벤트 / 엔터이벤트(결정이벤트)/  좌우 이벤트시 닫기.
            if(_isWordassistEvent){
                switch(ev.keyCode){
                    case $tx.KEY_DOWN :
                    case $tx.KEY_UP :
                    case $tx.KEY_RETURN :
                        if($tx.KEY_UP === ev.keyCode){
                            _assist.keyEventProcess("up");
                        }
                        else if($tx.KEY_DOWN === ev.keyCode){
                            _assist.keyEventProcess("down");
                        }
                        else if($tx.KEY_RETURN === ev.keyCode){
                            _assist.keyEventProcess("enter");
                        }
                        $tx.stop(ev);
                        break;
                    case $tx.KEY_LEFT :
                    case $tx.KEY_RIGHT :
                    case $tx.KEY_ESC:
                          _assist.close();
                         _wordAssistExpires();
                        break;
                }
            }
		 }

        _canvas.observeJob(Trex.Ev.__CANVAS_PANEL_KEYDOWN, keyEvent);

        /**
         * todo
         * 1.포커스에 div 넣기. 포커스 계산후에 바로 삭제. - 완료.
         * 2.선택영역만들어서 span으로 감싸기.  완료
         * 3.span에 keydown 이벤트 주기 . (키업/키다운 주기. 그외 키입력시 검색 불러주기.) 완료
         * 4.선택영역 팝업 text 로 넣어주기.
         * 5.팝업 사라질때 콜백호출해주기. span영역.. 다시 해제시키기.
         * 6.자동저장시.. span 지워주는.. 거시기 .. ;; 만들어줌.
         */
        var _toggleAssist = function() {
				if(!_isWordassist) {
                    _isWordassist = true;  // true
                    // 임시 div 삽입
                    _self.addTmpSpan(_canvas.getProcessor());
                    //좌표 계산.  // 폰트 사이즈 만큼 내려주기.
                    var tmpNode = _self.calTmpSpanPosition();
                    console.log(_self.skipWhiteSpace(tmpNode));
                    return;
                    // 영역 선택하기.
                    if($tom.isText(tmpNode.previousSibling.previousSibling)){
                        var data = tmpNode.previousSibling.previousSibling.data;

                        if(data.length > 0){
                            var spaceIdx = data.lastIndexOf(" ")+1;
                            if(spaceIdx !== data.length){
                                var sliceTextNode = spaceIdx > 0?$tom.divideText(tmpNode.previousSibling.previousSibling,spaceIdx):tmpNode.previousSibling.previousSibling;

                                var span = _canvas.getProcessor().create("span", {id:'selectspan',name:'selectspan'});
                                _self._dataString = sliceTextNode.data;
                                $tom.insertAt(span, sliceTextNode);
                                $tom.append(span,sliceTextNode);
                                popupDiv();
                            }
                        }
                    } // 영역선택 끝.
                    $tom.remove(tmpNode); // div 삭제.
				}else{
                    _wordAssistExpires(); 
                    _assist.close(); // pup닫기.
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
        _canvas.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEDOWN, function(){
            if(_isWordassist){
                _wordAssistExpires;
                _assist.close();
            }
        });
        this.execute = _toggleAssist;
        this.wordAssistExpires = _wordAssistExpires;
        this.selectedCallback = _selectedCallback;


	},
    /**
    * position을 위한 temp span add
    */
    addTmpSpan : function(processor){
        var _attributes = {'id': 'tmpMarking'	};
        var _aNode = processor.create("span", _attributes);
		processor.pasteNode(_aNode, false);
    },

    /**
    * temp span 의 position 계산하기.
    */
    calTmpSpanPosition : function(){
        var _self = this;
        var iframe = $tx('tx_canvas_wysiwyg');
        var tmpNode = iframe.contentDocument.getElementById('tmpMarking');
        var itop = tmpNode.offsetTop ;
        var ileft = tmpNode.offsetLeft;
        var top = itop + parseInt(iframe.offsetParent.offsetTop + iframe.offsetParent.clientTop,10)+5; // +5
        var left = ileft+parseInt(iframe.offsetParent.offsetLeft + iframe.offsetParent.clientLeft,10)+5; //+5
        this._assistTop = top;
        this._assistLeft = left;
        console.log('_assistTop>>'+_self._assistTop);
        console.log("_assistLeft>>"+_self._assistLeft);
        return tmpNode;
    },

    skipWhiteSpace : function(node){
        if(node.previousSibling != null){
            if(node.previousSibling.isElementContentWhitespace){
                return this.skipWhiteSpace(node.previousSibling);
            }else{
                return node.previousSibling;
            }
        }else{
            return null;
        }
    },

    /**
    * 선택되어야 하는 TextNode 정하기.
    */
    selectedTextNode : function(tmpNode){

    },

    /**
    * pop 띄우기.
    */
    openPopupLayer : function(){

    },

    /**
     * PopupLayer close after callback
     */
    closeAfterCallback: function(){
    //    this.wordAssistExpires();
    },

    /**
     * toggle keydown event(Ctr + space)
     */
    toggleKeyDownEvent : function(fnc){
    },

    /**
     * toggle mouseDown event (popupLayer close.)
     */
    toggleMouseDownEvent : function(fnc){

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
    }
});

Trex.Plugin.WordAssist.PopupLayer = {
    
}