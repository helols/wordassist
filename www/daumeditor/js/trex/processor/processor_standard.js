/**
 * @fileOverview
 * Wysiwyg 영역의 컨텐츠를 조작하기 위해 사용되는 공통되는 Processor 정의 
 */
Trex.I.Processor = {};
Trex.I.Processor.Standard = /** @lends Trex.Canvas.Processor.prototype */{
	txSelection: null,
	initialize: function(win, doc) {
		this.win = win;
		this.doc = doc;
		
		this.txSelection = new Trex.Canvas.Selection(this);
		this.bookmark = new Trex.Canvas.Bookmark(this);
	},
	/**
	 * Trex.Canvas.Selection 객체를 리턴한다.
	 * @returns {Object} - Trex.Canvas.Selection 객체
	 * @example
	 * 	processor.getTxSel();
	 */
	getTxSel: function() {
		return this.txSelection;
	},
	/**
	 * native selection object를 리턴한다.
	 * @returns {Object} - native selection 객체
	 * @see Trex.Canvas.Selection#getSel
	 * @example
	 * 	processor.getSel();
	 */
	getSel: function(){
		return this.txSelection.getSel();
	},
	/**
	 * native range object를 리턴한다.
	 * @returns {Object} - native range 객체
	 * @see Trex.Canvas.Selection#getRange
	 * @example
	 * 	processor.getRange();
	 */
	getRange: function() {
		return this.txSelection.getRange();
	},
	/**
	 * Trex.Canvas.Bookmark 객체를 리턴한다.
	 * @returns {Object} - Trex.Canvas.Bookmark 객체
	 * @example
	 * 	processor.getBookmark();
	 */
	getBookmark: function() {
		return this.bookmark;
	},
	/**
	 * 선택된 영역의 collapse 여부(선택된 영역이 있는지 여부)를 리턴한다.
	 * @returns {Boolean} - collapse 여부
	 * @see Trex.Canvas.Selection#isCollapsed
	 * @example
	 * 	processor.isCollapsed();
	 */
	isCollapsed: function() {
		return this.txSelection.isCollapsed();
	},
	/**
	 * 선택된 영역의 노드를 리턴한다.
	 * @returns {Element} - 선택된 영역의 노드
	 * @see Trex.Canvas.Selection#getNode
	 * @example
	 * 	processor.getNode();
	 */
	getNode: function() {
		return this.txSelection.getNode();
	},
	/**
	 * 선택된 영역의 컨트롤 노드(img,object,hr,table,button)를 리턴한다.
	 * @returns {Element} - 선택된 영역의 노드
	 * @see Trex.Canvas.Selection#getControl
	 * @example
	 * 	processor.getControl();
	 */
	getControl: function(){
		return this.txSelection.getControl();
	},
	/**
	 * 선택된 영역이 컨트롤 노드인지 여부를 리턴한다.
	 * @returns {Boolean} - 컨트롤 노드인지 여부
	 * @see Trex.Canvas.Selection#hasControl
	 * @example
	 * 	processor.hasControl();
	 */
	hasControl: function(){
		return this.txSelection.hasControl();
	},
	/**
	 * 컨트롤 노드를 선택한다.
	 * @param {Element} node - 컨트롤 노트 
	 * @example
	 * 	txSelection.selectControl(node);
	 */
	selectControl: function(node){
		return this.txSelection.selectControl(node);
	},
	/**
	 * 선택된 영역의 텍스트 데이터를 리턴한다.
	 * @returns {String} - 선택된 영역의 텍스트 데이터
	 * @see Trex.Canvas.Selection#getText
	 * @example
	 * 	processor.getText();
	 */
	getText: function(){
		return this.txSelection.getText();
	},
	/**
	 * 선택된 영역이 텍스트 데이터 영역의 어떤 위치인지를 리턴한다.
	 * @returns {Number} - 텍스트 데이터 영역의 어떤 위치인지 <br/>
	 * 					텍스트의 처음 : $tom.__POSITION.__START_OF_TEXT : -1<br/>
	 * 					텍스트의 중간 : $tom.__POSITION.__MIDDLE_OF_TEXT : 0<br/>
	 * 					텍스트의 마지막 : $tom.__POSITION.__END_OF_TEXT : 1
	 * @see Trex.Canvas.Selection#compareTextPos
	 * @example
	 * 	processor.compareTextPos();
	 */
	compareTextPos: function() {
		return this.txSelection.compareTextPos();
	},
	/**
	 * 현재 선택된 영역에서 조건에 맞는 노드를 리턴한다.
	 * @param {Function, String} filter - 조건을 나타내는 함수 또는 문자열
	 * @returns {Element} - 조건에 맞는 노드
	 * @example
	 * 	processor.findNode(function() { return 'p,div'; });
	 * 	processor.findNode('%paragraph');
	 */
	findNode: function(filter) {
		try {
			return $tom.find(this.getNode(), filter);
		} catch(e) {
			return null;
		}
	},
	/*-------- processor - query style start --------*/
	/**
	 * 특정한 노드의 특정한 스타일 값을 얻어온다.
	 * @param {Element} node - 특정 노드
	 * @param {String} styleName - 스타일 명
	 * @returns {String} - 스타일 값
	 * @example
	 * 	processor.queryStyle(node, 'textAlign');
	 */
	queryStyle: function(node, styleName) {
		if(!node) {
			return null;
		}
		styleName = ((styleName == 'float')? ((node.style.styleFloat === undefined)? 'cssFloat': 'styleFloat'): styleName);
		if(node.style && node.style[styleName]) {
			return node.style[styleName];
		} else if(node.currentStyle && node.currentStyle[styleName]) {
			return node.currentStyle[styleName];
		} else if(window.getComputedStyle) {
			var _cssStyle = this.doc.defaultView.getComputedStyle(node, null);
	    	return ((_cssStyle)? _cssStyle[styleName] : null);
		}
		return null;
	},
	/**
	 * 특정한 노드의 특정한 속성 값을 얻어온다.
	 * @param {Element} node - 특정 노드
	 * @param {String} attrName - 속성 명
	 * @returns {String} - 속성 값
	 * @example
	 * 	processor.queryAttr(node, 'align');
	 */
	queryAttr: function(node, attrName) {
		if(!node) {
			return null;
		}
		return $tom.getAttribute(node, attrName);
	},
	/**
	 * 선택된 영역의 native queryCommandState 값을 얻어온다.
	 * @param {String} command - 커맨드 명
	 * @returns {Boolean} - 해당 영역이 커맨드 상태인지 여부 
	 * @example
	 * 	processor.queryCommandState('bold');
	 */
	queryCommandState: function(command) {
		try {
			return this.doc.queryCommandState(command);
		} catch(e) { return false; }
	},
	/*-------- processor - query style end --------*/
	/**
	 * 선택된 영역에 native execCommand를 실행시킨다.
	 * @param {String} command - 커맨드 명
	 * @param {String} data - 데이터 값
	 * @example
	 * 	processor.execCommand('forecolor', '#333');
	 */
	execCommand: function(command, data) {
		try {
			this.doc.execCommand(command, false, data);
		} catch(e) {}
	},
	/*-------- processor - marker start --------*/
	/**
	 * 선택된 영역에 주어진 handler를 실행시킨다. 
	 * 주로 외부에서 processor를 이용해 DOM조작을 할 경우에 사용된다.
	 * @param {Funtion} handler - 해당 영역에 실행할 함수
	 * @example
	 * 	processor.execWithMarker(function(marker) {
	 *		$tom.insertAt(node, marker.endMarker);
	 *  });
	 */
	execWithMarker: function(handler) { 
		var _marker = new Trex.Canvas.Marker(this);
		this.bookmarkTo();
		try {
			_marker.paste();
			_marker.backup();
			handler(_marker);
		} catch(e) {
			console.log(e)
		} finally {
			_marker.remove();
		}	
	},
	/*-------- processor - marker end --------*/
	/*--------------------- focus, movecaret ----------------------*/
	/**
	 * wysiwyg 영역에 포커스를 준다.
	 * @example
	 * 	processor.focus();
	 */
	focus: function() {
		this.win.focus();
	},
	/**
	 * wysiwyg 영역에 포커스를 뺀다.
	 * @example
	 * 	processor.blur();
	 */
	blur: function() {
		window.focus(); //NOTE: by focused on parent window, editor will be blured
	},
	/**
	 * 본문의 처음으로 캐럿을 옮긴다.
	 * @example
	 * 	processor.focusOnTop();
	 */
	focusOnTop: function() {
		this.win.focus();
		this.moveCaretTo(this.doc.body, true);
		this.doc.body.scrollTop = 0; //NOTE: only html, not xhtml
	},
	/**
	 * 본문의 마지막으로 캐럿을 옮긴다.
	 * @example
	 * 	processor.focusOnBottom();
	 */
	focusOnBottom: function() {
		this.win.focus();
		this.moveCaretTo(this.doc.body, false);
		this.doc.body.scrollTop = this.doc.body.scrollHeight; //NOTE: only html, not xhtml
	},
	/**
	 * 특정 노드로 캐럿을 옮긴다.
	 * @param {Element} node - 특정 노드
	 * @param {Boolean} toStart - 위치, 시작 = true
	 * @example
	 * 	processor.moveCaretTo(node, true);
	 */
	moveCaretTo: function(node, toStart) {
		if(!node) {
			return;
		}
		this.bookmarkInto(node, toStart);
		this.bookmark.select(this.txSelection);
	},
	/**
	 * 특정 노드의 바깥으로 캐럿을 옮긴다.
	 * @param {String} scope - 특정 노드 패턴
	 * @example
	 * 	processor.moveCaretWith(scope);
	 */
	moveCaretWith: function(scope) {
		if(!scope) { return; }
		var _elOuter = this.findNode(scope);
		if(_elOuter) {
			this.bookmark.saveNextTo(_elOuter);
			this.bookmark.select(this.txSelection);
		}
	},
	/**
	 * 특정 노드를 감싸 선택한다.
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	processor.selectAround(node);
	 */
	selectAround: function(node) {
		if(!node) {
			return;
		}
		this.bookmark.saveAroundNode(node);
		this.bookmark.select(this.txSelection);
	},
	/**
	 * 특정 노드의 안으로 북마크를 수정한다.
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	processor.bookmarkInto(node);
	 */
	bookmarkInto: function(node, toStart) {
		if(!node) {
			return;
		}
		toStart = (toStart == null)? true: toStart;
		if(toStart) {
			this.bookmark.saveIntoFirst(node);
		} else {
			this.bookmark.saveIntoLast(node);
		}
	},
	/**
	 * 특정 노드의 이전으로 북마크를 수정한다.
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	processor.bookmarkToPrevious(node);
	 */
	bookmarkToPrevious: function(node) {
		if(!node) {
			return;
		}
		this.bookmark.savePreviousTo(node);
	},
	/**
	 * 특정 노드의 다음으로 북마크를 수정한다.
	 * @param {Element} node - 특정 노드
	 * @example
	 * 	processor.bookmarkToNext(node);
	 */
	bookmarkToNext: function(node) {
		if(!node) {
			return;
		}
		this.bookmark.saveNextTo(node);
	},
	/**
	 * execute하기 전 range를 북마크한다.
	 * @example
	 * 	processor.bookmark();
	 */
	bookmarkTo: function(rng) {
		rng = rng || this.txSelection.getRange(); 
		this.bookmark.save({
			startContainer: rng.startContainer,
			startOffset: rng.startOffset,
			endContainer: rng.endContainer,
			endOffset: rng.endOffset
		});
	},
	/**
	 * marker에 따라 북마크를 수정한다.
	 * @example
	 * 	processor.bookmarkWithMarker(marker);
	 */
	bookmarkWithMarker: function(marker) {
		this.bookmark.saveWithMarker(marker);
	},
	/**
	 * 저장한 range를 선택한다.
	 * @param {Object} bookmark - 저장했던 meta Range 객체 
	 * @example
	 * 	processor.restore(bookmark);
	 */
	restore: function() {
		this.bookmark.select(this.txSelection);
	},
	/*------------ execute action ------------*/
	/**
	 * 인자에 따라 노드를 생성한다.
	 * @param {String, Object, Element} argument - 가변 arguments<br/>
	 * 			{String} name : 1st String은 노드명  <br/>
	 * 			{Object} attributes : 적용할 속성들  <br/>
	 * 			{Element, String, Number} children : 자식 노드 
	 * @example
	 * 	processor.create('div', { 'className': 'txc-textbox' });
	 */
	create: function() {
		var args = $A(arguments), name = args.shift();
		var _node = this.getNodeCreator(name);
		each(args, function(arg) {
			if (arg.nodeType) {
				$tom.append(_node, arg);
			} else if (typeof(arg) == 'string' || typeof(arg) == 'number') {
				name.innerHTML += arg;
			} else if (typeof(arg) == 'array') {
				for (var i = 0; i < arg.length; i++) {
					$tom.append(_node, arg[i]);
				}
			} else {
				$tom.applyAttributes(_node, arg);
			}
		});
		return _node;
	},
	/**
	 * 선택한 영역에 노드를 삽입한다.
	 * @param {Array,Element} nodes - 삽입하고자 하는 노드 배열 또는 노드
	 * @param {Boolean} newline - 현재 영역에서 한줄을 띄운 후 삽입할지 여부
	 * @param {Object} wrapStyle - wrapper 노드에 적용할 스타일, <br/>
	 * 					newline이 true 일 경우에만 의미를 갖는다.
	 * @example
	 * 	processor.pasteNode([node, node], true, { 'style': { 'textAlign': 'center' } });
	 */
	pasteNode: function(nodes, newline, wrapStyle) {
		if(!nodes) {
			return;
		}
		if(!nodes.length) {
			nodes = [].concat(nodes);
		}
		
		this.txSelection.collapse(false);
		var _rng = this.txSelection.getRange(); 
		var _processor = this;
		this.execWithMarker(function(marker) {
			if(newline) {
				var _dvNode = $tom.divideParagraph(marker.endMarker);
				var _wpNode;
				if($tom.kindOf(_dvNode, 'p,li,dd,dt,h1,h2,h3,h4,h5,h6')) {
					_wpNode = $tom.clone(_dvNode);
				} else {
					_wpNode = _processor.create($tom.paragraphOf());
				}
				$tom.insertAt(_wpNode, _dvNode);
				nodes.each(function(node) {
					$tom.append(_wpNode, node);
				});
				if(wrapStyle) {
					$tom.applyAttributes(_wpNode, wrapStyle);
				}
				_processor.bookmark.saveIntoFirst(_dvNode);
			} else {
				nodes.each(function(node) {
					$tom.insertNext(node, marker.endMarker);
				});
			}
		});
		return nodes[0];
	},
	/**
	 * 선택한 영역에 HTML 컨텐츠를 삽입한다.
	 * @param {String} html - 삽입하고자 하는 HTML 컨텐츠
	 * @param {Boolean} newline - 현재 영역에서 한줄을 띄운 후 삽입할지 여부 true/false
	 * @param {Object} wrapStyle - wrapper 노드에 적용할 스타일, <br/>
	 * 					newline이 true 일 경우에만 의미를 갖는다.
	 * @example
	 * 	processor.pasteNode('<img src="이미지경로"/>', true, { 'style': { 'textAlign': 'center' } });
	 */
	pasteContent: function(html, newline, wrapStyle) {
		var _tmpNode = this.create('div');
		_tmpNode.innerHTML = html;
		var _dataNodes = $tom.children(_tmpNode);
		return this.pasteNode(_dataNodes, newline, wrapStyle);
	},
	/**
	 * 주어진 노드를 새로운 노드로 교체한다.
	 * @param {Element} node - 기존 노드
	 * @param {String} tag - 새로운 노드 명
	 * @param {Object} attributes - 새로운 노드에 적용할 속성들
	 * @returns {Element} - 생성한 노드
	 * @example
	 * 	processor.replace(p, 'li');
	 */
	replace: function(node, tag, attributes) {
		this.bookmark.saveAroundNode(node);
		return $tom.replace(node, this.create(tag, attributes));
	},
	/**
	 * 선택한 영역안에 있는 노드 중에 패턴을 만족하는 블럭 노드들을 리턴한다.
	 * @param {Array} filter - 수집할 노드 패턴 조건 
	 * @returns {Array} - 선택한 영역안에 있는 노드 중에 패턴을 만족하는 노드들
	 * @example
	 * 	processor.blocks(function() {
			return '%paragraph';
		});
	 */
	blocks: function(filter) {
		var _nodes = [];
		var _rng = this.getRange();
		var _patterns = filter();
		if (this.hasControl()) { 
			var _control = this.getControl();
			if ($tom.kindOf(_control.parentNode, _patterns)) { 
				_nodes.push(_control.parentNode);
			}
		} else {
			var _processor = this;
			this.execWithMarker(function(marker) {
				var _itr = _processor.getBlockRangeIterator(_patterns, marker.startMarker, marker.endMarker);
				var _node;
				while (_itr.hasNext()) {
					_node = _itr.next();
					if ($tom.kindOf(_node, '#tx_start_marker,#tx_end_marker')) {
						//ignore
					} else {
						_nodes.push(_node);
					}
				}
			});
		}
		return _nodes;
	},
	/**
	 * 선택한 영역안에 있는 노드 중에 패턴을 만족하는 인라인 노드들을 리턴한다.
	 * @param {Array} filter - 수집할 노드 패턴 조건 
	 * @returns {Array} - 선택한 영역안에 있는 노드 중에 패턴을 만족하는 노드들
	 * @example
	 * 	processor.inlines(function(type) {
			if(type === 'control') {
				return 'hr,table';
			}
			return '%inline';
		});
	 */
	inlines: function(filter) {
		var _nodes = [];
		var _rng = this.getRange();
		var _patterns = filter();
		
		var _processor = this;
		var _createInline = function() {
			return _processor.create($tom.inlineOf());
		};
		
		if (this.hasControl()) { 
			var _control = this.getControl();
			if ($tom.kindOf(_control, _patterns)) { 
				_nodes.push(_control);
			} else {
				var _iNode = _createInline();
				$tom.insertNext(_iNode, _control);
				$tom.append(_iNode, _control);
			}
		} else {
			this.execWithMarker(function(marker) {
				if (marker.checkCollapsed()) { //collapsed
					var _iNode = _createInline();
					$tom.append(_iNode, _processor.createDummy());
					$tom.insertNext(_iNode, marker.startMarker);
					_processor.bookmarkTo({
						startContainer: _iNode,
						startOffset: 1,
						endContainer: _iNode,
						endOffset: 1
					});
					_nodes.push(_iNode);
				} else {
					var _itr = _processor.getInlineRangeIterator(_patterns, marker.startMarker, marker.endMarker);
					var _node;
					while (_itr.hasNext()) {
						_node = _itr.next();
						if ($tom.kindOf(_node, '#tx_start_marker,#tx_end_marker')) {
							//ignore
						} else if ($tom.kindOf(_node, 'br')) {
							//ignore
						} else {
							_nodes.push(_node);
						}
					}
				}
			});
		}
		return _nodes;
	},
	/**
	 * 선택한 영역안에 있는 노드 중에 패턴을 만족하는 컨트롤 노드(img,object,hr,table,button)들을 리턴한다.
	 * @param {Array} condition - 수집할 노드 패턴 조건 
	 * @returns {Array} - 선택한 영역안에 있는 노드 중에 패턴을 만족하는 노드들
	 * @example
	 * 	processor.controls(function() {
			return 'hr,table';
		});
	 */
	controls: function(filter) {
		var _nodes = [];
		var _rng = this.getRange();
		if (this.hasControl()) { 
			if ($tom.kindOf(this.getControl(), filter())) { 
				_nodes.push(this.getControl());
			}
		} 
		return _nodes;
	},
	/**
	 * 배열 내의 모든 노드에게 지정한 속성을 적용한다.
	 * @param {Array} patterns - 속성을 적용할 노드 배열
	 * @param {Object} attributes - 노드에 적용할 속성들
	 * @returns {Array} - 입력 노드들
	 * @example
	 * 	processor.apply([p,p,p], { style: { textAlign: 'center'}});
	 */
	apply: function(nodes, attributes) {
		if(!nodes) {
			return null;
		}
		if(!nodes.length) {
			nodes = [].concat(nodes);
		}
		nodes.each(function(node) {
			$tom.applyAttributes(node, attributes);
		});
		return nodes;
	},
	/**
	 * 배열 내의 모든 노드를 주어진 블럭으로 감싼다.
	 * @param {Array} patterns - 블럭으로 감쌀 노드 배열
	 * @param {String} tag - 블럭 노드 명
	 * @param {Object} attributes - 블럭에 적용할 속성
	 * @returns {Element} - 생성한 블럭노드
	 * @example
	 * 	processor.wrap([p,p,p], 'div', { style: { backgroundColor: 'black'}});
	 */
	wrap: function(nodes, tag, attributes) {
		if(!nodes) {
			return null;
		}
		if(!nodes.length) {
			nodes = [].concat(nodes);
		}
		return $tom.wrap(this.create(tag, attributes), nodes);
	},
	/**
	 * 블럭으로 감싸진 노드들을 빼내고 블럭을 삭제한다.
	 * @param {Element} node - 블럭 노드
	 * @returns {Element} - 블럭의 첫번째 노드 또는 블럭의 다음 노드
	 * @example
	 * 	processor.unwrap(node);
	 */
	unwrap: function(node) {
		if (!node) {
			return;
		}
		this.bookmark.saveAroundNode(node);
		return $tom.unwrap(node);
	},
	/**
	 * 배열 내의 모든 노드를 주어진 리스트로 감싼다.
	 * @param {Array} nodes - 리스트로 감쌀 노드 배열
	 * @param {String} tag - 리스트 노드 명
	 * @param {Object} attributes - 리스트 노드에 적용할 속성
	 * @returns {Element} - 생성한 리스트 노드
	 * @example
	 * 	processor.tolist([p,p,p], 'ol', {});
	 */
	tolist: function(nodes, tag, attributes) {
		if(!nodes) {
			return null;
		}
		var _processor = this;
		
		var _curGNode;
		$A(nodes).each(function(node) {
			if($tom.kindOf(node, '%wrapper')) {
				if(!_curGNode) {
					_curGNode = _processor.create(tag, attributes);
					$tom.insertAt(_curGNode, node);
				}
				$tom.append(_curGNode, _processor.wrap(node, 'li', {}));
			} else {
				if ($tom.kindOf(node, '%listgroup')) {
					if (_curGNode) {
						$tom.append(_curGNode, node);
					} else {
						var _gNode = $tom.ancestor(node, 'ul,ol');
						if (_gNode) {
							if ($tom.kindOf(_gNode, tag)) {
								if (_curGNode != _gNode) {
									$tom.apply(_gNode, attributes);
								}
								_curGNode = _gNode;
							} else {
								var _cloneGNode = $tom.divideNode(_gNode, $tom.indexOf(node)); //나누기
								var _newGNode = _processor.create(tag, attributes);
								$tom.insertAt(_newGNode, _cloneGNode);
								$tom.append(_newGNode, node);
								_curGNode = _newGNode;
								if (!$tom.hasChildren(_cloneGNode)) {
									$tom.remove(_cloneGNode);
								}
								if (!$tom.hasChildren(_gNode)) {
									$tom.remove(_gNode);
								}
							}
						} else { //invalid
							var _newGNode = _processor.create(tag, attributes);
							$tom.insertAt(_newGNode, node);
							_curGNode = _newGNode;
							$tom.append(_curGNode, node);
						}
					}
				} else {
					if(!!$tom.ancestor(node, '%datagroup,%tablegroup')) {
						_curGNode = null;		
					} 
					if(!_curGNode) {
						_curGNode = _processor.create(tag, attributes);
						$tom.insertAt(_curGNode, node);
					}
					var _lNode = _processor.create('li');
					$tom.replace(node, _lNode)
					$tom.append(_curGNode, _lNode);
					/* split paragraph by linebreak node
					$tom.split(node, 'br').each(function(line) {
						var _lNode = _processor.create('li');
						$tom.append(_curGNode, $tom.replace(line, _lNode));
					});
					*/
				}
			}
		});
		return _curGNode;
	}, 
	/**
	 * 리스트를 일반 노드로 변경한다.
	 * @param {Element} node - 일반 노드로 변경할 리스트 노드
	 * @returns {Element} - 변경된 노드들의 첫번째 노드
	 * @example
	 * 	processor.offlist(ul,ol);
	 */
	offlist: function(node) {
		if(!node) {
			return null;
		}
		
		var _lNodes = $tom.children(node, 'li'); 
		var _tag = "p";
		if($tom.kindOf($tom.parent(node), '%listgroup')) {
			_tag = "li";
		}
		
		var _processor = this;
		$A(_lNodes).each(function(lNode) {
			var _pNode = _processor.create(_tag);
			$tom.append(node, $tom.replace(lNode, _pNode));
		});
		this.bookmark.saveAroundNode(node);
		return $tom.unwrap(node);
	},
	/**
	 * 배열 내의 모든 노드에 들여쓰기를 적용한다.
	 * @param {Array} nodes - 들여쓰기를 적용할 노드 배열
	 * @param {Object} attributes - 노드에 적용할 속성
	 * @example
	 * 	processor.indent([p,p,p], { 'style': { 'marginLeft': '+4em' } });
	 */
	indent: function(nodes, attributes) {
		if(!nodes) {
			return null;
		}
		var _curGNode;
		var _subGNode;
		var _processor = this;
		$A(nodes).each(function(node) {
			if ($tom.kindOf(node, "li,dd,dt")) {
				var _gNode = $tom.ancestor(node, 'ul,ol,dl');
				if(_gNode) {
					if (_gNode != _curGNode) {
						_subGNode = null;
					}
					if (_subGNode) {
						$tom.append(_subGNode, node);
					} else {
						_subGNode = $tom.wrap($tom.clone(_gNode), node);
					}
					_curGNode = _gNode;
				} else {
					$tom.applyAttributes(node, attributes); //invalid case
				}
			} else if ($tom.kindOf(node, "td,th")) {
				var _pNode = _processor.create('p');
				$tom.moveChild(node, _pNode);
				$tom.append(node, _pNode);
				$tom.applyAttributes(_pNode, attributes);
			} else {
				$tom.applyAttributes(node, attributes);
			}
		});
	},
	/**
	 * 배열 내의 모든 노드에 내어쓰기를 적용한다.
	 * @param {Array} nodes - 내어쓰기를 적용할 노드 배열
	 * @param {Object} attributes - 노드에 적용할 속성
	 * @example
	 * 	processor.outdent([p,p,p], { 'style': { 'marginLeft': '-4em' } });
	 */
	outdent: function(nodes, attributes) {
		if(!nodes) {
			return null;
		}
		var _processor = this;
		$A(nodes).each(function(node) {
			if ($tom.kindOf(node, "li,dd,dt")) {
				var _gNode = $tom.ancestor(node, 'ul,ol,dl');
				if(_gNode) {
					var _ngNode = $tom.divideNode(_gNode, $tom.indexOf(node));
					var _ggNode = $tom.ancestor(_ngNode, 'ul,ol,dl');
					if(_ggNode) {
						$tom.insertAt(node,_ngNode);
					} else {
						var _lNode = $tom.replace(node,_processor.create('p'));
						$tom.insertAt(_lNode,_ngNode);
					}
					if(!$tom.first(_gNode, 'li')) {
						$tom.remove(_gNode);
					}
					if(!$tom.first(_ngNode, 'li')) {
						$tom.remove(_ngNode);
					}
				} else {
					$tom.applyAttributes(node, attributes); //invalid case
				}
			} else {
				$tom.applyAttributes(node, attributes);
			}
		});
	}
};

