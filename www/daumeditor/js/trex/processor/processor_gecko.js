Trex.I.Processor.Gecko = {
	/**
	 * @private
	 * @memberOf Trex.Canvas.ProcessorP
	 * Gecko에서 newlinepolicy가 p일 경우 Enter Key 이벤트가 발생하면 실행한다. 
	 * @param {Event} ev - Enter Key 이벤트
	 */
	controlEnterByParagraph: function(ev) {
		this.getTxSel().collapse(false);
		
		if (!!this.findNode("li,td,th")) { //NOTE: li, table
			if(!this.findNode("button")) {
				return; //don't care
			}
		} 
		
		var _rng = this.getTxSel().getRange(); 
		var _processor = this;
		this.execWithMarker(function(marker) {
			var _btnNode = $tom.find(marker.startMarker, "button");
			if (_btnNode) { //NOTE: button
				_processor.moveCaretTo($tom.next(_btnNode));
			} else {
				var _dvLNode = $tom.divideParagraph(marker.startMarker);
				_processor.restoreScrollTop(_dvLNode);
				_processor.moveCaretTo(_dvLNode);
			}
		});
		throw $stop;
	},
	/**
	 * @private
	 * @memberOf Trex.Canvas.ProcessorBR
	 * Gecko에서 newlinepolicy가 br일 경우 Enter Key 이벤트가 발생하면 실행한다. 
	 * @param {Event} ev - Enter Key 이벤트
	 */
	controlEnterByLinebreak: function(ev) {
	}
};
	
