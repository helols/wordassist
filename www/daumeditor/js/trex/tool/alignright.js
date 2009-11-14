/**
 * @fileoverview 
 * Toolbar의 AlignRight Icon을 위해 필요한 configuration과 Class Trex.Tool.AlignRight을/를 포함    
 * 
 */
TrexConfig.addTool(
	"alignright",
	{
		sync: true,
		status: true,
		radio: true
	}
);

Trex.Tool.AlignRight = Trex.Class.create({
	$const: {
		__Identity: 'alignright'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
		var _self = this;
		
		/*
		 * Text : align right
		 * Image : float left
		 */
		var __TextAlignProperty = "right";
		var __ImageFloatProperty = 'left';
		var __ImageClearProperty = 'both';
		var __ImageMarginProperty = "8px";
		var __ImageNoMarginProperty = "";
		var __RadioGroup = ["left", "center", "right", "full"];
		var __SelectedRadio = "right";
		
		var _toolbar = this.toolbar;
		var _canvas = this.canvas;

		_self.imageAlignMode = false;
		var _toolHandler = function() {
			__RadioGroup.each(function(radio) {
				if (__SelectedRadio != radio && _toolbar.tools['align' + radio]) {
					_toolbar.tools['align' + radio].button.normalState();
				} 
			});
			_canvas.execute(function(processor) {
				if (_self.imageAlignMode) {
					var _node = processor.getControl();
					if(_node) {
						processor.apply(_node, {
							'style': {
								'clear': __ImageClearProperty,
								'float': __ImageFloatProperty
							}
						});
						_toolbar.fireJobs(Trex.Ev.__CMD_ALIGN_IMG_FLOAT_LEFT, _node);
					} 
				} else {
					if (processor.hasControl()) {
						var _nodes = processor.controls(function(){
							return 'hr,table';
						});
						processor.apply(_nodes, {
							'align': __TextAlignProperty
						});
					} else {
						var _nodes = processor.blocks(function() {
							return '%paragraph';
						});
						processor.apply(_nodes, {
							'align': null,
							'style': {
								'textAlign': __TextAlignProperty
							}
						});
					}
					_toolbar.fireJobs(Trex.Ev.__CMD_ALIGN_RIGHT);
				}
			});
		};

		/* button & menu weave */
		this.weave.bind(this)(
			/* button */
			new Trex.Button(this.buttonCfg),
			/* menu */
			null,
			/* handler */
			_toolHandler);
		
		_canvas.observeJob(Trex.Ev.__CANVAS_PANEL_QUERY_STATUS, function() {
			if(_self.imageAlignMode) {
				var _data = _canvas.query(function(processor) {
					var _node = processor.getControl();
					if (_node) {
						return processor.queryStyle(_node, 'float');
					} else {
						return null;
					}
				});
				_self.button.setState(_data == __ImageFloatProperty);
			} else {
				var _data = _canvas.query(function(processor) {
					var _node = processor.findNode('%paragraph');
					var _value = processor.queryStyle(_node, 'textAlign');
					if(!_value) {
						_value = processor.queryAttr(_node, 'align');
					}
					return _value;
				});
				_self.button.setState(_data == __TextAlignProperty);
			}
		});
		
		_canvas.observeKey({ // ctrl + /
			ctrlKey: true,
			altKey: false,
			shiftKey: false,
			keyCode: 191
		}, _toolHandler);
		
		Trex.Tool.AlignRight.__ImageStyle = {
			'paragraph': {},
			'image': {
				'clear': __ImageClearProperty,
				'float': __ImageFloatProperty,
				'marginLeft': __ImageNoMarginProperty,
				'marginRight': __ImageMarginProperty
			}
		};
	}
});