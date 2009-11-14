TrexConfig.addTool(
	"wordassist",
	{
		wysiwygonly: true,
		status: true
	}
);
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

TrexConfig.addPlugin('wordassist',{}
);
Trex.Plugin.WordAssist = Trex.Class.create({
	$const: {
		__Identity: 'wordassist'
	},
	$mixins: [
		Trex.I.JobObservable
	],
    assistTop:0,
    assistLeft:0,
    dataString:null,
    _canvas : null,
	initialize: function(editor, config) {
        if(!editor) {
            return;
        }
        var _self = this; 
        var _editor = editor;
        var isWordassist = false;
        var isWordassistEvent = false;
		var _initializedId = editor.getInitializedId();
        this._canvas = editor.getCanvas();
        var _canvas_ = this._canvas;

        // 팝업 div에서 선택했을때 문자열을 가지고 selectspan 문자열 치환.
        var _selectedCallback = function(str){
            var selectspan  = $tx('tx_canvas_wysiwyg').contentDocument.getElementById('selectspan');
            if(selectspan !== null || selectspan !== undefined){
                selectspan.innerHTML = str;
            }
            _wordAssistExpires(); // 키이벤트 없애고 ... 팝업닫고.
        }.bind(this);
        
        var popupDiv = function(){
            eventBind();
            console.log(_self.assistTop+5)
            console.log(_self.assistLeft+5)
            _assist.start(_self.dataString,_self.assistTop+5, _self.assistLeft+5);  // 팝업열기.
        }

        var eventBind = function(){
           isWordassistEvent = true;
        }
        var _assist = new Assist({callback:_selectedCallback});
        var keyEvent = function(ev) { // 상하 이벤트 / 엔터이벤트(결정이벤트)/  좌우 이벤트시 닫기.
            if(isWordassistEvent){
                switch(ev.keyCode){
                    case $tx.KEY_DOWN :
                    case $tx.KEY_UP :
                        console.log("KEY_CODE"+ev.keyCode);
                        if($tx.KEY_UP === ev.keyCode)
                            _assist.keyEventProcess("up");
                        else if($tx.KEY_DOWN === ev.keyCode)
                            _assist.keyEventProcess("down");
                        else if($tx.KEY_RETURN === ev.keyCode)
                            _assist.keyEventProcess("enter");
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

        _canvas_.observeJob(Trex.Ev.__CANVAS_PANEL_KEYDOWN, keyEvent);

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
				if(!isWordassist) {
                    console.log("ctrl + space!! keydown!! ");
                    isWordassist = true;  // true
                    // 임시 div 삽입
                    this._canvas.execute(function(processor) {
							var _attributes = {
                                'id': 'tmpMarking',
//                                'style' : {display:'inline'}
                                'style' : {display:'inline'}
							};
					        var _aNode = processor.create("span", _attributes);
					    	processor.pasteNode(_aNode, false);						
						   // 임시 div 삽입 끝
                        //좌표 계산.  // 폰트 사이즈 만큼 내려주기.
                        var iframe = $tx('tx_canvas_wysiwyg');
                        var tmpNode = iframe.contentDocument.getElementById('tmpMarking');
                        var itop = tmpNode.offsetTop ;
                        var ileft = tmpNode.offsetLeft;
                        var top = itop + parseInt(iframe.offsetParent.offsetTop + iframe.offsetParent.clientTop,10);
                        var left = ileft+parseInt(iframe.offsetParent.offsetLeft + iframe.offsetParent.clientLeft,10);
                        _self.assistTop = top;
                        _self.assistLeft = left;
                        // 좌표 계산끝
                        // 영역 선택하기.
                        if($tom.isText(tmpNode.previousSibling.previousSibling)){
                            var data = tmpNode.previousSibling.previousSibling.data;
                            if(data.length > 0){
                                var spaceIdx = data.lastIndexOf(" ")+1;
                                if(spaceIdx !== data.length){
                                    var sliceTextNode = spaceIdx > 0?$tom.divideText(tmpNode.previousSibling.previousSibling,spaceIdx):tmpNode.previousSibling.previousSibling;

                                    var span = processor.create("span", {id:'selectspan',name:'selectspan'});
                                    _self.dataString = sliceTextNode.data;
                                    $tom.insertAt(span, sliceTextNode);
                                    $tom.append(span,sliceTextNode);
                                    popupDiv();
                                }
                            }
                        } // 영역선택 끝.
                        $tom.remove(tmpNode); // div 삭제.
                    });


                    // div 삭제.
                    //  iframe.contentDocument.getElementById('tmpMarking').parentNode.removeChild(iframe.contentDocument.getElementById('tmpMarking'))

                    //openwordassist(top,left,search_str)

				}else{
                    _wordAssistExpires(); 
                    _assist.close(); // pup닫기.
                    isWordassist = false;
                }
			}.bind(this);
        var _wordAssistExpires = function(){
            isWordassistEvent = false;
            isWordassist = false;
            var tmpNode = $tx('tx_canvas_wysiwyg').contentDocument.getElementById('tmpMarking');
            if(tmpNode !== null || tmpNode !== undefined){
                $tom.remove(tmpNode);
            }
            var selectspan =  $tx('tx_canvas_wysiwyg').contentDocument.getElementById('selectspan')
            if(selectspan != null)$tom.unwrap(selectspan);
        }.bind(this);
        _canvas_.observeJob(Trex.Ev.__CANVAS_PANEL_MOUSEDOWN, function(){
            if(isWordassist){
                _wordAssistExpires;
                _assist.close();
            }
        });
        this.execute = _toggleAssist;
        this.wordAssistExpires = _wordAssistExpires;
        this.selectedCallback = _selectedCallback;


	},
    getAssistTop : function(){ return this.assistTop;},
    getSelText : function(){return this._canvas.getProcessor().getText()},
    getAssistLeft: function(){return this.assistLeft;},
    close: function(){this.wordAssistExpires();}

});