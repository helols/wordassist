
Trex.I.Processor.GeckoP = {
	/* Only FireFox Start */
	putBogusParagraph: function() {
		var _body = this.doc.body;
		var _lastChild = _body.lastChild;
		if(_lastChild && $tom.kindOf(_lastChild, 'p')) {
			if($tom.kindOf($tom.last(_lastChild), 'br')) {
				return;
			}
		}
		var _newChild = this.win.p("&nbsp;", this.win.br());
		if($tom.kindOf(_lastChild, "br")) {
			$tom.replace(_lastChild, _newChild);
		} else {
			$tom.append(_body, _newChild);
		}
	},
	restoreScrollTop: function(node) {
		if(!node) {
			return;
		}
		if(this.win.innerHeight < this.doc.documentElement.offsetHeight){
			var _oldTop = document.documentElement.scrollTop;				
			$tom.goInto(node, false);
			document.documentElement.scrollTop = _oldTop;					
		}
	}
};

Trex.install("put bogus paragraph when key event fires",
	function(editor, toolbar, sidebar, canvas, config) {
		if ($tx.gecko && canvas.config.newlinepolicy == "p") {
			canvas.reserveJob(Trex.Ev.__CANVAS_PANEL_KEYUP, function(ev){
				if (!canvas.canHTML()) {
					return;
				}
				var _processor = canvas.getProcessor();
				_processor.putBogusParagraph();
			}, 10);
		}
	}
);
