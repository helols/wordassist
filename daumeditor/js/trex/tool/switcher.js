/**
 * @fileoverview 
 *  wysiwyg, source, text 세모드로의 변경을 가능하게하는 dropdown 형식의 tool 'Switcher' Source,
 * Class Trex.Tool.Switcher 와 configuration을 포함    
 *     
 */
TrexConfig.addTool(
	"switcher", 
	{
		wysiwygonly: false,
		status: true,
		options: [
			{ label: '에디터', title: "에디터", data: 'html' }, 
			{ label: 'HTML', title: "HTML", data: 'source' },
			{ label: '텍스트', title: "텍스트", data: 'text' }
		]
	}
);

Trex.Tool.Switcher = Trex.Class.create({
	$const: {
		__Identity: 'switcher'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
			var _canvas = this.canvas;

			var _map = {};
			config.options.each(function(option) {
				_map[option.data] = {
					title: option.title
				};
			});
			
			var _cachedProperty = "";
			var _toolHandler = function(data) {
				_canvas.changeMode(data);
			};
			
			var _changeMode = function(from, to) {
				if(from == to) return;
				if(_cachedProperty == to) {
					return;
				}
				if(!_map[to]) {
					return;
				}
				this.button.setValue(to);
				this.button.setText(_map[to].title);
				_cachedProperty = to; //NOTE: Cuz modify -> switcher sync
			}.bind(this);
			
			_canvas.observeJob(Trex.Ev.__CANVAS_MODE_CHANGE, _changeMode);
			_canvas.observeJob(Trex.Ev.__CANVAS_MODE_INITIALIZE, _changeMode);

			/* button & menu weave */
			this.weave.bind(this)(
				/* button */
				new Trex.Button.Select(this.buttonCfg),
				/* menu */
				new Trex.Menu.Select(this.menuCfg),
				/* handler */
				_toolHandler
			);
		}
	
});
