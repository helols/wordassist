/**
 * @fileoverview 
 * Toolbar의 AlignFull Icon을 위해 필요한 configuration과 Class Trex.Tool.AlignFull을 포함    
 * 
 */
TrexConfig.addTool(
	"alignfull",
	{
		sync: true,
		status: true,
		radio: true
	}
);

Trex.Tool.AlignFull = Trex.Class.create({
	$const: {
		__Identity: 'alignfull'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
		var _self = this;
		
		/*
		 * Text : align full
		 * Image : float right
		 */
		var __TextAlignProperty = "justify";
		var __ImageFloatProperty = 'right';
		var __ImageClearProperty = 'both';
		var __ImageMarginProperty = "8px";
		var __ImageNoMarginProperty = "";
		var __RadioGroup = ["left", "center", "right", "full"];
		var __SelectedRadio = "full";
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
								'float': __ImageFloatProperty,
								'marginLeft': __ImageNoMarginProperty,
								'marginRight': __ImageMarginProperty
							}
						});
						_toolbar.fireJobs(Trex.Ev.__CMD_ALIGN_IMG_FLOAT_RIGHT, _node);
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
						var _nodes = processor.blocks(function(){
							return '%paragraph';
						});
						processor.apply(_nodes, {
							'align': null,
							'style': {
								'textAlign': __TextAlignProperty
							}
						});
					}
					_toolbar.fireJobs(Trex.Ev.__CMD_ALIGN_FULL);
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
		
		Trex.Tool.AlignFull.__ImageStyle = {
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