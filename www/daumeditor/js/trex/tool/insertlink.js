/**
 * @fileoverview 
 * '링크삽입' Icon Source,
 * Class Trex.Tool.Link과 configuration을 포함    
 *     
 */
TrexConfig.addTool(
	"link",
	{
		wysiwygonly: true,
		sync: false,
		status: true
	}
);

Trex.Tool.Link = Trex.Class.create({
	$const: {
		__Identity: 'link'
	},
	$extend: Trex.Tool,
	oninitialized: function(config) {
			var _tool = this; 
			var _toolbar = this.toolbar;
			var _canvas = this.canvas;

			var _toolHandler = function(data) {
				if (_canvas.canHTML()) {
					if (data) {
						_canvas.execute(function(processor) {
							var _attributes = {
								'href': data.link,
								'target': data.target ? data.target : '_blank'
							};
							if (processor.hasControl()) {
								var _nodes = processor.controls(function() {
									return 'img';
								});
								$tom.wrap(processor.create("a", _attributes), _nodes);
							} else if(processor.isCollapsed()) {
								var _aNode = processor.create("a", _attributes);
								_aNode.innerHTML = data.link;
								processor.pasteNode(_aNode, false);
							} else {
								var _nodes = processor.inlines(function() {
									return '%text,img,a,%inline';
								});
								_nodes.each(function(node) {
									if($tom.kindOf(node, "a")) {
										$tom.applyAttributes(node, _attributes);
									} else {
										$tom.wrap(processor.create("a", _attributes), node);
									}
								});
							}
						});
					} else {
						_canvas.execute(function(processor) {
							var _node = processor.findNode('a');
							if (_node) {
								processor.unwrap(_node);
							}
						});
					}
				}else{
					_canvas.execute(function(processor) {
						processor.insertTag('<a href="' + data.link + '" target="' +data.target+ '" >','</a>');
					});
				}	
			};
			
			var __DefaultValue = "";
			var _initHandler = function(data) {
				if (_canvas.canHTML()) {
					return _canvas.query(function(processor){
						var _node = processor.findNode('a');
						if (_node) {
							var _value = $tom.getAttribute(_node, "href");
							var _target = $tom.getAttribute(_node, "target");
							if (_value != null && _value.length > 0) {
								processor.selectAround(_node);
								return {
									exist: true,
									value: _value,
									target: _target
								};
							}
						}
						return {
							exist: false,
							value: __DefaultValue
						};
					});
				}else{
					return {
						exist: false,
						value: __DefaultValue
					};
				}
			};

			/* button & menu weave */
			this.weave.bind(this)(
				/* button */
				new Trex.Button(this.buttonCfg),
				/* menu */
				new Trex.Menu.Link(this.menuCfg),
				/* handler */
				_toolHandler,
				/* handler for menu initial value */
				_initHandler
			);

			var _popdownHandler = function() {
				_tool.button.onMouseDown();
			}	
			_canvas.observeKey({ // ctrl + k - 링크
				ctrlKey: true,
				altKey: false,
				shiftKey: false,
				keyCode: 75
			}, _popdownHandler);
		}
	
});

/* Trex.Menu.Link ************************************************************************************/
Trex.MarkupTemplate.add(
	'menu.insertlink', [
		'<div class="tx-menu-inner">',
		'    <dl>',
		'        <dt>',
		'            @insertlink.title',
		'        </dt>',
		'        <dd>',
		'            <input type="text" class="tx-text-input"/>',
		'        </dd>',
		'        <dd class="tx-rp">',
		'            <span class="tx-text tx-first">클릭 시</span>',
		'            <span><input type="radio" name="tx-insertlink-win" value="_blank"/><span class="tx-text">새 창</span></span>',
		'            <span><input type="radio" name="tx-insertlink-win" value="_self"/><span class="tx-text">현재창</span></span>',
		'        </dd>',
		'        <dd class="tx-hr">',
		'            <hr/>',
		'        </dd>',
		'        <dd>',
		'            <img width="32" height="21" src="@insertlink.confirm.image"/>',
		'            <img width="32" height="21" src="@insertlink.cancel.image"/>',
		'            <img width="51" height="21" src="@insertlink.remove.image" style="display: none;"/>',
		'        </dd>',
		'    </dl>',
		'</div>'
	].join("")
);

Trex.Menu.Link = Trex.Class.create({
	$extend: Trex.Menu,
	ongenerated: function() {
		var _elMenu = this.elMenu;
		Trex.MarkupTemplate.get('menu.insertlink').evaluateToDom({}, _elMenu);
		
		var _elTargets = $tom.collectAll(_elMenu, ".tx-rp input");
		var _newInput = this.newInput = _elTargets[0];
		$tx.observe(_newInput, "click", function(ev){
				_newInput.checked = "checked";
				_currInput.checked = "";
		});
		var _currInput = this.currInput = _elTargets[1];
		$tx.observe(_currInput, "click", function(ev){
				_currInput.checked = "checked";
				_newInput.checked = "";
		});
			
		var _checkValidation = function(value) {
			if(!value){
				return false;
			}else if(value.length == 0){
				return false;
			}
								
			if ( !/http[s]?:\/\//.test(value) ) {
				return "http://" + value;
			}else {
				return value;
			}
		};	
		var _elInput = this.elInput = $tom.collect(_elMenu, 'input.tx-text-input');
		$tx.observe(_elInput, "keydown", function(ev) {
			if(ev.keyCode == 13) { //Enter
				var _val = _checkValidation(_elInput.value);
				if (!_val) {
					alert( TXMSG("@insertlink.invalid.url") );
					$tx.stop(ev);
					return;
				}
				var _target = _newInput.checked ? _newInput.value : _currInput.value;  
				this.onSelect(ev, {
					link: _val,
					target: _target
				});
				$tx.stop(ev);
			}
		}.bindAsEventListener(this));
		
		var _elImgs = $tom.collectAll(_elMenu, 'img');
		$tx.observe(_elImgs[0], "click", function(ev) {
			var _val = _checkValidation(_elInput.value);
			if (!_val) {
				alert( TXMSG("@insertlink.invalid.url") );
				$tx.stop(ev);
				return;
			}
			var _target = _newInput.checked ? _newInput.value : _currInput.value;
			this.onSelect(ev, {
					link: _val,
					target: _target
				});
			$tx.stop(ev);
		}.bind(this));
		
		$tx.observe(_elImgs[1], "click", function() {
			this.onCancel();
		}.bindAsEventListener(this));

		var _elRemoveBtn = $tx(_elImgs[2]);
		$tx.observe(_elRemoveBtn, "click", function(ev) {
			this.onSelect(ev, null);
		}.bindAsEventListener(this));
		this.toggleRemoveBtn = function(exist) {
			_elRemoveBtn.style.display = ((exist)? '': 'none');
		};
	},
	onregenerated: function() {
		var _elInput = this.elInput;
		var _initData = this.initHandler();
		_elInput.value = _initData.value;
		if(_initData.target == "_self"){
			this.currInput.checked = "checked";
			this.newInput.checked = "";
		}else{
			this.newInput.checked = "checked";
			this.currInput.checked = "";
		}
		
		this.toggleRemoveBtn(_initData.exist);
		_elInput.focus();
		
		// Set focus to end of input box. ( For IE );
		if ($tx.msie) {
			setTimeout(function() {
				_elInput.focus();
				var _sel = document.selection.createRange();
				_sel.move("character", _elInput.value.length);
				_sel.select();
			}, 100);
		}
	}
});

