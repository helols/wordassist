
TrexConfig.addTool(
	"fullscreen", 
	{
		wysiwygonly: false,
		status: false
	}
);
Trex.Tool.FullScreen = Trex.Class.create({
	$const: {
		__Identity: 'fullscreen'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
		var _editor = this.editor;
		
		var _toolHandler = function() {
			_editor.getPlugin("fullscreen").execute();
		};
		
		this.weave.bind(this)(
			new Trex.Button(this.buttonCfg), 
			null,
			_toolHandler
		);
		
		this.canvas.observeKey({ // ctrl + m - 넓게쓰기
			ctrlKey: true,
			altKey: false,
			shiftKey: false,
			keyCode: 77
		}, _toolHandler);

		_editor.observeKey({ // ctrl + m - 넓게쓰기
			ctrlKey: true,
			altKey: false,
			shiftKey: false,
			keyCode: 77
		}, _toolHandler);
	}
});

TrexConfig.addPlugin('fullscreen',
	{
		switched: false,
		minHeight: 200,
		minWidth: 766
	}
);

Trex.Plugin.FullScreen = Trex.Class.create({
	$const: {
		__Identity: 'fullscreen'
	},
	$mixins: [
		Trex.I.JobObservable
	],
	initialize: function(editor, config) {
			if(!editor) {
				return;
			}
			
			this.isInit = false;
			this.isFullScreen = false;

			this.showFullScreenAtService = function() { //NOTE: service specific job for fullscreen(callback)
				if(typeof(showFullScreen) != 'undefined') {
					showFullScreen();
				}
			};
			this.showNormalScreenAtService = function() { //NOTE: service specific job for escaping from fullscreen(callback)
				if(typeof(showNormalScreen) != 'undefined') {
					showNormalScreen();
				}
			};
			this.resizeScreenAtService = function() { //NOTE: service specific job for resize(callback)
				if(typeof(resizeScreen) != 'undefined') {
					resizeScreen();
				}
			};

			this.wrapper = editor.getWrapper();
			this.canvas = editor.getCanvas();
			this.toolbar = editor.getToolbar();
			this.attachBox = editor.getAttachBox();

			this.elSavedHiddens = [];
			this.minHeight = config.minHeight;
			this.minWidth = config.minWidth;

			this.useAttachBox = (this.attachBox.elBox !== undefined);
			this.isAttachBoxDisplay = false;

			this.getAttachBoxPosition = function() {
				if(this.isAttachBoxDisplay) {
					return $tom.getPosition(this.attachBox.elBox);
				} else {
					return {x:0, y:0, width:0, height:0};
				}
			};

			this.resizeContainer = function() {
				//NOTE: Service Specific
				this.resizeScreenAtService();
				var _panelPosY = this.canvas.getCanvasPos().y;
				var _attachBoxPosition = this.getAttachBoxPosition();

				var _panelHeight = 0;
				if (document.documentElement.clientHeight > 0) {
					_panelHeight = document.documentElement.clientHeight - _panelPosY - 17; //NOTE: cuz line
				}else{
					_panelHeight = document.documentElement.offsetHeight - _panelPosY - 17;
				}
				
				if(_attachBoxPosition.height > 0) {
					_panelHeight -= _attachBoxPosition.height + 20; //NOTE: cuz margin
				}
				_panelHeight = Math.max(_panelHeight, this.minHeight);

				this.canvas.setCanvasSize({
					height: _panelHeight.toPx()
				});

				var _panelWidth = 0;
				if(document.documentElement.clientWidth > 0){
					_panelWidth = document.documentElement.clientWidth;
				}else{
					_panelWidth = document.documentElement.offsetWidth;
				}
				
				
				_panelWidth = Math.max(_panelWidth, this.minWidth);

				var _wrapper = this.wrapper;
				if(!_wrapper) {
					return;
				}
				_wrapper.style.width = _panelWidth.toPx();
			};

			this.resizeHandler = this.resizeContainer.bind(this);

			var _toggleScreen = function() {
				if(this.isFullScreen) {
					this.showNormalScreen();
				} else {
					this.showFullScreen();
				}
			}.bind(this);
			this.execute = _toggleScreen;
			
			if(config.switched == true) { //기본이 전체화면
				this.showFullScreen();
			}

			editor.getToolbar().observeJob("toolbar.advanced.fold", function(){ 
				if (this.isFullScreen) {
					this.resizeContainer();
				}
			}.bind(this));
			editor.getToolbar().observeJob("toolbar.advanced.spread", function(){ 
				if (this.isFullScreen) {
					this.resizeContainer();
				}
			}.bind(this));
			
			this.generate = function() {
				if(this.isInit) {
					return;
				}

				var _wrapper = this.wrapper;
				if(!_wrapper) {
					return;
				}

				var _elNoti = tx.div({ className: "tx-fullscreen-notice" });
				_wrapper.insertBefore(_elNoti, _wrapper.firstChild);
				_elNoti.appendChild(tx.span(TXMSG("@fullscreen.noti.span")));
				var _elNotiBtn = tx.a({ href: "#" }, TXMSG("@fullscreen.noti.btn"));
				_elNoti.appendChild(_elNotiBtn);
				$tx.observe(_elNotiBtn,'click', function() { //NOTE: cuz
					if(this.isFullScreen) {
						this.showNormalScreen();
					} else {
						this.showFullScreen();
					}
				}.bind(this));

				var _elCanvas = this.canvas.elContainer;
				var _elLine = tx.div({ className: "tx-fullscreen-line" });
				_wrapper.insertBefore(_elLine, _elCanvas.nextSibling);
				var _elLineDiv = tx.div({ className: "tx-fullscreen-line-division" },
					tx.div({ className: "tx-fullscreen-line-left" }, "&nbsp;"),
					tx.div({ className: "tx-fullscreen-line-right" }, "&nbsp;"),
					"&nbsp;"
				);
				_elLine.appendChild(_elLineDiv);
				
				var _attr = { className: "tx-fullscreen-line-box"};
				if($tx.msie_ver == '5.5'){
					_attr.align = "center"; 
				}
				var _elLineBox = tx.div(_attr,
					tx.div({ className: "tx-fullscreen-line-left" }, "&nbsp;"),
					tx.div({ className: "tx-fullscreen-line-right" }, "&nbsp;"),
					tx.a({ href:"#", unselectable: "on" }, TXMSG("@fullscreen.attach.close.btn"))
				);
				_elLine.appendChild(_elLineBox);
				var _elLineBtn = this.elLineBtn = $tom.collect(_elLineBox, "a");
				_elLineBox.appendChild(_elLineBtn);
				$tx.observe(_elLineBtn,'click', this.onAttachClick.bind(this));
				this.isInit = true;
			};

			this.showFullScreen = function() {
				if(this.isFullScreen) {
					return;
				}

				if(!this.isInit) {
					this.generate();
				}

				document.documentElement.style.overflow = 'hidden'; //Remove basic scrollbars
				document.documentElement.scrollTop = 0;
				document.body.style.overflow = 'hidden';

				//NOTE: Service Specific
				this.showFullScreenAtService();
				if(this.showAttachBoxAtServiceForSave) {
					window.showAttachBox = function(){
						this.showAttachBox();
						this.resizeContainer();
					}.bind(this);
				}
				if(this.hideAttachBoxAtServiceForSave) {
					window.hideAttachBox = function(){
						this.hideAttachBox();
						this.resizeContainer();
					}.bind(this);
				}
				
				var _wrapper = this.wrapper;
	
				if(!_wrapper) {
					return;
				}
				$tx.addClassName(_wrapper, 'tx-editor-fullscreen');
				
				//Hide select,activeX 
				var _savedHiddens = [];
				["select", "embed", "object"].each(function(name) {
					var _elHdns = $A(document.getElementsByTagName(name));
					_elHdns.each(function(el) {
						el.style.visibility = 'hidden';
						_savedHiddens.push(el);
					});
				});
				this.elSavedHiddens = _savedHiddens;

				//attach file box
				if(this.useAttachBox) {
					this.attachClickHandler(this.attachBox.checkDisplay());
				}

				var _panel = this.canvas.getCurrentPanel();
				this.panelNormalHeight = _panel.getPosition().height;

				if(parent) {
					if (parent.parent) {
						$tx.observe(parent.parent, 'resize', this.resizeHandler);
					} else {
						$tx.observe(parent, 'resize', this.resizeHandler);
					}
				} else {
					$tx.observe(window,'resize', this.resizeHandler);
				}

				this.fireJobs("plugin.fullscreen.change");

				// make trace element and move container to body's direct child
				window.wrapper = _wrapper;
				this.relativeParents = [];
				this.relativeValues = [];
				var parent = _wrapper.offsetParent;
				while (parent && parent.tagName && parent.tagName.toUpperCase() != "HTML" && parent.tagName.toUpperCase() != "BODY") {
					var position = (parent.currentStyle)?parent.currentStyle['position']:window.getComputedStyle(parent, null).getPropertyValue('position');
					if (position.toLowerCase() == "relative") {
						this.relativeParents.push(parent);
						this.relativeValues.push(position);
						parent.style.position = "static";
					}
					parent = parent.offsetParent;
				}
				
				this.isFullScreen = true;
				this.resizeContainer();
				if (!$tx.msie) {
					this.button.elIcon.focus();
				}
			};

			this.showNormalScreen = function() {
				if(!this.isFullScreen) {
					return;
				}

				document.documentElement.style.overflow = '';
				document.body.style.overflow = '';

				//NOTE: Service Specific
				this.showNormalScreenAtService();

				var _wrapper = this.wrapper;
				if(!_wrapper) {
					return;
				}

				_wrapper.style.width = '';
				$tx.removeClassName(_wrapper, 'tx-editor-fullscreen');

				this.elSavedHiddens.each(function(el) {
					el.style.visibility = 'visible';
				});

				if(parent) {
					if (parent.parent) {
						$tx.stopObserving(parent.parent, 'resize', this.resizeHandler);
					} else {
						$tx.stopObserving(parent, 'resize', this.resizeHandler);
					}
				} else {
					$tx.stopObserving(window,'resize', this.resizeHandler);
				}

				this.canvas.setCanvasSize({
				 	height: this.panelNormalHeight.toPx()
				});

				//첨부파일박스
				if(this.useAttachBox) {
					this.attachClickHandler(this.attachBox.checkDisplay());
				}

				this.fireJobs("plugin.normalscreen.change");
				
				//NOTE: Service Specific
				if(this.showAttachBoxAtServiceForSave) {
					window.showAttachBox = this.showAttachBoxAtServiceForSave;
				}
				if(this.hideAttachBoxAtServiceForSave) {
					window.hideAttachBox = this.hideAttachBoxAtServiceForSave;
				}
				
				
				for (var i = 0; i < this.relativeParents.length; i++) {
					var element = this.relativeParents.pop();
					var value = this.relativeValues.pop();
					element.style.position = value;
				}
				
				this.isFullScreen = false;
				if (!$tx.msie) {
					setTimeout(function() {
						this.button.elIcon.focus();
					}.bind(this), 500);
				}
			};

			this.attachClickHandler = function(isAttachBoxDisplay) {
				if(isAttachBoxDisplay) {
					this.showAttachBox();
				} else {
					this.hideAttachBox();
				}
			};

			this.onAttachClick = function() {
				this.attachClickHandler(!this.isAttachBoxDisplay);
				this.resizeContainer();
			};

			this.showAttachBox = function() {
				if(this.attachBox.useBox) {
					$tx.addClassName(this.elLineBtn, "tx-attach-close");
					$tx.show(this.attachBox.elBox);
					this.isAttachBoxDisplay = true;
				}
			};

			this.hideAttachBox = function() {
				if(this.attachBox.useBox) {
					$tx.removeClassName(this.elLineBtn, "tx-attach-close");
					$tx.hide(this.attachBox.elBox);
					this.isAttachBoxDisplay = false;
				}
			};
			
			if(typeof(showAttachBox) != 'undefined') { //NOTE: service specific job for changing attachbox's display(callback)
				this.showAttachBoxAtServiceForSave = showAttachBox; //NOTE: cuz disable showAttachBox() at fullscreen mode
			}
			if(typeof(hideAttachBox) != 'undefined') { //NOTE: service specific job for changing attachbox's display(callback)
				this.hideAttachBoxAtServiceForSave = hideAttachBox; //NOTE: cuz disable hideAttachBox() at fullscreen mode
			}
		}
});
