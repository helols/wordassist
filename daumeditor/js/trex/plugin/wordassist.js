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

    assistExecute : function() {
        var _self = this;
        ///////////////////////////////////// down : function area start /////////////////////////////////////
        /**
         * 검색.
         * @param search_str
         */
        var searchWord = function(search_str) {
            // this.close(true);
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
                if($tx.msie){ //IE만 초기에 .. 공백을 만들어버리는 현상을 보인다.
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
            switch (ev.keyCode) {
                case $tx.KEY_DOWN :
                case $tx.KEY_UP :
                case $tx.KEY_RETURN :
                    if ($tx.KEY_UP === ev.keyCode) {
                        $tx('tx_article_title').value = '_sNode[' + _self._selectedNode[0]._sNode.nodeValue + ']';
                    }
                    else if ($tx.KEY_DOWN === ev.keyCode) {
                    }
                    else if ($tx.KEY_RETURN === ev.keyCode) {
                        }
                    $tx.stop(ev);
                    break;
                case $tx.KEY_LEFT :
                case $tx.KEY_RIGHT :
                case $tx.KEY_ESC:
                    break;
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
            toggleKeyDownEvent();
            if(_self._selectedNode.length == 0){
                $tx('tx_article_title').value += '@@@END';
                return ;
            }
            var nodes = _self._selectedNode[0];
            var top = _self._assistTop;
            var left = _self._assistLeft;
            $tx.setStyle($tx('tx_wordassist'), {top: top + 'px',left:left + 'px'});
            var _loadingImg = document.createElement("img");
            _loadingImg.src = '/daumeditor/images/deco/ajax-loader.gif'
            $tx('tx_wordassist').innerHTML = '';
            $tx('tx_wordassist').appendChild(_loadingImg);
            $tx.show($tx('tx_wordassist'));
            searchWord(nodes._sNode.nodeValue);  // 팝업열기.
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
            }
        };

        /**
         * PopupLayer close after callback
         */
        var closeAfterCallback = function(returnStr) {
            replaceData(returnStr);
        };

        ///////////////////////////////////// up : function area end///// donw : logic start /////////////////////////////////////
        if (!_self._isWordassist) {
            _self._isWordassist = true;
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
        } else {
            toggleKeyDownEvent(true);
            _self._isWordassist = false;
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
        if (isExprie === undefined) isExprie = false;
        var _canvas = this._editor.getCanvas();
        var idx = -1;
        if (_canvas.jobObservers[evName] !== null && _canvas.jobObservers[evName] !== undefined) {
            if ($tx.msie) {
                for (var i = 0; i < _canvas.jobObservers[evName].length; i++) {
                    if (_canvas.jobObservers[evName][i] === ev) {
                        idx = i;
                    }
                }
            } else {
                idx = _canvas.jobObservers[evName].indexOf(ev);
            }
        }
        if (idx != -1 && (idx != -1 || isExprie)) {
            _canvas.jobObservers[evName].splice(idx, 1);
        } else if (!isExprie) {
            _canvas.observeJob(evName, ev);
        }
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

    close : function(isCallCallBackFunc) {
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
        if (isCallCallBackFunc) {
            _self.closeAfterCallback('school');
        }
        //        Editor.getPlugin("wordassist").close();
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
}