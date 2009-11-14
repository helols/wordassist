/**
 * @fileoverview 
 * Toolbar의 AlignCenter Icon을 위해 필요한 configuration과 Class Trex.Tool.AlignCentrer를 포함    
 * 
 */
TrexConfig.addTool(
	"aligncenter",
	{
		sync: true,
		status: true,
		radio: true
	}
);

Trex.Tool.AlignCenter = Trex.Class.create({
	$const: {
		__Identity: 'aligncenter'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
		var _self = this;
		
		/*
		 * Text : align center
		 * Image : float none + align center
		 */
		var __TextAlignProperty = "center";
		var __ImageFloatProperty = 'none';
		var __ImageClearProperty = 'none';
		var __RadioGroup = ["left", "center", "right", "full"];
		var __SelectedRadio = "center";
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
						_toolbar.fireJobs(Trex.Ev.__CMD_ALIGN_IMG_CENTER, _node);
					} 
				}  else {
					if (processor.hasControl()) {
						var _nodes = processor.controls(function() {
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
					_toolbar.fireJobs(Trex.Ev.__CMD_ALIGN_CENTER);
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
			
			if (_self.imageAlignMode) {
				if (_canvas.config.newlinepolicy == "br") {
					var _data = _canvas.query(function(processor){
						var _node = processor.getControl();
						if ($tx.hasClassName(_node, "txc-image-c")) {
							return true;
						} else {
							return false;
						}
					});
					_self.button.setState(_data);
				}else{
					if (_data == __TextAlignProperty) {
						 _data = _canvas.query(function(processor){
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
		
		_canvas.observeKey({ // ctrl + .
			ctrlKey: true,
			altKey: false,
			shiftKey: false,
			keyCode: 190
		}, _toolHandler);
		
		Trex.Tool.AlignCenter.__ImageStyle = {
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