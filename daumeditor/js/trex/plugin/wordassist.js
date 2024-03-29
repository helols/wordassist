TrexConfig.addTool(
        "wordassist",{
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

TrexConfig.addPlugin('wordassist', {});

Trex.Plugin.WordAssist = Trex.Class.create({
    $const: {
        __Identity: 'wordassist'
    },
    $mixins: [
        Trex.I.JobObservable,
        Trex.I.JSRequester
    ], 
    _assistTop : 0,
    _assistLeft : 0,
    _editor : null,
    _selectedNode :[],
    _isWordassist : null,
    _canvas : null,
    _waUtil : null,
    _assist_type : 'dic',
    _cache_itemList : [],
    _resultTemplate :null,
    _footerTemplate :null,
    initialize: function(editor, _config) {
        if (!editor) {
            return;
        }
        var _self = this;
        _self._editor = editor;
        _self._canvas = editor.getCanvas();
        _self._waUtil = new wordAssistUtil();
        this.execute = this.assistExecute;
    },
    /**
     * cross domain - jsonp
     * @param option
     */
    jsonpImportUrl : function(_url,callback,_charset){
        var data ;
        var jsonp = 'jsonp'+(+new Date);
        var status = 'success';
        var isClearTimer = true;
        _url = _url.replace(/=\?(&|$)/g, "=" + jsonp + "$1");

        window[ jsonp ] = function(tmp){
                data = tmp;
                success();
                jsonpGC(isClearTimer);
        };
        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement("script");

        script.src = _url;
        script.charset = _charset || 'utf-8';
        head.appendChild(script);

        //JSONP는 예외가 났을 때 처리할 방법이 없기 때문에.. 타이머를 이용한 뒷처리.
        var timeoutID = setTimeout(function(){
            callback('failed');
            jsonpGC();
        }, 3000);

        var success = function(){
            callback('success',data);
        }

        /**
         * window function GC
         * @param _isClearTimer
         */
        var jsonpGC = function(_isClearTimer){
            if(_isClearTimer)
                clearTimeout(timeoutID);
            window[ jsonp ] = undefined;
            try{ delete window[ jsonp ]; } catch(e){}
            if ( head )
                head.removeChild( script );
        }
    },
    /**
     * assist 실행.
     */
    assistExecute : function() {
        var _self = this;
        var timeoutID = null;
        var intervalID = null;
        var a_search_word = '';
        var popupDiv = $tx('tx_wordassist');
        var lastSelectDiv = null;
        _self._resultTemplate = _self._resultTemplate === null?new Template('<div class="search_result"><span>#{word}</span><font color="#666666"> : #{desc}</font></div>'):_self._resultTemplate;
        _self._footerTemplate = _self._footerTemplate === null?new Template('<div id="tx_wordassist_footer">#{mode} 검색결과 | <a href="" onclick="new wordAssistUtil().assisExecute(event)">change(ctrl+space or click)</a> </div>'):_self._footerTemplate;
        ///////////////////////////////////// down : function area start /////////////////////////////////////

        /**
         * ctrl + space toogle
         */
        var toggleAssistType = function(){
            _self._assist_type = _self._assist_type === 'dic'?'suggest':'dic';
        }

        /**
         * 결과 없음 메세지.
         */
        var notResultMessge = function(){
            $tx.removeClassName(popupDiv,'loadingbar');
            var messge = _self._assist_type =='suggest'? 'No suggestions!!!':'No search in dictionary!!!';
            messge += '</div>'+_self._footerTemplate.evaluate({mode:_self._assist_type==='suggest'?'서제스트':'Daum 사전'});
            popupDiv.innerHTML =  '<div class="nosearch_result">'+messge ;
        }

        /**
         * 검색결과를 popup div 데이터 생성.
         * @param search_word
         * @param list
         * @param sType
         */
        var insertItems = function(search_word,list,sType) {
            if((_self._waUtil.isEnglish(search_word) !== _self._waUtil.isEnglish(list[0].word.replace(/\s/g,'')))){ // 공백문제.
                notResultMessge();
                return;
            }
            popupDiv.innerHTML = '';
            $tx.removeClassName(popupDiv,'loadingbar');
            var html = [];
            list.each(function(item){
                var _item = {
                    word : item.word.replace(search_word,'<font color="#eb550c">'+search_word+'</font>'),
                    desc  : item.desc
                };
                html.push(_self._resultTemplate.evaluate(_item));
            });
            if(_self._cache_itemList[search_word+'_'+sType] === undefined ){
                _self._cache_itemList[search_word+'_'+sType] = list;
            }

            popupDiv.innerHTML = html.join('');
            popupDiv.innerHTML += _self._footerTemplate.evaluate({mode:sType==='suggest'?'서제스트':'Daum 사전'});
            var sDivs = $tom.collectAll(popupDiv, "div.search_result");
            sDivs.each(function(sDiv){
                sDiv.onclick = function(){
                    replaceData(_self._waUtil.tagText($tom.collect(sDiv,'span.selectWd')));
                };
                sDiv.onmouseout = function(){
                    _self._waUtil.toggleSelectRow(sDiv,'del');
                };
                sDiv.onmouseover = function(){
                    _self._waUtil.toggleSelectRow(sDiv,'add');
                };
            });
        }

        /**
         *  google suggest searche
         * @param search_word
         * @param sType
         */
        var suggest = function(search_word,sType){
            var resultList = [];
            if(_self._cache_itemList[search_word+'_'+sType] !== undefined){
                resultList = _self._cache_itemList[search_word+'_'+sType];
                insertItems(search_word,resultList,sType);
            }else{
                var _url = 'http://suggestqueries.google.com/complete/search?client=suggest&hjson=t&ds=d&hl=ko&jsonp=?&q='+encodeURIComponent(search_word)+'&cp='+search_word.length;
                _self.jsonpImportUrl(_url,function(status,data){
                    if(status == 'success'){
                        if(data[1].length == 0) {
                            notResultMessge();
                            return;
                        }
                        data[1].each((function(rowdata){
                            resultList.push({word : rowdata[0], desc : rowdata[1]});
                            insertItems(search_word,resultList,sType);
                        }));
                    }else{
                        notResultMessge();
                        return ; // close;
                    }
                });
            }
        }

        /**
         * daume dictionary search
         * @param search_word
         * @param dicType
         */
        var dictionary = function(search_word,dicType){
            var resultList = [];
            if(_self._cache_itemList[search_word+'_'+dicType] !== undefined){
                resultList = _self._cache_itemList[search_word+'_'+dicType];
                insertItems(search_word,resultList,dicType);
            }else{
                var _url = 'http://apis.daum.net/dic/'+dicType;
                _url +=  '?apikey='+ daumAPIKey + "&q=" + encodeURIComponent(search_word) + '&kind=WORD&callback=?&output=json';
                _self.jsonpImportUrl(_url,function(status,data){
                    if(status == 'success'){
                        var channel = data.channel;
                        if(channel.result == 0) {
                            notResultMessge();
                            return;
                        }
                        for(var i=0; i<channel.result; i++) {
                            resultList.push({word : channel.item[i].title, desc : channel.item[i].description.replace(/&lt;b&gt;/gi, '<b>').replace(/&lt;\/b&gt;/gi, '</b>')});
                        }
                        insertItems(search_word,resultList,dicType);
                    }else{
                        notResultMessge();
                        return ;
                    }
                });
            }
        }
        /**
         * 검색.
         * @param search_str
         */
        var searchWord = function() {
            if (_self._selectedNode.length != 0) {
                var nodes = _self._selectedNode[0];
                var search_word = nodes._sNode || '';
                    search_word = search_word !== ''?search_word.nodeValue.replace(/\ufeff/g, ""):'';
                if( search_word.length < 1){
                    closePopupLayer();
                }
                if(a_search_word === search_word) return;
                a_search_word = search_word;
                if(_self._assist_type == 'suggest'){
                    suggest(search_word,'suggest');
                }
                else {
                    var dicType = '';
                    if(_self._waUtil.isEnglish(search_word)){
                        dicType = 'endic';
                    }else if(_self._waUtil.isHangul(search_word)){
                        dicType = 'krdic';
                    }else{
                        notResultMessge();
                        return ;//노 dic...
                    }
                    dictionary(search_word,dicType);
                }
            }else{
                closePopupLayer();
            }
        }
        /**
         * position을 위한 temp span add
         */
        var addTmpSpan = function() {
            var processor = _self.getCurrentProcessor();
            if (!processor.isCollapsed()) {
                return null;
            }
            var _attributes = {};
            var _aNode = processor.create("span", _attributes);
            processor.pasteNode(_aNode, false);
            return _aNode;
        };

        /**
         * temp span 의 position 계산하기.
         */
        var calTmpSpanPosition = function(tmpNode) {
            var iframe = $tx('tx_canvas_wysiwyg');
            var getTop = function(element) {
                var y = 0;
                for (var e = element; e; e = e.offsetParent) {
                    y += e.offsetTop;
                }
                for (e = element.parentNode; e && e != document.body; e = e.parentNode) {
                    if (e.scrollTop) y -= e.scrollTop;
                }
                return y;
            }

            var getLeft = function(element) {
                var x = 0;
                for (var e = element; e; e = e.offsetParent) {
                    x += e.offsetLeft;
                }
                for (e = element.parentNode; e && e != document.body; e = e.parentNode) {
                    if (e.scrollLeft) x -= e.scrollLeft;
                }
                return x;
            }
            _self._assistTop = getTop(tmpNode) + parseInt(iframe.offsetParent.offsetTop + iframe.offsetParent.clientTop, 10);
            if (!$tx.gecko) {
                _self._assistTop += tmpNode.offsetHeight;
                if ($tx.msie) { //width를 주지 않으면... left 위치를 못 가져 오기 때문에.. 예외처리.
                    $tx.setStyle(tmpNode, {'width':'1px'});
                }
            } else {
                _self._assistTop += 3;
            }
            _self._assistLeft = getLeft(tmpNode) + parseInt(iframe.offsetParent.offsetLeft + iframe.offsetParent.clientLeft, 10);
        };

        /**
         * 선택되어야 하는 TextNode 정하기.
         */
        var selectedTextNode = function(prevTmpNode) {
            if(prevTmpNode.nodeType == 1){
                prevTmpNode = _self._waUtil.findLastTextNode(prevTmpNode);
            }
            if (prevTmpNode !== null) { //textNode 일때.
                if(_self._waUtil.isPassableNode(prevTmpNode.nodeValue)){
                    var offset = _self._waUtil.changeToSpace(prevTmpNode.nodeValue).lastIndexOf(' ')+1;
                    var _sNode = null;
                    if(!$tx.webkit){
                        _sNode = $tom.divideText(prevTmpNode, offset);

                    }else{ // 미해결.. webkit 문제 있음.
                        if(offset <= 0 || offset >= prevTmpNode.length) {
                            _sNode = prevTmpNode;
                        }else{
                            var _newNode = document.createTextNode(prevTmpNode.nodeValue.substr(offset));
                            prevTmpNode.nodeValue = prevTmpNode.nodeValue.substring(0,offset);
                            prevTmpNode.parentNode.insertBefore(_newNode, prevTmpNode.nextSibling);
                            _sNode = _newNode;
                        }
                    }
                    moveFocusToTextEnd(_sNode);
                    _self._selectedNode.push({_sNode:_sNode,_pNode:_sNode.previousSibling});
                    return;
                }
            }
            notResultMessge();
            return;
        };

        /**
         * ff 한글문제.
         */
        var clearIntrvalFF = function(){
            if(intervalID !== null) clearInterval(intervalID);
        };

        /**
         * timeoutF
         */
        var clearTimeoutF = function(){
            if(timeoutID !== null) clearTimeout(timeoutID);
        };
        /**
         * popup Layer control 하기 위한 keyEvent!!
         * 상하 이벤트 / 엔터이벤트(결정이벤트)/  좌우 이벤트시 닫기... etc...
         * @param ev
         */
        var pupupOpenAfterKeyDownEvent = function(ev) {
           clearIntrvalFF();
            if((ev.keyCode == 32) && ev.ctrlKey){
                return;
            }else if((ev.ctrlKey && ev.keyCode == Trex.__KEY.CUT) ||
                     (ev.ctrlKey && ev.keyCode == Trex.__KEY.PASTE)||
                     (ev.ctrlKey && ev.keyCode == 90) || //undo
                     (ev.ctrlKey && ev.keyCode == 89) || //redo
                     ev.altKey){
                        closePopupLayer();
                        $tx.stop(ev);
                        return;
            }else if(ev.ctrlKey){
                return;
            }
            switch (ev.keyCode) {
                case $tx.KEY_DOWN :
                    if($tom.collect(popupDiv,'div.select_over') === undefined){
                        _self._waUtil.toggleSelectRow(popupDiv.firstChild,'add');
                    }else{
                        var seldiv = $tom.collect(popupDiv,'div.select_over');
                        if(seldiv.nextSibling !== null && seldiv.nextSibling !== $tom.collect(popupDiv,'#tx_wordassist_footer')){
                            _self._waUtil.toggleSelectRow(seldiv.nextSibling,'add');
                        }else{
                            _self._waUtil.toggleSelectRow(popupDiv.firstChild,'add');
                        }
                    }
                    $tx.stop(ev);
                    break;
                case $tx.KEY_UP :
                    if($tom.collect(popupDiv,'div.select_over') === undefined){
                        _self._waUtil.toggleSelectRow(popupDiv.lastChild.previousSibling,'add');
                    }else{
                        var seldiv = $tom.collect(popupDiv,'div.select_over');
                        if(seldiv.previousSibling !== null && seldiv.previousSibling !== $tom.collect(popupDiv,'#tx_wordassist_footer')){
                            _self._waUtil.toggleSelectRow(seldiv.previousSibling,'add');
                        }else{
                            _self._waUtil.toggleSelectRow(popupDiv.lastChild.previousSibling,'add');
                        }
                    }
                    $tx.stop(ev);
                    break;
                case $tx.KEY_RETURN :
                    if($tom.collect(popupDiv,'span.selectWd') !== undefined){
                        replaceData(_self._waUtil.tagText($tom.collect(popupDiv,'span.selectWd')));
                    }else{
                        closePopupLayer();
                    }
                    $tx.stop(ev);
                    break;
                case $tx.KEY_LEFT : case $tx.KEY_RIGHT : case $tx.KEY_ESC:
                case $tx.KEY_DELETE : case $tx.KEY_HOME: case $tx.KEY_END:
                case $tx.KEY_PAGEDOWN : case $tx.KEY_PAGEUP: case $tx.KEY_TAB:
                case 32:
                    closePopupLayer();
                    break;// 닫기
                case 229:
                    if($tx.gecko){
                        if(intervalID == null){
                            intervalID = setInterval(searchWord,300);
                        }else{
                            clearIntrvalFF();
                            intervalID = setInterval(searchWord,300);
                        }
                        $tx.stop(ev);
                        break;
                    }
                default :
                    if(timeoutID == null){
                        timeoutID = setTimeout(searchWord,300);
                    }else{
                        clearTimeoutF();
                        timeoutID = setTimeout(searchWord,300);
                    }
            }
        };
        /**
         * popup이 떠 있을때 클릭을 하면 닫아준다.
         * @param ev
         */
        var pupupOpenAfterMouseEvent = function(ev){
            closePopupLayer();
            $tx.stop(ev);
        };
        /**
         * toggle keydown event
         */
        var toggleKeyDownEvent = function(isExpire) {
            toggleMouseDownEvent(isExpire);
            _self.toggleEvent(Trex.Ev.__CANVAS_PANEL_KEYDOWN, pupupOpenAfterKeyDownEvent, isExpire);
        };

        /**
         * toggle mouseDown event (popupLayer close.)
         */
        var toggleMouseDownEvent = function(isExpire) {
            _self.toggleEvent(Trex.Ev.__CANVAS_PANEL_MOUSEDOWN, pupupOpenAfterMouseEvent, isExpire);
            _self.toggleEvent(Trex.Ev.__CANVAS_PANEL_SCROLLING, pupupOpenAfterMouseEvent, isExpire);
        };

        /**
         * pop 띄우기.
         */
        var openPopupLayer = function() {
            _self._isWordassist = true;
            toggleKeyDownEvent();
            if(_self._selectedNode.length == 0){
                notResultMessge();
                return ;
            }
            var top = _self._assistTop;
            var left = _self._assistLeft - (_self._selectedNode[0]._sNode.nodeValue.length*7);
            $tx.setStyle(popupDiv, {top: top + 'px',left:left + 'px'});

            popupDiv.innerHTML = '';
            $tx.addClassName(popupDiv,'loadingbar');
            $tx.show(popupDiv);
            searchWord();
        };

         /**
         * pop 닫기.
         */
        var closePopupLayer = function(isNormalize) {
            if(_self._isWordassist == false) return;
            _self._isWordassist = false;
            clearTimeoutF();
            clearIntrvalFF();
            var normalize = isNormalize || true;
            toggleKeyDownEvent(true);
            popupDiv.innerHTML = '';
            $tx.hide(popupDiv);
            closeAfterCallback(normalize);
        };

        /**
         * 포커스 이동시켜주기.
         * @param node
         */
        var moveFocusToTextEnd = function(node) {
            if (!$tx.msie){
                var _rng = _self.getCurrentProcessor().getRange();
                if($tx.webkit){ /// 문제 있음. 미해결.
                    _rng.setStart(node, 0);
                    _rng.setEnd(node, node.length);
                }else{
                    _rng.setEnd(node, node.length);
                    _rng.collapse(false);
                }
            }
        };

        /**
         * replace selectedData
         */
        var replaceData = function(str) {
            try {
                if (_self._selectedNode.length != 0) {
                    var nodes = _self._selectedNode[0];
                    var _pNode = nodes._pNode;
                    var _sNode = nodes._sNode;
                    var _tNode = _self.getCurrentDoc().createTextNode(str);
                    if (_pNode !== null) { // 단독 node가 아닐경우.. 차일드 삭제.
                        $tom.insertNext(_tNode, _pNode);
                    } else {
                        $tom.insertAt(_tNode, _sNode);
                    }
                    $tom.remove(_sNode);
                    moveFocusToTextEnd(_tNode);
                    _tNode.parentNode.normalize();  //webkit 에선... foucs가 튀는 문제가 있음.
                }
            } catch(e) {
            } finally {
                _self._selectedNode = [];
                closePopupLayer(false);
            }
        };

        /**
         * PopupLayer close after callback
         */
        var closeAfterCallback = function(isNormalize) {
            _self._assist_type = 'dic'; // suggest 로 초기화.
            _self._cache_itemList = [];
            timeoutID = null;
            intervalID = null;
            try {
                if (_self._selectedNode.length > 0 && isNormalize) {
                    var nodes = _self._selectedNode[0];
                    nodes._sNode.parentNode.normalize();
                }
            } catch(e) {
            } finally {
                _self._selectedNode = [];
                if($tx.webkit){  //문제있음. webkit focus 문제.
                    setTimeout(function(){Editor.focus();},1000);
                }
            }
        };

        ///////////////////////////////////// up : function area end///// donw : logic start /////////////////////////////////////
        toggleAssistType();
        if(!_self._isWordassist){
            var tmpNode = addTmpSpan(); // 임시 span 삽입
            if (tmpNode === null) {
                $tom.remove(tmpNode); // 일단.. 삭제
                return; // 끝내는곳 호출하기
            }
            calTmpSpanPosition(tmpNode); //좌표 계산.폰트 사이즈 만큼 내려주기.

            var prevTmpNode = _self._waUtil.skipWhiteSpace(tmpNode);
            if (prevTmpNode !== null) {
                selectedTextNode(prevTmpNode);
                if (tmpNode.nextSibling !== null && (tmpNode.nextSibling.nodeType == 3 &&  ! /\S/.test(tmpNode.nextSibling.nodeValue) &&  tmpNode.nextSibling.nodeValue.length < 1)) {
                    $tom.remove(tmpNode.nextSibling); // div 삭제.
                }
                $tom.remove(tmpNode); // div 삭제.
                openPopupLayer();
            }
        }else{
            searchWord();
        }
        ///////////////////////////////////// up : logic end /////////////////////////////////////
    },

    /**
     * 현재 canvas에 processor을 가져옴.
     */
    getCurrentProcessor: function() {
        return this._canvas.getProcessor();
    },

    /**
     * 현재 panel에 doc를 가져옴.
     */
    getCurrentDoc: function() {
        return this.getCurrentProcessor().doc;
    },
 
    /**
     * common toggleEvent . jobObservers push & remove!!
     * 불필요한 이벤트를 방지하기 위한.!
     * @param evName
     * @param ev
     * @param isExprie
     */
    toggleEvent : function(evName, ev, isExprie) {
        var isExprie = isExprie || false;
        var _canvas = this._editor.getCanvas();
        var idx = -1;
        if (_canvas.jobObservers[evName] !== null && _canvas.jobObservers[evName] !== undefined) {
            for (var i = 0; i < _canvas.jobObservers[evName].length; i++) {
                if (_canvas.jobObservers[evName][i].toString() ===  ev.toString()){ idx = i; }
            }
        }
        if (idx != -1 && (idx != -1 || isExprie)) {
            _canvas.jobObservers[evName].splice(idx, 1);
        } else if (!isExprie) {
            _canvas.observeJob(evName, ev);
        }
    }
});

var wordAssistUtil = function() {
    /**
     * 문자열이 한글인지 확인.
     * @param str
     */
    this.isHangul = function(str) {
        var chk_han = str.match(/[ㄱ-ㅎ가-힣]/g);

        if (chk_han !== null && str.length === chk_han.length) {
            return true;
        } else {
            return false;
        }
    };
    /**
     * 문자열이 영어인지 확인.
     * @param str
     */
    this.isEnglish = function(str) {
        var chk_eng = str.match(/[a-z]/ig);
        if (chk_eng !== null && str.length === chk_eng.length) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * 공백 -> space 로 변경.
     */
    this.changeToSpace = function(str) {
        if(!$tx.msie){
            return str.replace(/\s+/, ' ');
        }
        return str.replace(/\u00A0/, ' ');
    };
    /**
     * whiteSpace skip 후 node 반환.
     * @param node
     */
    this.skipWhiteSpace = function(node) {
        if ($tx.msie) return node.previousSibling; //IE 일경우
        var cur = node.previousSibling;
        if (cur !== undefined && cur !== null) {
            if (cur.nodeType == 3 && (! /\S/.test(cur.nodeValue) &&  cur.nodeValue.length < 1)) {
                return this.skipWhiteSpace(cur);
            } else {
                return cur;
            }
        } else {
            if (cur === null) {
                return null;
            } else {
                return node;
            }
        }
    };

    /**
     * span tag의 textvalue 가져오기.
     * @param node
     */
    this.tagText = function(node){
        var returnstr = "";
        var nodes = node.childNodes;
        for(var i = 0; i < nodes.length; i++){
            var cNode = nodes.item(i);
            if ( cNode.nodeType != 8 )
                    returnstr += cNode.nodeType != 1 ?cNode.nodeValue :this.tagText(cNode);
        }
        return returnstr;
    }
    /**
     * type 에 따라 css toggle
     * @param node
     * @param type
     */
    this.toggleSelectRow = function(node,type){
        if($tom.collect($tx('tx_wordassist'),'div.nosearch_result') === undefined){
            if(type == 'add'){
                var seldiv = $tom.collect($tx('tx_wordassist'),'div.select_over');
                if(seldiv !== undefined){
                    this.toggleSelectRow(seldiv,'del');
                }
                $tx.addClassName(node,'select_over');
                $tx.addClassName($tom.collect(node,'span'),'selectWd');
            }else{
                $tx.removeClassName(node,'select_over');
                $tx.removeClassName($tom.collect(node,'span'),'selectWd');
            }
        }
    };

    /**
     * assist execute & a link stop.
     */
    this.assisExecute = function(ev){
        Editor.getPlugin("wordassist").execute();
        $tx.stop(ev);
    };

    this.findLastTextNode = function(node){
        if(node === null || node.nodeName.toUpperCase() == 'BODY') return null;
        var lastTextNode = null;
        var nodes = node.childNodes;
        for(var i = 0; i < nodes.length; i++){
            var cNode = nodes.item(i);
            if (cNode.nodeType == 3 && !(! /\S/.test(cNode.nodeValue) &&  cNode.nodeValue.length < 1)) {
                lastTextNode = cNode;
            }else if(cNode.nodeType == 1){
                lastTextNode = this.findLastTextNode(cNode);
            }
        }
        return lastTextNode;
    };

    /**
     * assist가 가능한 node 인지 판단한다.
     * @param str
     */
    this.isPassableNode = function(str) {
        return (str.trim().length != 0 && this.changeToSpace(str).lastIndexOf(" ") + 1 !== str.length);
    };
}
