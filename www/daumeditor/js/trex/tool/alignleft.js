/**
 * @fileoverview 
 * Toolbar의 AlignLeft Icon을 위해 필요한 configuration과 Class Trex.Tool.AlignLeft을/를 포함    
 * 
 */
TrexConfig.addTool(
	"alignleft",
	{
		sync: true,
		status: true,
		radio: true
	}
);

Trex.Tool.AlignLeft = Trex.Class.create({
	$const: {
		__Identity: 'alignleft'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
		var _self = this;
		
		/*
		 * Text : align left
		 * Image : float none + align left
		 */
		var __TextAlignProperty = "left";
		var __ImageFloatProperty = 'none';
		var __ImageClearProperty = 'none';
		var __RadioGroup = ["left", "center", "right", "full"];
		var __SelectedRadio = "left";
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
					if (_node) {
						processor.apply(_node, {
							'style': {
								'clear': __ImageClearProperty,
								'float': __ImageFloatProperty,
								'marginLeft': "",
								'marginRight': ""
							}
						});
						var _wNode = $tom.find(_node, "%paragraph");
						processor.apply(_wNode, {
							'align': null,
							'style': {
								'textAlign': __TextAlignProperty
							}
						});
						_toolbar.fireJobs(Trex.Ev.__CMD_ALIGN_IMG_LEFT, _node);
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
					_toolbar.fireJobs(Trex.Ev.__CMD_ALIGN_LEFT);
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
			var _data = _canvas.query(function(processor) {
				var _node = processor.findNode('%paragraph');
				var _value = processor.queryStyle(_node, 'textAlign');
				if(!_value) {
					_value = processor.queryAttr(_node, 'align');
				}
				return _value;
			});
						
			if(_data == null || _data == "start") { //NOTE: start is default of ff
				_data = __TextAlignProperty;
			}
			
			if(_self.imageAlignMode) {
				if (_canvas.config.newlinepolicy == "br") {
					var _data = _canvas.query(function(processor){
						var _node = processor.getControl();
						if ($tx.hasClassName(_node, "txc-image-l")) {
							return true;
						} else {
							return false;
						}
					});
					_self.button.setState(_data);
				}else{
					if (_data == __TextAlignProperty) {
						var _data = _canvas.query(function(processor){
							var _node = processor.getControl();
							if (_node) {
								var _float = processor.queryStyle(_node, 'float');
								if(_float == null || _float == "" || _float == "none") {
									return 'none';
								} else {
									return _float;
								}
							} else {
								return 'none';
							}
						});
						_self.button.setState(_data == __ImageFloatProperty);
					} else {
						_self.button.setState(false);
					}						
				}
			} else {
				_self.button.setState(_data == __TextAlignProperty); 
			}
		});
		
		_canvas.observeKey({ // ctrl + ,
			ctrlKey: true,
			altKey: false,
			shiftKey: false,
			keyCode: 188
		}, _toolHandler);
		
		Trex.Tool.AlignLeft.__ImageStyle = {
			'paragraph': {
				'textAlign': __TextAlignProperty
			},
			'image': {
				'clear': __ImageClearProperty,
				'float': __ImageFloatProperty,
				'marginLeft': "",
				'marginRight': ""
			}
		};
	}
});