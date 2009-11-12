/**
 * Trex.EmbedBox
 * 본문에 삽입한 embed들이 저장되는 class 
 * 
 * @class
 * @extends Trex.EntryBox
 * @param {Object} config
 * @param {Object} canvas
 * @param {Object} editor
 */
Trex.EmbedBox = Trex.Class.create({
	/** @ignore */
	$extend: Trex.EntryBox,
	initialize: function(config, canvas) {

	}
});

Trex.install("install Trex.EmbedBox",
	function(editor, toolbar, sidebar, canvas, config){
		
		var _embedBox = new Trex.EmbedBox(config, canvas, editor);
		sidebar.entryboxRegistry['embedbox'] = _embedBox;
		editor.getEmbedBox = function() {
			return _embedBox;
		};
		sidebar.getEmbeddedData = _embedBox.getEntries.bind(_embedBox);
	}
);


Trex.install("install Trex.Embeder Instances",
	function(editor, toolbar, sidebar, canvas, config){
		
		var _embedBox = editor.getEmbedBox();
		var _embeders = sidebar.embeders = {};
		
		for(var i in Trex.Embeder) {
			var _name = Trex.Embeder[i]['__Identity'];
			if (_name) {
				if(!toolbar.tools[_name]){
					console.log(["No tool '",_name,"', but Embeder '", _name,"' is initialized."].join(""));
				}
				_embeders[_name] = new Trex.Embeder[i](editor, _embedBox, config);
			}
		}
		
		var _getEmbeder = sidebar.getEmbeder = function(name) {
			if(_embeders[name] != null) {
				return _embeders[name];
			} else if(arguments.length == 0){
				return _embeders;
			}else{
				return null;
			}
		};
	}
);	

Trex.Embeder = Trex.Class.draft({
	$extend: Trex.Actor,
	canResized: false,
	initialize: function(editor, entryBox, config) {
		this.editor = editor;
		this.canvas = editor.getCanvas();
		
		var _config = this.config = TrexConfig.getEmbeder(this.constructor.__Identity, config);
		this.pvUrl =  TrexConfig.getUrl(config.pvpage, { "pvname": this.name });
		this.wysiwygonly = ((_config.wysiwygonly != null)? _config.wysiwygonly: true);
		this.pastescope = _config.pastescope;
		
		/* entry create */
		this.embedHandler = this.embedHandler.bind(this);
		
		//NOTE: Cuz Specific Case 
		if (this.oninitialized) {
			this.oninitialized.bind(this)(config);
		}
	},
	execute: function() {
		if(this.wysiwygonly && !this.canvas.canHTML()) {
			alert(TXMSG("@embeder.alert"));
			return;
		}
		
		if(this.clickHandler) {
			this.clickHandler();
		} else {
			try {
				var _url = this.config.usepvpage ? this.pvUrl+"&u="+escape(this.config.popPageUrl) :	this.config.popPageUrl;
				var win = window.open(_url, "at" + this.name, this.config.features);
				win.focus();
			} catch (e) {}
		}
	},
	embedHandler: function(data) {
		this.execAttach(data);
	},
	createEntry: function(data, type) {
		var _embeddedItemType = this.constructor.__Identity;
		if(type){
			_embeddedItemType = type;
		}
		return new Trex.EmbedEntry[_embeddedItemType.capatialize()](this, data);
	},
	execAttach: function(data, type) {
		var _pastescope = this.pastescope;
		var _html = this.getCreatedHtml(data);
		var _style = this.config.parastyle || this.config.defaultstyle || {};
		this.canvas.execute(function(processor) {
			processor.moveCaretWith(_pastescope);
			processor.pasteContent(_html, true, _style);
		});
	},
	execReattach: function(data, type) {
	},
	execReload: function(data, type) {
	},
	getReloadContent: function(data, content) {
		if(!data.dispElId) {
			return content;
		}
		var _html = this.getCreatedHtml(data);
		var _reg = new RegExp("<(?:img|IMG)[^>]*id=\"?" + data.dispElId + "\"?[^>]*\/?>", "gm");
		if(content.search(_reg) > -1) {
			return content.replace(_reg, _html);
		}
		return content;
	}
});
