/**
 * @fileoverview 
 * 글자색을 변경하기 위해 쓰이는 '글자색' Icon을 위해 필요한 source, 
 * Class Trex.Tool.ForeColor 와 configuration을 포함    
 *  
 */
TrexConfig.addTool(
	"forecolor",
	{ 
		defaultcolor: "#7c84ef",
		wysiwygonly: true,
		sync: false,
		status: true,
		thumbs: Trex.__CONFIG_COMMON.thumbs,
		needRevert: true
	}
);

Trex.Tool.ForeColor = Trex.Class.create({
	$const: {
		__Identity: 'forecolor'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
		var _tool = this; 
		var _canvas = this.canvas;
		
		var _revertForeColor = _canvas.getStyleConfig('color');
		var _toolHandler = function(color) {
			if (_canvas.canHTML()) {
				_canvas.execute(function(processor) {
					if (color == null) {
						processor.execCommand('forecolor', (($tx.msie)? null: _revertForeColor));
					} else {
						processor.execCommand('forecolor', color);
					}
				});	
			} else {
				_canvas.execute(function(processor) {
					processor.insertTag('<span style="color: ' +color+';" >','</span>');
				});
			}
			if(color) {
				$tx.setStyle( _tool.button.elButton, {'backgroundColor': color});
			}
		};

		/* button & menu weave */
		this.weave.bind(this)(
			/* button */
			new Trex.Button.Splits(TrexConfig.merge(this.buttonCfg, {
				selectedValue: config.defaultcolor
			})),
			/* menu */
			new Trex.Menu.ColorPallete(this.menuCfg),
			/* handler */
			_toolHandler
		);
		if(config.defaultcolor) {
			$tx.setStyle( _tool.button.elButton, {'backgroundColor': config.defaultcolor});
		}
	}
	
});
