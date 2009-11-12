
var $tom = {};

(function() {
	var __TRANSLATIONS = {
		'%body': ['body'],
		'%text': ['#text', 'br'],
		'%element': ['#element'],
		'%control': ['img','object','hr','table','button'], //['input','select','textarea','label','br'],
		'%inline': ['span','font','u','i','b','em','strong','big','small','a','sub','sup','span'],//['tt','dfn','code','samp','kbd','var','cite','abbr','acronym','img','object','br','script','map','q','bdo','input','select','textarea','label','button'], 
		'%block': ['p','div','ul','ol','h1','h2','h3','h4','h5','h6','pre','dl','hr','table','button'], //['noscript','blockquote','form','fieldset','address'], !button
		'%paragraph': ['p','li','dd','dt','h1','h2','h3','h4','h5','h6','td','th','div','caption','p'], //!button
		'%wrapper': ['div','ul','ol','dl','pre','xmp','table','button'],
		'%innergroup': ['li','dd','dt','td', 'th'],
		'%outergroup': ['ul','ol','dl','tr','tbody','thead','tfoot','table'],
		'%tablegroup': ['td', 'th','tr','tbody','thead','tfoot','table'],
		'%listgroup': ['li','ul','ol'],
		'%datagroup': ['dd','dt','dl'],
		'%listhead': ['ul','ol']
	};
	
	var __TRANSLATIONS_MAP = {}; //for caching
	for(var _ptrn in __TRANSLATIONS) {
		__TRANSLATIONS_MAP[_ptrn] = {};
		if (__TRANSLATIONS[_ptrn]) {
			$A(__TRANSLATIONS[_ptrn]).each(function(tag){
				__TRANSLATIONS_MAP[_ptrn][tag] = true;
			});
		}
	}
	
	function createMap(patterns) {
		var _map = {};
		var _patterns = patterns.split(",");
		_patterns.each(function(pattern) {
			if(__TRANSLATIONS_MAP[pattern]) {
				for(var _part in __TRANSLATIONS_MAP[pattern]) {
					_map[_part] = true;
				}
			} else {
				_map[pattern] = true;
			}
		});
		return _map;
	}
	
	var Translator = Trex.Class.create({
		initialize: function(patterns) {
			this.patterns = patterns;
			this.map = createMap(patterns);
		},
		hasParts: function() {
			return (this.patterns.length > 0);
		},
		include: function(partPtrn) {
			var _partMap = createMap(partPtrn);
			for(var _part in _partMap) {
				if(this.map[_part]) {
					return true;
				}
			}
			return false;
		},
		memberOf: function(wholePtrn) {
			var _wholeMap = createMap(wholePtrn);
			for(var _part in this.map) {
				if(_wholeMap[_part]) {
					return true;
				}
			}
			return false;
		},
		extract: function(wholePtrn) {
			var _wholeMap = createMap(wholePtrn);
			var _matches = [];
			for(var _part in this.map) {
				if(_wholeMap[_part]) {
					_matches.push(_part);
				}
			}
			return $tom.translate(_matches.join(","));
		},
		getExpression: function() {
			if(!this.exprs) {
				var _exprs = [];
				for(var _part in this.map) {
					_exprs.push(_part);
				}
				this.exprs = _exprs.join(",");
			}
			return this.exprs;
		}
	});
	
	var __TRANSLATOR_CACHES = {}; //for caching	
	Object.extend($tom, {
		translate: function(pattern) {
			if(!__TRANSLATOR_CACHES[pattern]) {
				__TRANSLATOR_CACHES[pattern] = new Translator(pattern);
			}
			return __TRANSLATOR_CACHES[pattern];
		}
	});
	
})();

Object.extend($tom, {
	__POSITION: {
		__START_OF_TEXT: -1,
		__MIDDLE_OF_TEXT: 0,
		__END_OF_TEXT: 1
	}
});
	
Object.extend($tom, {
	isElement: function(node) {
		return $tom.kindOf(node, '%element');
	},
	isBody: function(node) {
		return $tom.kindOf(node, '%body');
	},
	isBlock: function(node) {
		return $tom.kindOf(node, '%block');
	},
	isParagraph: function(node) {
		return $tom.kindOf(node, '%paragraph');
	},
	isInline: function(node) {
		if(this.isText(node)) {
			return true;
		}
		return $tom.kindOf(node, '%inline');
	},
	isText: function(node) {
		return $tom.kindOf(node, '%text');
	},
	isControl: function(node) {
		return $tom.kindOf(node, '%control');
	},
	getName: function(node) {
		return ((node && node.nodeType == 1)? node.nodeName.toLowerCase(): "");
	},
	getLength: function(node) {
		if(!node) {
			return 0;
		}
		if(node.nodeType == 1) {
			return node.childNodes.length;
		} else if(node.nodeType == 3) {
			return node.nodeValue.length;
		}
		return 0; 
	},
	indexOf: function(node){
		if(!node) {
			return -1;
		}
		var _inx = -1;
		var _pNode = node.parentNode;
		var _cNode = _pNode.firstChild;
		while(_cNode) {
			_inx++;
			if(_cNode == node) {
				break;
			}
			_cNode = _cNode.nextSibling;
		}
		return _inx;
	},
	hasContent: function(node) {
		return !(node && node.nodeType == 3 && node.nodeValue.replace(/(^[\n\t\r]*)|([\n\t\r]*$)/g, "") == "");
	},
	hasChildren: function(node) {
		if(!$tom.isElement(node)) {
			return false;
		}
		var _cNode = node.firstChild;
		while(_cNode) {
			if(_cNode.nodeType == 1) {
				if(!$tom.kindOf(_cNode, "br,span.tx_start_marker,span.tx_end_marker")) {
					return true;
				}
			} else if(_cNode.nodeType == 3 && node.nodeValue != "") {
				return true;
			}
			_cNode = _cNode.nextSibling;
		}
		return false;
	}
});	

Object.extend($tom, {
	find: function() {
		var _context, _pattern;
		if(arguments.length == 1) {
			if(typeof (arguments[0]) === "string") {
				_context = document;
				_pattern = arguments[0];
			}
		} else if(arguments.length == 2) {
			if(arguments[0].nodeType && typeof (arguments[1]) === "string") {
				_context = arguments[0];
				_pattern = arguments[1];
			}
		}
		if(!_pattern) {
			return null;
		}
		var _translator = $tom.translate(_pattern);
		return dFindy(_context, _translator.getExpression());
	},
	collect: function() {
		var _context, _pattern;
		if(arguments.length == 1) {
			if(typeof (arguments[0]) === "string") {
				_context = document;
				_pattern = arguments[0];
			}
		} else if(arguments.length == 2) {
			if(arguments[0].nodeType && typeof (arguments[1]) === "string") {
				_context = arguments[0];
				_pattern = arguments[1];
			}
		}
		if(!_pattern) {
			return null;
		}
		var _translator = $tom.translate(_pattern);
		return dGetty(_context, _translator.getExpression());
	},
	collectAll: function() {
		var _context, _pattern;
		if(arguments.length == 1) {
			if(typeof (arguments[0]) === "string") {
				_context = document;
				_pattern = arguments[0];
			}
		} else if(arguments.length == 2) {
			if(arguments[0].nodeType && typeof (arguments[1]) === "string") {
				_context = arguments[0];
				_pattern = arguments[1];
			}
		}
		if(!_pattern) {
			return [];
		}
		var _translator = $tom.translate(_pattern);
		return dGetties(_context, _translator.getExpression());
	}
});	

(function() {
	function makeFilter(pattern) {
		if(pattern) {
			if(typeof(pattern) === 'function') {
				return pattern;
			} else {
				var _translator = $tom.translate(pattern);
				return function(node) {
					if(node.nodeType == 1) {
						if (_translator.include('#element')) {
							return true;
						} else {
							return dChecky(node, _translator.getExpression());
						}
					} else {
						return _translator.include('#text');
					}
				};
			}
		} else {
			return null;
		}
	}
	
	Object.extend($tom, {
		kindOf: function(node, pattern) {
			if(!node || !pattern) {
				return false;
			}
			return makeFilter(pattern)(node);
		},
		/* has filter */
		ancestor: function(descendant, pattern) {
			if(!descendant || !descendant.parentNode) {
				return null;
			}
			var _filter = makeFilter(pattern);
			var _node = descendant.parentNode;
			while(_node) {
				if($tom.isBody(_node)) {
					return null;
				}
				if(!_filter || _filter(_node)) {
					break;
				}
				_node = _node.parentNode;
			}
			return _node;
		}, 
		descendant: function(ancestor, pattern) {
			var _nodes = $tom.descendants(ancestor, pattern, true);
			if(_nodes.length == 0) {
				return null;
			}
			return _nodes[0];
		}, 
		descendants: function(ancestor, pattern, single) {
			single = single || false;
			if(!ancestor || !ancestor.firstChild) {
				return [];
			}
			var _found = false;
			var _filter = makeFilter(pattern);
			var _nodes = [];
			var _gets = function(parent) {
				if(single && _found) {
					return;
				}
				if(!$tom.first(parent)) {
					return;
				}
				var _chilren = $tom.children(parent);
				for(var i=0,len=_chilren.length;i<len;i++) {
					if (!_filter || _filter(_chilren[i])) {
						_nodes.push(_chilren[i]);
						_found = true;
					} else {
						_gets(_chilren[i]);
					}
				}
			}
			_gets(ancestor);
			return _nodes;
		}, 
		children: function(node, pattern) {
			var _nodes = [];
			if(!node || !node.firstChild) {
				return _nodes;
			}
			var _filter = makeFilter(pattern);
			var _node = $tom.first(node);
			while(_node) {
				if (!_filter || _filter(_node)) {
					_nodes.push(_node);
				}
				_node = _node.nextSibling;
			}
			return _nodes;
		},
		next: function(node, pattern) {
			if(!node || !node.nextSibling) {
				return null;
			}
			var _filter = makeFilter(pattern);
			var _node = node.nextSibling;
			while(_node) {
				if($tom.hasContent(_node)) {
					if(!_filter || _filter(_node)) {
						break;
					}
				}
				_node = _node.nextSibling;
			}
			return _node;
		},
		previous: function(node, pattern) {
			if(!node || !node.previousSibling) {
				return null;
			}
			var _filter = makeFilter(pattern);
			var _node = node.previousSibling;
			while(_node) {
				if($tom.hasContent(_node)) {
					if(!_filter || _filter(_node)) {
						break;
					}
				}
				_node = _node.previousSibling;
			}
			return _node;
		},
		first: function(node, pattern) {
			if(!node || !node.firstChild) {
				return null;
			}
			var _filter = makeFilter(pattern);
			var _node = node.firstChild;
			while(_node) {
				if($tom.hasContent(_node)) {
					if(!_filter || _filter(_node)) {
						break;
					}
				}
				_node = _node.nextSibling;
			}
			return _node;
		},
		last: function(node, pattern) {
			if(!node || !node.lastChild) {
				return null;
			}
			var _filter = makeFilter(pattern);
			var _node = node.lastChild;
			while(_node) {
				if($tom.hasContent(_node)) {
					if(!_filter || _filter(_node)) {
						break;
					}
				}
				_node = _node.previousSibling;
			}
			return _node;
		},
		extract: function(parent, child, pattern) {
			var _nodes = [];
			if(!parent || !child) {
				return _nodes;
			}
			var _filter = makeFilter(pattern);
			var _found = false;
			var _node = $tom.first(parent);
			while(_node) {
				if($tom.include(_node, child)) {
					_found = true;
				}
				if(_filter && _filter(_node)) {
					_nodes.push(_node);
				} else {
					if(_found) {
						break;
					} else {
						_nodes = [];
					}
				}
				_node = _node.nextSibling;
			}
			return _nodes;
		}, 
		/* has no filter */
		parent: function(node) {
			if(!node || !node.parentNode) {
				return null;
			}
			return node.parentNode;
		}, 
		body: function(node) {
			if(!node || !node.parentNode) {
				return null;
			}
			var _node = node.parentNode;
			while(_node) {
				if($tom.isBody(_node)) {
					return _node;
				}
				_node = _node.parentNode;
			}
			return null;
		}, 
		top: function(ancestor, all) {
			all = all || false;
			var _node = ancestor;
			
			while($tom.first(_node)) {
				_node = $tom.first(_node);
			}
			
			if(all) {
				return _node;
			} else {
				if ($tom.kindOf(_node, "br,#tx_start_marker,#tx_end_marker")) {
					_node = _node.nextSibling || _node.parentNode;
				} else if($tom.kindOf(_node, '%control')) {
					_node = _node.parentNode;
				}
				return _node;
			}
		}, 
		bottom: function(ancestor, all) {
			all = all || false;
			var _node = ancestor;
			while($tom.last(_node)) {
				_node = $tom.last(_node);
			}
			if (all) {
				return _node;
			} else {
				if ($tom.kindOf(_node, "br,#tx_start_marker,#tx_end_marker")) {
					_node = _node.previousSibling || _node.parentNode;
				} else if ($tom.kindOf(_node, '%control')) {
					_node = _node.parentNode;
				}
				return _node;
			}
		},
		include: function(parent, child) {
			if(!parent || !child) {
				return false;
			}
			if(parent == child) {
				return true;
			}
			var _node = child;
			while (_node) {
				if ($tom.isBody(_node)) {
					return false;
				} else if (_node == parent) {
					return true;
				}
				_node = _node.parentNode;
			}
			return false;
		}
	});
	
})();



Object.extend($tom, {
	insertFirst: function(parent, child) {
		if(!parent || !child) {
			return;
		}
		if (parent.firstChild) {
			parent.insertBefore(child, parent.firstChild);
		} else {
			parent.appendChild(child);
		}
	},
	insertAt: function(source, target) {
		if(!source || !target) {
			return;
		}
		target.parentNode.insertBefore(source, target);
	},
	insertNext: function(source, target) {
		if(!source || !target) {
			return;
		}
		if (target.nextSibling) {
			target.parentNode.insertBefore(source, target.nextSibling);
		} else {
			target.parentNode.appendChild(source);
		}
	},
	append: function(parent, child) {
		if(!parent || !child) {
			return;
		}
		parent.appendChild(child);
	},
	remove: function(node) {
		if(!node) {
			return;
		}
		node.parentNode.removeChild(node);
		node = null;
	}
});	

Object.extend($tom, {	
	moveChild: function(sNode, dNode, sInx, eInx) {
		if(!sNode || !dNode) {
			return;
		}
		sInx = Math.min(Math.max(sInx || 0), sNode.childNodes.length);
		eInx = Math.min(Math.max(eInx || sNode.childNodes.length), sNode.childNodes.length);
		if(sInx >= eInx) {
			return;
		}
		
		var _inx = sInx;
		while (_inx++ < eInx) {
			dNode.appendChild(sNode.childNodes[sInx]);
		}
	},
	moveChildToParent: function(node) {
		if(!node) {
			return;
		}
		while (node.firstChild) {
			node.parentNode.insertBefore(node.firstChild, node);
		}
	}
});

/*
 * Create, Destroy, Change
 */
Object.extend($tom, {
	replace: function(srcNode, destNode) {
		if (!srcNode || !destNode) {
			return null;
		}
		if ($tom.getName(srcNode) === $tom.getName(destNode)) {
			$tom.remove(destNode);
			return srcNode;
		} else {
			$tom.insertAt(destNode, srcNode);
			$tom.moveChild(srcNode, destNode);
			$tom.remove(srcNode);
			return destNode;
		}
	},
	clone: function(node) {
		return node.cloneNode(false);
	}
});
	
/*
 * Wrap, Unwrap
 */
Object.extend($tom, {
	wrap: function(wNode, pNodes) { //NOTE: quote, quotenodesign, textbox actually using 'div', 'blockquote'
		if (!wNode || !pNodes) {
			return null;
		}
		if(!pNodes.length) {
			pNodes = [].concat(pNodes);
		}
		
		$tom.insertAt(wNode, pNodes[0]);
		pNodes.each((function(pNode){
			$tom.append(wNode, pNode);
		}));
		return wNode;
	},
	unwrap: function(node) { 
		if (!node) {
			return null;
		}
		var _nNode = $tom.first(node);
		$tom.moveChildToParent(node);
		$tom.remove(node);
		return _nNode;
	}
});

	
Object.extend($tom, {
	divideText: function(node, offset) {
		if(!$tom.isText(node)) {
			return node;
		}
		if(offset <= 0 || offset >= node.length) { //나눌필요가 있을까?
			return node;
		}
		var _newNode = node.cloneNode(false);
		node.deleteData(offset, node.length);
		_newNode.deleteData(0, offset);
		node.parentNode.insertBefore(_newNode, node.nextSibling);
		return _newNode;
	},
	divideNode: function(node, offset) {
		if(!$tom.isElement(node)) {
			return null;
		}
		/*if(offset <= 0 || offset >= node.childNodes.length) { //나눌필요가 있을까?
			return node;
		}*/
		var _lastOffset = node.childNodes.length - offset;
		var _newNode = node.cloneNode(false);
		for(var i=0;i<_lastOffset;i++) {
			$tom.insertFirst(_newNode, node.lastChild);
		}
		node.parentNode.insertBefore(_newNode, node.nextSibling);
		return _newNode;
	},
	divideParagraph: function(node) {
		var _node = node;
		var _offset = $tom.indexOf(node);
		
		var _divided = _node;
		while (_node) {
			if ($tom.isBody(_node)) {
				break;
			} else if ($tom.kindOf(_node, 'td,th,%wrapper,%outergroup')) {
				break;
			} else if ($tom.kindOf(_node, "br,#tx_start_marker,#tx_end_marker")) {
				_offset = $tom.indexOf(_node);
			} else if($tom.isControl(_node)) {
				_offset = $tom.indexOf(_node);
			} else if ($tom.isText(_node)) { //text
				_node = $tom.divideText(_node, _offset);
				_offset = $tom.indexOf(_node);
			} else { //%inline, %paragraph
				_node = $tom.divideNode(_node, _offset);
				_offset = $tom.indexOf(_node);
				_divided = _node;
				if ($tom.kindOf(_node, 'p,li,dd,dt,h1,h2,h3,h4,h5,h6')) {
					break;
				}
			}
			_node = _node.parentNode;
		}
		return _divided;
	},
	split: function(node, tag) {
		if(!node) {
			return null;
		}
		var _node = node;
		var _nodes = [_node];
		$A(node.getElementsByTagName(tag)).each(function(separator) {
			if($tom.last(_node) != separator) {
				_node = $tom.divideNode(_node, $tom.indexOf(separator) + 1);
				_nodes.push(_node);
			}
		});
		return _nodes;
	}
});

Object.extend($tom, {
	paragraphOf: function(name) {
		if(!name) {
			return 'p';
		}
		var _translator = $tom.translate(name);
		if (_translator.memberOf('ul,ol')) {
			return 'li';
		} else if (_translator.memberOf('dl')) {
			return 'dd';
		} else if (_translator.memberOf('tr,tbody,thead,tfoot,table')) {
			return 'td';
		} else {
			return 'p';
		}
	},
	inlineOf: function(name) {
		if(!name) {
			return 'span';
		}
		var _translator = $tom.translate(name);
		if (_translator.memberOf('ul,ol')) {
			return 'li';
		} else if (_translator.memberOf('dl')) {
			return 'dd';
		} else if (_translator.memberOf('tr,tbody,thead,tfoot,table')) {
			return 'td';
		} else {
			return 'p';
		}
	},
	outerOf: function(name) {
		if(!name) {
			return 'span';
		}
		var _translator = $tom.translate(name);
		if (_translator.memberOf('li')) {
			return 'ol';
		} else if (_translator.memberOf('dd,dt')) {
			return 'dl';
		} else if (_translator.memberOf('td,th,tr')) {
			return 'table';
		} else {
			return 'p';
		}
	}
});
	
(function() {
	var __IGNORE_NAME_FLAG = 0;

	var UnitCalculate = Trex.Class.create({
		$const: {
			__FONT_SIZE_BASIS: 9,
			__REG_EXT_NUMBER: new RegExp("[0-9\.]+"),
			__REG_EXT_UNIT: new RegExp("px|pt|em")
		},
		initialize: function() {
			this.unitConverter = { //NOTE: 1em = 9pt
				"px2em": 1 / 12,
				"px2pt": 9 / 12,
				"em2px": 12 / 1,
				"em2pt": 9 / 1,
				"pt2px": 12 / 9,
				"pt2em": 1 / 9
			};
		},
		calculate: function(strA, strB) {
			if (strA == null || strA.length == 0) {
				strA = "0em";
			}
			if (strB == null || strB.length == 0) {
				strB = "0em";
			}
	
			var _sign = this.extractSign(strB);
			
			var _unitA = this.extractUnit(strA);
			var _unitB = this.extractUnit(strB); //NOTE: basis unit
			
			var _numA = this.extractNumber(strA).toNumber();
			var _numB = this.extractNumber(strB).toNumber();
			if(_unitA != _unitB) { //NOTE: different unit
				if(this.unitConverter[_unitA+"2"+_unitB]) {
					_numA *= this.unitConverter[_unitA+"2"+_unitB];
				}
			}
			var _result = 0;
			if(_sign == "-") {
				_result = Math.max(_numA - _numB, 0);
			} else {
				_result = (_numA + _numB);
			} 
			_result = (Math.round(_result*10)/10);
			if (_result == 0) {
				return null;
			} else {
				return _result + _unitB;
			}
		},
		needCalculation: function(str) {
			if(str == null) {
				return false;
			} else {
				return (str.charAt(0) == '+' || str.charAt(0) == '-');
			}
		},
		extractSign: function(str) {
			var _sign = "+";
			var _match;
			if(str.charAt(0) == '+' || str.charAt(0) == '-') {
				_sign = str.charAt(0);
			}
			return _sign;
		},
		extractNumber: function(str) {
			var _num = 0;
			var _match;
			if((_match = str.match(UnitCalculate.__REG_EXT_NUMBER)) != null) {
				_num = _match[0];
			}
			if(str.indexOf("%") > -1) { //NOTE: %
				_num = _num / 100;
			}
			return _num;
		},
		extractUnit: function(str) {
			var _unit = "em";
			var _match;
			if((_match = str.match(UnitCalculate.__REG_EXT_UNIT)) != null) {
				_unit = _match[0];
			}
			return _unit;
		}
	});
	var _unitCalculator = new UnitCalculate();
	
	var __ATTRIBUTE_TRANSLATIONS = {
	    colspan:   "colSpan",
	    rowspan:   "rowSpan",
	    valign:    "vAlign",
	    datetime:  "dateTime",
	    accesskey: "accessKey",
	    tabindex:  "tabIndex",
	    enctype:   "encType",
	    maxlength: "maxLength",
	    readonly:  "readOnly",
	    longdesc:  "longDesc"
	};
	
	Object.extend($tom, { //TODO:
		applyAttributes: function(node, attributes) {
			if(!$tom.isElement(node)) {
				return;
			}
			for(var _name in attributes) {
				if(_name == "style") {
					$tom.applyStyles(node, attributes[_name]);
				} else {
					$tom.setAttribute(node, _name, attributes[_name]);
				}
			}
		},
		removeAttributes: function(node, attributes) {
			if(!$tom.isElement(node)) {
				return;
			}
			for(var _name in attributes) {
				if(_name == "style") {
					$tom.removeStyles(attributes[_name])
				} else {
					node.removeAttribute(_name, __IGNORE_NAME_FLAG);
				}
			}
		},
		existAttributes: function(node, attributes) {
			if(!$tom.isElement(node)) {
				return false;
			}
			var _attrValue;
			for(var _name in attributes) {
				if(_name == "style") {
					for(var _style in attributes[_name]) {
						_attrValue = node.style[_style];
						return (_attrValue != null && _attrValue.length > 0);
					}
				} else {
					_attrValue = node[_name];
					return (_attrValue != null && _attrValue.length > 0);
				}
			}
			return false;
		},
		getAttribute: function(node, attrName) {
			if(!$tom.isElement(node)) {
				return null;
			}
			if(node && node.getAttribute) {
				return node.getAttribute(__ATTRIBUTE_TRANSLATIONS[attrName] || attrName);
			} else {
				return null;
			}
		},
		setAttribute: function(node, attrName, attrValue) {
			if(!$tom.isElement(node)) {
				return;
			}
			if(attrValue == null || attrValue.length == 0 || attrValue == 0) {
				node.removeAttribute(attrName, __IGNORE_NAME_FLAG);
			} else {
				try {
					node[attrName] = attrValue;
				} catch(e) {
					node.setAttribute(__ATTRIBUTE_TRANSLATIONS[attrName] || attrName, attrValue);
				}
			}
		},
		applyStyles: function(node, styles) {
			var _styleValue;
			for(var _name in styles) {
				if(_unitCalculator.needCalculation(styles[_name])) {
					_styleValue = _unitCalculator.calculate(node.style[_name], styles[_name]);
				} else {
					_styleValue = styles[_name];
				}
				if(_styleValue == null || _styleValue.length == 0) {
					_styleValue = null;
				}
				node.style[((_name == 'float')? ((node.style.styleFloat === undefined)? 'cssFloat': 'styleFloat'): _name)] = _styleValue;
			}
			var _attrValue = $tom.getAttribute(node, "style");
			if(_attrValue == null) { //NOTE: remove needless style 
				node.removeAttribute("style", __IGNORE_NAME_FLAG);
			}
		},
		removeStyles: function(node, styles) {
			for(var _name in styles) {
				node.style[((_name == 'float')? ((node.style.styleFloat === undefined)? 'cssFloat': 'styleFloat'): _name)] = null;
			}
			var _attrValue = $tom.getAttribute(node, "style");
			if(_attrValue == null) { //NOTE: remove needless style 
				node.removeAttribute("style", __IGNORE_NAME_FLAG);
			}
		}
	});
})();


Object.extend($tom, { 
	goInto: function(node, toTop) {
		if(!node || !node.scrollIntoView) {
			return;
		}
		node.scrollIntoView(toTop);
	},
	getScrollTop: function(doc) {
		if(!doc) {
			return 0;
		}
		return (doc.documentElement.scrollTop || doc.body.scrollTop);
	},
	setScrollTop: function(doc, scrollTop) {
		if(!doc) {
			return;
		}
		if(doc.documentElement.scrollTop) {
			doc.documentElement.scrollTop = scrollTop;
		} else {
			doc.body.scrollTop = scrollTop;
		}
	},
	getScrollLeft: function(doc) {
		if(!doc) {
			return 0;
		}
		return (doc.documentElement.scrollLeft || doc.body.scrollLeft);
	},
	setScrollLeft: function(doc, scrollLeft) {
		if(!doc) {
			return;
		}
		if(doc.documentElement.scrollLeft) {
			doc.documentElement.scrollLeft = scrollLeft;
		} else {
			doc.body.scrollLeft = scrollLeft;
		}
	},
	getPosition: function(element, cumulative) {
		if(!element) {
			return {
				x: 0,
				y: 0,
				width: 0,
				height: 0
			};
		}
		cumulative = !!cumulative;
		element = $tx(element);
		var pos = (cumulative)? $tx.cumulativeOffset(element): $tx.positionedOffset(element);
		var dim;
		var display = element.style.display;
		if (display != 'none' && display != null) { // Safari bug
			dim = {
				width: element.offsetWidth,
				height: element.offsetHeight
			};
		} else {
			var els = element.style;
			var originalVisibility = els.visibility;
			var originalPosition = els.position;
			var originalDisplay = els.display;
			els.visibility = 'hidden';
			els.position = 'absolute';
			els.display = 'block';
			var originalWidth = element.clientWidth;
			var originalHeight = element.clientHeight;
			els.display = originalDisplay;
			els.position = originalPosition;
			els.visibility = originalVisibility;
			dim = {
				width: originalWidth,
				height: originalHeight
			};
		}
		return {
			x: pos[0],
			y: pos[1],
			width: dim.width,
			height: dim.height
		};
	},
	getWidth: function(node) {
		return (node.style["width"] || node.offsetWidth).parsePx();
	},
	setWidth: function(node, width) {
		$tom.applyStyles(node, {
			'width': width
		});
	},
	getHeight: function(node) {
		return (node.style["height"] || node.offsetHeight).parsePx();
	},
	setHeight: function(node, height) {
		$tom.applyStyles(node, {
			'height': height
		});
	},
	replacePngPath: function(node) {
		if ($tx.msie && $tx.msie_ver < 7) {
			if(document.location.href.indexOf("http://") > -1) {
				return;
			}
			try {
				var _orgFilter = $tx.getStyle(node, 'filter');
				var _orgSrc = /src='([^']+)'/.exec(_orgFilter)[1];
				if(!_orgSrc || _orgSrc == 'none') {
					return;
				} else if(_orgSrc.indexOf("http://") > -1) {
					return;
				}
				
				var _docPathSlices = document.location.href.split("/");
				_docPathSlices.push("css");
				_docPathSlices.pop();
				_orgSrc = _orgSrc.replace(/\.\.\//g, function(full) {
					_docPathSlices.pop();
					return "";
				});
				
				var _newSrc = _docPathSlices.join("/") + "/" + _orgSrc;
				node.style.filter = _orgFilter.replace(/src='([^']+)'/, "src='" + _newSrc + "'");
			} catch(e) {alert(e)}
		}
	}
});
