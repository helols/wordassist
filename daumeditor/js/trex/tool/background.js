TrexConfig.addTool(
	"background", 
	{
		wysiwygonly: true,
		sync: false,
		status: true,
		thumbs: Trex.__CONFIG_COMMON.thumbs
	}
);
Trex.Tool.Background = Trex.Class.create({
	$const: {
		__Identity: 'background'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
		var _canvas = this.canvas;

		var _toolHandler = function(color) {
			_canvas.addStyle({
				backgroundColor: color
			});
		};

		/* button & menu weave */
		this.weave.bind(this)(
			/* button */
			new Trex.Button(this.buttonCfg),
			/* menu */
			new Trex.Menu.ColorPallete(this.menuCfg),
			/* handler */
			_toolHandler
		);

		//저장, 로드할때 content 수정
		_canvas.getBgColor = function() {
			return Trex.Color.getHexColor(_canvas.getStyle("backgroundColor"));
		};
	}
});
