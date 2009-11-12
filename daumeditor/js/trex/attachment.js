/**
 * @fileoverview 
 * attachments.js
 * 
 */

/**
 * Trex.Attachment
 * 첨부된 data를 wrapping하는 class 
 * 
 * @abstract
 * @class
 * @extends Trex.Entry
 * 
 * @param {Object} actor
 * @param {Object} data 
 */
Trex.Attachment = Trex.Class.draft(/** @lends Trex.Attachment.prototype */{
	/** @ignore */
	$extend: Trex.Entry,
	isChecked: false,
	attrs: {
		align: "left"
	},
	initialize: function(actor, data) {
		var _entry = this;

		var _actor = this.actor = actor;
		var _canvas = this.canvas = _actor.canvas;
		var _entryBox = this.entryBox = _actor.entryBox;

		this.type = this.constructor.__Identity;
		this.setProperties(data);
		
		if(this.oninitialized){
			this.oninitialized(actor, data);
		}
	},
	/**
	 * existStage 값을 설정한다.
	 * @function
	 */
	setExistStage: function(existStage) {	//just attachments~
		/**
		 * attachment가 content에 존재하는지 확인할 때 사용되는 속성
		 */
		this.existStage = existStage;
		if (this.entryBox.changeState) {
			this.entryBox.changeState(this);
		}
	},
	/**
	 * content에서 attachment를 지운다.
	 * @function
	 */
	remove: function() {
		var _content = this.canvas.getContent();
		if(this.canvas.canHTML()) {
			if(_content.search(this.regHtml) > -1) {
				_content = _content.replace(this.regHtml, "");
				this.canvas.setContent(_content);
			}
		} else {
			if(_content.search(this.regText) > -1) {
				_content = _content.replace(this.regText, "");
				this.canvas.setContent(_content);
			}
		}
	},
	/**
	 * attachment HTML을 에디터 본문에 붙여넣는다.
	 * @function
	 */
	register: function() {
		if (Editor.getSidebar().addOnlyBox) {
			return;	
		}
		var _actor = this.actor;
		if (_actor.boxonly) {
			return;
		}
		
		if(this.canvas.canHTML()) {
			var _pastescope = this.pastescope;
			var _dispHtml = this.dispHtml;
			if(this.objectStyle) {
				_dispHtml = _dispHtml.replace(/<img /i, "<img style=\"" + Trex.Util.toStyleString(this.objectStyle) + "\" ");
			}
			if(this.objectAttr) {
				_dispHtml = _dispHtml.replace(/<img /i, "<img " + Trex.Util.toAttrString(this.objectAttr));
			}
			var _style = this.paragraphStyle || {};
			this.canvas.execute(function(processor) {
				processor.moveCaretWith(_pastescope);
				processor.pasteContent(_dispHtml, true, {
					'style': _style 
				});
			});
		} else {
			if(this.actor.wysiwygonly){
				alert(TXMSG("@attacher.only.wysiwyg.alert"));
			} else {
				this.canvas.getProcessor().insertTag('', this.dispText);
			}
		}
	},
	/**
	 * 인자로 받은 old regex로 attachment를 식별해서 HTML을 교체한다.
	 * @function
	 */
	replace: function(oldReg) {
		var _canvas = this.canvas;
		var _content = _canvas.getContent();
		var _actor = this.actor;
		if (!_actor.boxonly) {
			if(_canvas.canHTML()) {
				if(_content.search(oldReg.regHtml) > -1) {
					_content = _content.replace(oldReg.regHtml, this.dispHtml);
					_canvas.setContent(_content);
				} else {
					_canvas.pasteContent(this.dispHtml, true);
				}
			} else {
				if(_content.search(oldReg.regText) > -1) {
					_content = _content.replace(oldReg.regText, "");
					_canvas.setContent(_content);
				}
				alert(TXMSG("@attacher.only.wysiwyg.alert"));
			}
		}
	},
	/**
	 * attachment 관련하여 필요한 속성을 this 객체에 할당한다.
	 * @function
	 */
	setProperties: function(data) {
		var _data = this.data = data;
		this.key = this.actor.getKey(_data) || 'K'+Trex.Util.generateKey();
		this.field = this.getFieldAttr(_data);
		this.boxAttr = this.getBoxAttr(_data);
		
		this.objectAttr = this.getObjectAttr.bind(this)(_data);
		this.objectStyle = this.getObjectStyle.bind(this)(_data);
		this.paragraphStyle = this.getParaStyle.bind(this)(_data);
		
		this.saveHtml = this.getSaveHtml.bind(this)(_data);
		this.dispHtml = this.getDispHtml.bind(this)(_data);
		this.dispText = this.getDispText.bind(this)(_data);
		this.regLoad = this.getRegLoad.bind(this)(_data);
		this.regHtml = this.getRegHtml.bind(this)(_data);
		this.regText = this.getRegText.bind(this)(_data);
	},
	/**
	 * object의 attribute 값을 가져온다.
	 * @function
	 */
	getObjectAttr: function(data) {
		return this.actor.config.objattr;
	},
	/**
	 * object의 style 값을 가져온다.
	 * @function
	 */
	getObjectStyle: function(data) {
		return this.actor.config.objstyle;
	},
	/**
	 * object를 감싸고 있는 paragraph tag 의 style 값을 가져온다.
	 * @function
	 */
	getParaStyle: function(data) {
		return this.actor.config.parastyle || this.actor.config.defaultstyle || {};
	}
});


