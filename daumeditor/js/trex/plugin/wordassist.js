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
    //    _popupLayer : null,
    _isWordassist : null,
    _canvas : null,
    _tmp : null,
    _wordAssistUtil : null,
    _daumAPIKey : TrexConfig.get('daumAPIKey'),
    _assist_type : 'dic',
    _cache_itemList : [],
    initialize: function(editor, config) {
        if (!editor) {
            return;
        }
        var _self = this;
        _self._editor = editor;
        _self._canvas = editor.getCanvas();
        _self._wordAssistUtil = new wordAssistUtil();
        //        _self._popupLayer = new Trex.Plugin.WordAssist.PopupLayer(this);
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

        //jquery 참조.
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

        var jsonpGC = function(_isClearTimer){
            if(_isClearTimer)
                clearTimeout(timeoutID);
            window[ jsonp ] = undefined;
            try{ delete window[ jsonp ]; } catch(e){}
            if ( head )
                head.removeChild( script );
        }
    },
    assistExecute : function() {
        var _self = this;
        var timeoutID = null;
        var popupDiv = $tx('tx_wordassist');
        /* todo
            close 할때 비워 주기. cache_itemList 
         */
        ///////////////////////////////////// down : function area start /////////////////////////////////////
        var toggleAssistType = function(){
            _self._assist_type = _self._assist_type === 'dic'?'suggest':'dic';
        }
        var notResultMessge = function(sType){
            $tx.removeClassName(popupDiv,'loadingbar');
            popupDiv.innerHTML = sType =='suggest'? 'No suggestions!!!':'no search in dictionary!!!';
        }
        var insertItems = function(search_word,list,sType) {
            if((_self._wordAssistUtil.isEnglish(search_word) !== _self._wordAssistUtil.isEnglish(list[0].word))){ // 공백문제.
                notResultMessge(sType);
                return;
            }
            var template = new Template('<div class="search_result"><span><font color="#eb550c">#{equalsWd}</font>#{modWd}</span><font color="#666666"> : #{desc}</font></div>');
            popupDiv.innerHTML = '';
            $tx.removeClassName(popupDiv,'loadingbar');
            var html = [];
            list.each(function(item){
                var equalsWd = item.word.slice(0,search_word.length) == search_word?search_word:'';
                var modWd = equalsWd === '' ? item.word : item.word.slice(search_word.length);
                var _item = {
                    equalsWd : equalsWd,
                    modWd : modWd,
                    desc  : item.desc
                }
                html.push(template.evaluate(_item));
            });
            if(_self._cache_itemList[search_word+'_'+sType] === undefined ) _self._cache_itemList[search_word+'_'+sType] = list;
            popupDiv.innerHTML = html.join('');
            var sDivs = $tom.collectAll(popupDiv, "div.search_result");
            sDivs.each(function(sDiv){
                sDiv.onclick = function(){
                    replaceData(_self._wordAssistUtil.spanValue($tom.collect(sDiv,'span.selectWd')));
                };
                sDiv.onmousedown = function(){
                };
                sDiv.onmouseout = function(){
                    _self._wordAssistUtil.toggleSelectRow(sDiv,'del');
                };
                sDiv.onmouseover = function(){
                    _self._wordAssistUtil.toggleSelectRow(sDiv,'add');
                }
            });
        }

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
                            notResultMessge(sType);
                            return;
                        }
                        data[1].each((function(rowdata){
                            resultList.push({word : rowdata[0], desc : rowdata[1]});
                            insertItems(search_word,resultList,sType);
                        }));
                    }else{
                        notResultMessge(sType);
                        return ; // close;
                    }
                });
            }
        }

        var dictionary = function(search_word,dicType){
            var resultList = [];
            if(_self._cache_itemList[search_word+'_'+dicType] !== undefined){
                resultList = _self._cache_itemList[search_word+'_'+dicType];
                insertItems(search_word,resultList,dicType);
            }else{
                var _url = 'http://apis.daum.net/dic/'+dicType;
                _url +=  '?apikey='+ _self._daumAPIKey + "&q=" + encodeURIComponent(search_word) + '&kind=WORD&callback=?&output=json';
                _self.jsonpImportUrl(_url,function(status,data){
                    if(status == 'success'){
                        var channel = data.channel;
                        if(channel.result == 0) {
                            notResultMessge(dicType);
                            return;
                        }
                        for(var i=0; i<channel.result; i++) {
                            resultList.push({word : channel.item[i].title, desc : channel.item[i].description.replace(/&lt;b&gt;/gi, '<b>').replace(/&lt;\/b&gt;/gi, '</b>')});
                        }
                        insertItems(search_word,resultList,dicType);
                    }else{
                        notResultMessge(dicType);
                        return ; //close
                    }
                });
            }
        }
        /**
         * 검색.
         * @param search_str
         */
        var searchWord = function() {

            var nodes = _self._selectedNode[0];
            var search_word = nodes._sNode.nodeValue;
            if(_self._assist_type == 'suggest'){
                suggest(search_word,'suggest');
            }
            else {
                var dicType = '';
                if(_self._wordAssistUtil.isEnglish(search_word)){
                    dicType = 'endic';
                }else if(_self._wordAssistUtil.isHangul(search_word)){
                    dicType = 'krdic';
                }else{
                    return ;//노 dic...
                }
                dictionary(search_word,dicType);
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
            if (prevTmpNode.nodeType == 3) { //textNode 일때.
                if(!$tx.msie){ //IE만 초기에 .. 공백을 만들어버리는 현상을 보인다.
                    prevTmpNode.parentNode.normalize();
                }
                $tx('tx_article_title').value += _self.isPassableNode(prevTmpNode.nodeValue);
                if(!_self.isPassableNode(prevTmpNode.nodeValue)){
                    return ;
                };
                var offset = _self._wordAssistUtil.changeToSpace(prevTmpNode.nodeValue).lastIndexOf(' '); // 0 면 앞 노드 까지 검색하기 ?
                var _sNode = $tom.divideText(prevTmpNode, offset);
                _self._selectedNode.push({_sNode:_sNode,offset:offset,_pNode:_sNode.previousSibling});
                $tx('tx_article_title').value += '_sNode[' + _sNode.nodeValue+ '/'+offset+'//'+_sNode.nodeValue.replace(/&nbsp;/gi,'dd')+']';
            } else if (prevTmpNode.nodeType == 1) {
                $tx('tx_article_title').value += 'prevTmpNode.nodeType[11111]';
            } else {
                return; // 끝내는곳 불러주기.
            }
        };

        /**
         * popup Layer control 하기 위한 keyEvent!!
         * 상하 이벤트 / 엔터이벤트(결정이벤트)/  좌우 이벤트시 닫기... etc...
         * @param ev
         */
        var pupupOpenAfterKeyDownEvent = function(ev) {
            if((ev.keyCode == Trex.__KEY.SPACE && ev.ctrlKey) || ev.ctrlKey || ev.altKey || ev.shiftKey){
                return;
            }
            switch (ev.keyCode) {
                case $tx.KEY_DOWN :
                    if($tom.collect(popupDiv,'div.select_over') === undefined){
                        _self._wordAssistUtil.toggleSelectRow(popupDiv.firstChild,'add');
                    }else{
                        var seldiv = $tom.collect(popupDiv,'div.select_over');
//                        _self._wordAssistUtil.toggleSelectRow(seldiv,'del');
                        if(seldiv.nextSibling !== null){
                            _self._wordAssistUtil.toggleSelectRow(seldiv.nextSibling,'add');
                        }else{
                            _self._wordAssistUtil.toggleSelectRow(popupDiv.firstChild,'add');
                        }
                    }
                    $tx.stop(ev);
                    break;
                case $tx.KEY_UP :
                    if($tom.collect(popupDiv,'div.select_over') === undefined){
                        _self._wordAssistUtil.toggleSelectRow(popupDiv.lastChild,'add');
                    }else{
                        var seldiv = $tom.collect(popupDiv,'div.select_over');
//                        _self._wordAssistUtil.toggleSelectRow(seldiv,'del');
                        if(seldiv.previousSibling !== null){
                            _self._wordAssistUtil.toggleSelectRow(seldiv.previousSibling,'add');
                        }else{
                            _self._wordAssistUtil.toggleSelectRow(popupDiv.lastChild,'add');
                        }
                    }
                    $tx.stop(ev);
                    break;
                case $tx.KEY_RETURN :
                    if($tom.collect(popupDiv,'span.selectWd') !== undefined){
                        replaceData(_self._wordAssistUtil.spanValue($tom.collect(popupDiv,'span.selectWd')));
                    }
                    $tx.stop(ev);
                    break;
                case $tx.KEY_LEFT : case $tx.KEY_RIGHT : case $tx.KEY_ESC:
                case $tx.KEY_DELETE : case $tx.KEY_HOME: case $tx.KEY_END:
                case $tx.KEY_PAGEDOWN : case $tx.KEY_PAGEUP: case $tx.KEY_TAB:
                case Trex.__KEY.SPACE: case Trex.__KEY.CUT: case Trex.__KEY.PASTE:
                    closePopupLayer();
                    break;// 닫기
                default :                        
                    if(timeoutID == null){
                        timeoutID = setTimeout(searchWord,100);
                    }else{
                        clearTimeout(timeoutID);
                        timeoutID = setTimeout(searchWord,100);
                    }
            }
        };
        /**
         * toggle keydown event
         */
        var toggleKeyDownEvent = function(isExpire) {
            _self.toggleEvent(Trex.Ev.__CANVAS_PANEL_KEYDOWN, pupupOpenAfterKeyDownEvent, isExpire);
        };

        /**
         * toggle mouseDown event (popupLayer close.)
         */
        var toggleMouseDownEvent = function(isExpire) {
            _self.toggleEvent(Trex.Ev.__CANVAS_PANEL_MOUSEDOWN, pupupOpenAfterKeyDownEvent, isExpire);
        };

        /**
         * pop 띄우기.
         */
        var openPopupLayer = function() {
            _self._isWordassist = true;
            toggleKeyDownEvent();
            if(_self._selectedNode.length == 0){
                return ;
            }
            var top = _self._assistTop;
            var left = _self._assistLeft - (_self._selectedNode[0]._sNode.nodeValue.length*7);
            $tx.setStyle(popupDiv, {top: top + 'px',left:left + 'px'});

            popupDiv.innerHTML = '';
            $tx.addClassName(popupDiv,'loadingbar');
            $tx.show(popupDiv);
            searchWord();
        }

         /**
         * pop 닫기.
         */
        var closePopupLayer = function(isNormalize) {
            var normalize = isNormalize || true;
            _self._isWordassist = false;
            toggleKeyDownEvent(true);
            popupDiv.innerHTML = '';
            $tx.hide(popupDiv);
            closeAfterCallback(normalize);
        }

        var moveFocusToTextEnd = function(node) {
            if ($tx.msie) return;
            var _rng = _self.getCurrentProcessor().getRange();
            _rng.setEnd(node, node.length);
            _rng.collapse(false);
        };

        /**
         * replace selectedData
         */
        var replaceData = function(str) {
            try {
                if (_self._selectedNode.length == 1) {
                    var nodes = _self._selectedNode[0];
                    var _pNode = nodes._pNode;
                    var _sNode = nodes._sNode;
                    var _tNode = _self.getCurrentDoc().createTextNode(str);
                    if (_pNode !== undefined && _pNode !== null) { // 단독 node가 아닐경우.. 차일드 삭제.
                        $tx('tx_article_title').value += '_pNode defined ';
                        $tom.insertNext(_tNode, _pNode);
                    } else {
                        $tx('tx_article_title').value += '_pNode undefined ';
                        $tom.insertAt(_tNode, _sNode);
                    }
                    $tom.remove(_sNode);
                    moveFocusToTextEnd(_tNode);
                    _tNode.parentNode.normalize();
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
            try {
                if (_self._selectedNode.length > 0 && isNormalize) {
                    var nodes = _self._selectedNode[0];
//                    nodes._sNode.parentNode.normalize();
                }
            } catch(e) {
            } finally {
                _self._selectedNode = [];
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

            var prevTmpNode = _self._wordAssistUtil.skipWhiteSpace(tmpNode);
            if (prevTmpNode !== null) {
                selectedTextNode(prevTmpNode);
                if (tmpNode.nextSibling !== null && (tmpNode.nextSibling.nodeType == 3 && !tmpNode.nextSibling.length)) {
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
     * 공백으로 시작 하거나 whiteSpace node 일경우 체크람. ( 둘다 아닌경우에만 통과함.)
     * refactoring...
     * @param str
     */
    isPassableNode : function(str) {
        return (str.trim().length != 0 && this._wordAssistUtil.changeToSpace(str).lastIndexOf(" ") + 1 !== str.length)
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
        return str.replace(/\s/g, ' ');
    }
    /**
     * whiteSpace skip 후 node 반환.
     * @param node
     */
    this.skipWhiteSpace = function(node) {
        if ($tx.msie) return node.previousSibling; //IE 일경우
        var cur = node.previousSibling;
        if (cur !== undefined && cur !== null) {
            if (cur.nodeType == 3 && !cur.length) {
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
    this.spanValue = function(node){
        var returnstr = "";
        var nodes = node.childNodes;
        for(var i = 0; i < nodes.length; i++){
            var cNode = nodes.item(i);
            if ( cNode.nodeType != 8 )
                    returnstr += cNode.nodeType != 1 ?cNode.nodeValue :new wordAssistUtil().spanValue(cNode);
        }
        return returnstr;
    }
    /**
     * type 에 따라 css toggle
     * @param node
     * @param type
     */
    this.toggleSelectRow = function(node,type){
            if(type == 'add'){
                var seldiv = $tom.collect($tx('tx_wordassist'),'div.select_over');
                if(seldiv !== undefined){
                    new wordAssistUtil().toggleSelectRow(seldiv,'del');
                }
                $tx.addClassName(node,'select_over');
                $tx.addClassName($tom.collect(node,'span'),'selectWd');
            }else{
                $tx.removeClassName(node,'select_over');
                $tx.removeClassName($tom.collect(node,'span'),'selectWd');
            }
    }
}
