/**
 * @fileoverview 
 * 설정에서 지정된 여러 글꼴들을 선택할 수 있는 메뉴를 포함하는 tool인 '글꼴' Icon을 위한 source로, 
 * 필요한 configuration과 Class Trex.Tool.FontFamily을/를 포함    
 * 
 *   
 */

TrexConfig.addTool(
	"fontfamily", 
	{
		sync: true,
		status: true,
		options: [
			{ label: ' 굴림  <span class="tx-txt">(가나다라)</span>', title: '굴림', data: 'Gulim,굴림', klass: 'tx-gulim' },
			{ label: ' 바탕 <span class="tx-txt">(가나다라)</span>', title: '바탕', data: 'Batang,바탕', klass: 'tx-batang' },
			{ label: ' 돋움 <span class="tx-txt">(가나다라)</span>', title: '돋움', data: 'Dotum,돋움', klass: 'tx-dotum' },
			{ label: ' 궁서 <span class="tx-txt">(가나다라)</span>', title: '궁서', data: 'Gungsuh,궁서', klass: 'tx-gungseo' },
			{ label: ' Arial <span class="tx-txt">(abcde)</span>', title: 'Arial', data: 'Arial', klass: 'tx-arial' },
			{ label: ' Verdana <span class="tx-txt">(abcde)</span>', title: 'Verdana', data: 'Verdana', klass: 'tx-verdana' }
		]
	}
);

Trex.Tool.FontFamily = Trex.Class.create({
	$const: {
		__Identity: 'fontfamily'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
		var _tool = this;
		var _canvas = this.canvas;
		
		var _defaultProperty = _canvas.getStyleConfig().fontFamily;
		var _webfonts = ((config.webfont && config.webfont.use)? config.webfont.options: []);
		if(!$tx.msie) {
			_webfonts.each(function(webfont) {
				webfont.expired = true;
			});
		}
		var _optionz = (config.options || []).concat(_webfonts);
		
		var _map = {};
		_optionz.each(function(option) {
			var fontArr = option.data.split(",");
			for( var i = 0; i < fontArr.length; i++){
				_map[fontArr[i].toLowerCase()] = option.title;	
			}
			
		});
		_optionz.each(function(option) {
			if (!_map[option.title.toLowerCase()]) {
				_map[option.title.toLowerCase()] = option.title;
			}
		});
		
		var _getTextByValue = function(value) {
			if(_map[value.toLowerCase()]) {
				return _map[value.toLowerCase()];
			} else {
				value = value.replace("_9", "").replace("9", "");
				if (_map[value.toLowerCase()]) {
					return _map[value.toLowerCase()];
				} else {
					return _map[_defaultProperty];
				}
			}
		};
		
		var _toolHandler = function(data) {
			_canvas.includeWebfontCss( "font-family: " + data );
			_canvas.execute(function(processor) {
				var _nodes = processor.inlines(function(type) {
					if(type === 'control') {
						return 'img,hr,table';
					}
					return '%text,span,font';
				});
				_nodes.each(function(node) { //clean tag
					$tom.descendants(node, '%inline').each(function(inNode) {
						$tom.applyAttributes(inNode, {
							'style': { 'fontFamily': null },
							'face': null
						});
					});
				});
				processor.apply(_nodes, { 
					'style': { 'fontFamily': data },
					'face': null	
				});
			});
		};

		/* button & menu weave */
		this.weave.bind(this)(
			/* button */
			new Trex.Button.Select(TrexConfig.merge(this.buttonCfg, {
				selectedValue: _defaultProperty,
				selectedText: _getTextByValue(_defaultProperty)
			})),
			/* menu */
			new Trex.Menu.Select(TrexConfig.merge(this.menuCfg, {
				options: _optionz
			})),
			/* handler */
			_toolHandler
		);

		_canvas.observeJob(Trex.Ev.__CANVAS_PANEL_QUERY_STATUS, function() {
			var _data = _canvas.query(function(processor) {
				var _node = processor.findNode('%inline');
				return processor.queryStyle(_node, 'fontFamily');
			});
			
			if(_data == null) { 
				_data = _canvas.query(function(processor) {
					var _node = processor.findNode('%inline');
					return processor.queryAttr('face');
				});
			}
			_data = _data || _defaultProperty;
			try{
				var _dataArr = _data.split(",");
				var _text = "";
				for( var i = 0; i < _dataArr.length; i++ ){
					var _text = _text || _getTextByValue(_dataArr[i]);
				}
				_tool.button.setText(_text);
			}catch(e){ }
		});
	}
	
});
