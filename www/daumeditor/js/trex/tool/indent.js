/**
 * @fileoverview 
 * '들여쓰기' Icon Source,
 * Class Trex.Tool.Indent configuration을 포함    
 *     
 */
TrexConfig.addTool(
	"indent",
	{
		sync: false,
		status: false
	}
);


Trex.Tool.Indent = Trex.Class.create({
	$const: {
		__Identity: 'indent'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
		var _canvas = this.canvas;

		var _emGap = 4;
		
		var _toolHandler = function() {
			_canvas.execute(function(processor) {
				_indentParagraph(processor);
			});
		};

		/* button & menu weave */
		this.weave.bind(this)(
			/* button */
			new Trex.Button(this.buttonCfg),
			/* menu */
			null,
			/* handler */
			_toolHandler
		);
			
		var _keyHandler = function() {
			_canvas.execute(function(processor) {
				if (processor.isCollapsed()) {
					var _textPos = processor.compareTextPos();
					if (_textPos == $tom.__POSITION.__MIDDLE_OF_TEXT) {
						_appendPadding(processor);
						return;
					} else if(_textPos == $tom.__POSITION.__END_OF_TEXT) {
						if (processor.findNode('td')) {
							_goNextCell(processor);
							return;
						}
					}
					
				}
				_indentParagraph(processor);
			});
		};
		_canvas.observeKey({ // tab - 들여쓰기
			ctrlKey: false,
			altKey: false,
			shiftKey: false,
			keyCode: 9
		}, _keyHandler);
		
		/* actions */
		var _indentParagraph = function(processor) {
			var _nodes = processor.blocks(function(type) {
				return 'li,p';
			});
			processor.indent(_nodes, {
				'style': {
					'marginLeft': "+" + _emGap + "em"
				}
			});
		};
		var _appendPadding = function(processor) {
			processor.pasteContent("&nbsp;&nbsp;&nbsp;&nbsp;", false);
		};
		
		var _goNextCell = function(processor) {
			var _cNode = processor.findNode('td');
			var _tNode = $tom.ancestor(_cNode, 'table');
			var _allNodes = $tom.collectAll(_tNode, 'td');
			while(_allNodes.length > 0) {
				if(_cNode == _allNodes.shift()) {
					break;
				}
			}
			if(_allNodes.length > 0) {
				processor.bookmarkInto(_allNodes[0]);
			} else {
				processor.bookmarkToNext(_tNode);
			}
		};
	}
});