/**
 * @fileoverview 
 * 여러 스타일의 구분선을 삽입할 때 쓰이는 menu를 포함하는 Tool인 '구분선' Icon Source,
 * Class Trex.Tool.HorizontalRule과 configuration을 포함    
 *     
 */
TrexConfig.addTool(
	"horizontalrule",
	{
		wysiwygonly: true,
		sync: false,
		status: true,
		top: null,
		left: null,
		options: [{	data: 'tx-hr-border-1', 
			image: '#iconpath/line01.gif?rv=1.0.2', 
			divstyle: { },
			hrstyle: { height: "1px", borderWidth: "1px 0px 0px 0px",	borderColor: "black", display: "block"	}
		},
		{	data: 'tx-hr-border-2',
			image: '#iconpath/line02.gif?rv=1.0.2',
			divstyle: { },
			hrstyle: { height: "7px", border: "0px none",	borderTop: "1px solid black",	borderBottom: "3px solid black",borderColor: "black", display: "block"	}
		},
		{	data: 'tx-hr-border-3',
			image: '#iconpath/line04.gif?rv=1.0.2', 
			divstyle: { },
			hrstyle: { height: "1px", border: "0px none",	borderTop: "1px dotted black",borderColor: "black", display: "block"	}
		},
		{	data: 'tx-hr-image-1',
			image: '#iconpath/line03.gif?rv=1.0.2',
			divstyle: {border: "0pt none", height: "15px", background: "url(#decopath/line03.gif?rv=1.0.1) repeat-x scroll left", width: "99%" },
			hrstyle: { position:"relative", top: "-999px", left: "-999px", border: "0pt none"	}
		},
		{	data: 'tx-hr-image-2',
			image: '#iconpath/line05.gif?rv=1.0.2',
			divstyle: {border: "0pt none", height: "15px", background: "url(#decopath/line05.gif?rv=1.0.1) repeat-x scroll left", width: "99%" },
			hrstyle: { position:"relative", top: "-999px", left: "-999px", border: "0pt none"	}
		},
		{	data: 'tx-hr-image-3',
			image: '#iconpath/line06.gif?rv=1.0.2',
			divstyle: {border: "0pt none", height: "15px", background: "url(#decopath/line06.gif?rv=1.0.1) repeat-x scroll left", width: "99%" },
			hrstyle: { position:"relative", top: "-999px", left: "-999px", border: "0pt none"	}
		},
		{	data: 'tx-hr-image-4',
			image: '#iconpath/line07.gif?rv=1.0.2',
			divstyle: {border: "0pt none", height: "15px", background: "url(#decopath/line08.gif?rv=1.0.1) repeat-x scroll left", width: "99%" },
			hrstyle: { position:"relative", top: "-999px", left: "-999px", border: "0pt none"	}
		}]
	},
	function(root){
		var _config = TrexConfig.getTool("horizontalrule", root);
		_config.options.each(function(option) {
			option.image = TrexConfig.getIconPath(option.image, "horizontalrule"); 
			if(option.divstyle && option.divstyle.background) {
				option.divstyle.background = TrexConfig.getDecoPath(option.divstyle.background, "horizontalrule");
			}
		});
	}
);

Trex.Tool.HorizontalRule = Trex.Class.create({
	$const: {
		__Identity: 'horizontalrule'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
			var _canvas = this.canvas;

			var map = {};
			config.options.each(function(option) {
				map[option.data] = {
					divstyle: option.divstyle,
					hrstyle: option.hrstyle
				};
			});

			var _toolHandler = function(data) {
				if(!map[data]) {
					return;
				}
				var _item = map[data];
				if (_canvas.canHTML()) {
					_canvas.execute(function(processor){
						var _node = processor.win.div({ 'style': _item.divstyle },
								 processor.win.hr({ 'style': _item.hrstyle })
							);
						processor.pasteNode(_node, true);
					});
				} else {
					_canvas.execute(function(processor) {
						var _tag;
						if (_type == 'image') {
							_tag = '<div class="' + data +'"><hr class="hide"></div>'; 
						} else if (_type == 'border') {
							_tag = '<div><hr class="tx-hr-border-1" align="left"></div>'; 	
						}
						processor.insertTag('',_tag);
					});
				}	
			};

			/* button & menu weave */
			this.weave.bind(this)(
				/* button */
				new Trex.Button(this.buttonCfg),
				/* menu */
				new Trex.Menu.List(this.menuCfg),
				/* handler */
				_toolHandler
			);

			var _popdownHandler = this.button.onClick.bindAsEventListener(this.button);
			_canvas.observeKey({ // alt + - 
				ctrlKey: false,
				altKey: true,
				shiftKey: false,
				keyCode: ($tx.msie? 189: 109)
			}, _popdownHandler);
		}
	
});
