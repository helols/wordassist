/**
 * @fileoverview 
 * Tool '내어쓰기' Source,
 * Class Trex.Tool.Outdent 와 configuration을 포함    
 *     
 */
TrexConfig.addTool(
	"outdent",
	{
		sync: false,
		status: false
	}
);

Trex.Tool.Outdent = Trex.Class.create({
	$const: {
		__Identity: 'outdent'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
		var _canvas = this.canvas;
		
		var _emGap = 4;
		var _toolHandler = function() {
			_canvas.execute(function(processor) {
				_outdentParagraph(processor);
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
					if(_textPos == $tom.__POSITION.__START_OF_TEXT) {
						if (processor.findNode('td')) {
							_goPreviousCell(processor);
							return;
						}
					}
					
				}
				_outdentParagraph(processor);
			});
		};
		_canvas.observeKey({ // shift + tab - 들여쓰기
			ctrlKey: false,
			altKey: false,
			shiftKey: true,
			keyCode: 9
		}, _keyHandler);
		
		/* actions */
		var _outdentParagraph = function(processor) {
			var _nodes = processor.blocks(function(type) {
				return 'li,p';
			});
			processor.outdent(_nodes, {
				'style': {
					'marginLeft': "-" + _emGap + "em"
				}
			});
		};
		
		var _goPreviousCell = function(processor) {
			var _cNode = processor.findNode('td,th');
			var _tNode = $tom.ancestor(_cNode, 'table');
			var _allNodes = $tom.collectAll(_tNode, 'td,th');
			while(_allNodes.length > 0) {
				if(_cNode == _allNodes.pop()) {
					break;
				}
			}
			if(_allNodes.length > 0) {
				processor.bookmarkInto(_allNodes[_allNodes.length - 1]);
			} else {
				processor.bookmarkToPrevious(_tNode);
			}
		};
	}
});
