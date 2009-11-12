Trex.group("block_edit_and_resize.js");

Trex.module("Register an eventhandler in order to block resizing and editing search results & some images in wysiwig panel.",
	function(editor, toolbar, sidebar, canvas, config) {
		
		var _blockResizeHandler;
		if ($tx.msie) {
			_blockResizeHandler = function(element) {
				if (element.onresizestart == null) {
					element.onresizestart = function() {
						return false;
					};
				}
			};
		}
		
		if(_blockResizeHandler) {
			canvas.observeElement({ tag: "img", klass: "_tx-unresizable" }, _blockResizeHandler);
			canvas.observeElement({ tag: "img", klass: "tx-entry-attach" }, _blockResizeHandler);
			canvas.observeElement({ tag: "img", klass: "txc-footnote" }, _blockResizeHandler);
			canvas.observeElement({ tag: "iframe", klass: "txc-map" }, _blockResizeHandler); 
		}
		
		var _blockSelectHandler;
		if ($tx.msie) {
			_blockSelectHandler = function(element) {
				element.setAttribute("unselectable", "on");
				$A(element.getElementsByTagName("*")).each(function(child) {
					if (child.nodeName.charAt(0) != "/") {
						child.setAttribute("unselectable", "on");
					}
				});
				var _processor = canvas.getProcessor();
				_processor.selectControl(element);
			};
		} else {
			_blockSelectHandler = function(element) {
				var _processor = canvas.getProcessor();
				_processor.selectControl(element);
			};
		}
		canvas.observeElement({ tag: "button" }, _blockSelectHandler);
		canvas.observeElement({ tag: "img" }, function(element) {
			var _element = $tom.find(element, 'button');
			if(_element) {
				_blockSelectHandler(_element);
			}
		});
		canvas.observeElement({ tag: "iframe", klass: "txc-map" }, function(element) {
			var _processor = canvas.getProcessor();
			_processor.selectControl(element);
		}); 
	}
);	
