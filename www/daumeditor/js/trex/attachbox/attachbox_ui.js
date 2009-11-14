Trex.install("install attachbox ui",
	function(editor, toolbar, sidebar, canvas, config){
		var attachbox = editor.getAttachBox();
		if (config.sidebar.attachbox.show == true) {
			Object.extend(attachbox, Trex.I.AttachBox);
			attachbox.onAttachBoxInitialized(config, canvas, editor);
		}
	}
);
Trex.I.AttachBox = {
	useBox: true,
	isDisplay: false,
	lastSelectedEntry: null,
	onAttachBoxInitialized: function(config, canvas){
		var _entryBox = this;
		this.canvas = canvas;
		
		var _initializedId = ((config.initializedId)? config.initializedId: "");
		this.elBox = $must("tx_attach_div" + _initializedId, "Trex.I.AttachBox");
		
		this.elList = $must("tx_attach_list" + _initializedId, "Trex.I.AttachBox");
		var _elPreview = $must('tx_attach_preview' + _initializedId, "Trex.I.AttachBox");
		this.elPreviewKind = $tom.collect(_elPreview, "p");
		var _elPreviewImg = this.elPreviewImg = $tom.collect(_elPreview, "img");
		var _imageResizer = this.imageResizer = new Trex.ImageResizer(_elPreviewImg, {
			maxWidth: 147,
			maxHeight: 108,
			defImgUrl: TXMSG("@attacher.preview.image"),
			onComplete: function(width, height) { //vertical positioning
				_elPreviewImg.style.marginTop = Math.floor((108 - height)/2).toPx();
			}
		});

		this.elDelete = $tom.collect("#tx_attach_delete" + _initializedId + " a");
		$tx.observe(this.elDelete, 'click', this.onDeleteAll.bind(this));

		if(typeof(showAttachBox) != 'undefined') { //NOTE: service specific job for changing attachbox's display(callback)
			this.observeJob(Trex.Ev.__ATTACHBOX_SHOW, function(){
				showAttachBox();
			});
		}
		if(typeof(hideAttachBox) != 'undefined') { //NOTE: service specific job for changing attachbox's display(callback)
			this.observeJob(Trex.Ev.__ATTACHBOX_HIDE, function(){
				hideAttachBox();
			});
		}

		var _elProgress = this.elProgress = $must('tx_upload_progress' + _initializedId, 'Trex.I.AttachBox');
		this.elProgressPercent = $tom.collect(_elProgress, "div");
		this.elProgressTicker = $tom.collect(_elProgress, "p");
		
		this.observeJob(Trex.Ev.__ENTRYBOX_ENTRY_ADDED, function(entry){
			_entryBox.registerEntryNode(entry);
			_entryBox.displayBox();
		});
		this.observeJob(Trex.Ev.__ENTRYBOX_ENTRY_MODIFIED, function(entry){
			_entryBox.modifyEntryNode(entry);
		});
		this.observeJob(Trex.Ev.__ENTRYBOX_ENTRY_REMOVED, function(entry){
			_entryBox.removeEntryNode(entry);
			_entryBox.displayBox();
			if(_entryBox.lastSelectedEntry && _entryBox.lastSelectedEntry.key == _entryBox.key) {
				_entryBox.imageResizer.execResize(TXMSG("@attacher.preview.image"));
			}
		});	
		this.observeJob(Trex.Ev.__ENTRYBOX_ALL_ENTRY_REMOVED, function() {
			_entryBox.datalist.each(function(entry) {
				_entryBox.removeEntryNode(entry, true);
			});
			_entryBox.displayBox();
			if(_entryBox.lastSelectedEntry && _entryBox.lastSelectedEntry.key == _entryBox.key) {
				_entryBox.imageResizer.execResize(TXMSG("@attacher.preview.image"));
			}
		});	
		this.observeJob(Trex.Ev.__ENTRYBOX_ENTRY_REFRESH, function(entry){
			_entryBox.displayBox();
			_entryBox.refreshEntryNode(entry);
		})
	},
	onDeleteAll: function(force) {
		if (this.datalist.length === 0) {
			return;
		}
		if (!force && !confirm(TXMSG("@attacher.delete.all.confirm"))) {
			return;
		}
		this.datalist.each(function(entry) {
			entry.execRemove();
		});
		this.imageResizer.execResize(TXMSG("@attacher.preview.image"));
	},
	checkDisplay: function() {
		return this.isDisplay;
	},
	setDisplay: function(isDisplay) {
		this.isDisplay = isDisplay;
	},
	displayBox: function() {
		var isDisplay = false;
		for( i = 0; i < this.datalist.length; i++ ){
			if ( this.datalist[i].deletedMark == false){
				isDisplay = true;
			}
		}
		//var isDisplay = (this.datalist.length > 0);
		if (this.isDisplay == isDisplay) {
			return;
		}
		if(isDisplay) {
			$tx.show(this.elBox);
			this.fireJobs(Trex.Ev.__ATTACHBOX_SHOW, true);
		} else {
			$tx.hide(this.elBox);
			this.fireJobs(Trex.Ev.__ATTACHBOX_HIDE, false);
		}
		this.isDisplay = isDisplay;
	},
	registerEntryNode: function(entry) {
		var _elData = tx.li(  );
		this.elList.appendChild(_elData);
		entry.elData = _elData;
		
		entry.makeSelection = function(isPreviewed) {
			if (isPreviewed) {
				this.showEntryThumb(entry);
			} else {
				this.hideEntryThumb(entry);
			}
		}.bind(this);
		
		//NOTE: only blog cuz iframe area
		$tx.observe(_elData, 'mouseover', this.onEntryMouseOver.bind(this, entry));
		$tx.observe(_elData, 'mouseout',  this.onEntryMouseOut.bind(this, entry));

		var _elRow = tx.dl(  );
		_elData.appendChild(_elRow);

		var _elName = entry.elName = tx.dt({ className: "tx-name", unselectable: "on" },entry.boxAttr.name ); //파일명
		_elRow.appendChild(_elName);
		$tx.observe(_elData, 'click',
			function(e){
				var _el = $tx.element(e);
				if(_el.className == "tx-delete" || _el.className == "tx-insert"){
					return ;
				}
				if (e.ctrlKey) {
					this.clickEntryWithCtrl(entry);
				} else if (e.shiftKey) {
					this.clickEntryWithShift(entry);
				} else {
					this.clickEntry(entry);
				}
				if(entry.actor.name == 'image') { //NOTE: get image scale
					if (!entry.data.width || !entry.data.height) {
						new Trex.ImageScale(entry.data);
					}
				}
			}.bind(this), false);

		var _elButton = tx.dd({ className: "tx-button" }); //버튼
		_elRow.appendChild(_elButton);

		var _elDelete = tx.a({ className: "tx-delete" }, TXMSG("@attacher.del")); //삭제
		_elButton.appendChild(_elDelete);
		$tx.observe(_elDelete, 'click', function() {
			if(!confirm(TXMSG("@attacher.delete.confirm"))) {
				return;
			}
			entry.execRemove();
		}, false);

		var _elInsert = entry.elInsert = tx.a({ className: "tx-insert" }, TXMSG("@attacher.ins")); //삽입
		_elButton.appendChild(_elInsert);
		$tx.observe(_elInsert, 'click', function() {
			if(entry.existStage && !entry.actor.config.multipleuse) {
				alert(TXMSG("@attacher.exist.alert"));
			} else {
				entry.execAppend();
			}
		}, false);
	},
	changeState: function(entry){
		var _existStage = entry.existStage;
		if (_existStage && !entry.actor.config.multipleuse) {
			$tx.addClassName(entry.elData,"tx-existed");
		} else {
			$tx.removeClassName(entry.elData, "tx-existed");
		}
	},
	modifyEntryNode: function(entry) {
		entry.elName.innerText = entry.boxAttr.name;
	},
	removeEntryNode: function(entry, force) {
		if (force) {
			entry.elData.parentNode.removeChild(entry.elData);
		} else 	if (entry.deletedMark) {
			$tx.hide(entry.elData);
		}
	},
	refreshEntryNode: function(entry){
		if (entry.deletedMark) {
			$tx.hide(entry.elData);
		} else {
			$tx.show(entry.elData);
		}
	},
	showEntryThumb: function(entry) {
		$tx.addClassName(entry.elData, "tx-clicked");
		$tx.removeClassName(entry.elData, "tx-hovered");
	},
	hideEntryThumb: function(entry) {
		$tx.removeClassName(entry.elData, "tx-clicked");
	},
	onEntryMouseOver: function(entry) {
		$tx.addClassName(entry.elData, "tx-hovered");
	},
	onEntryMouseOut: function(entry) {
		$tx.removeClassName(entry.elData, "tx-hovered");
	},
	startUpload: function() {
		this.elProgressPercent.style.width = "0".toPx();
		$tx.setStyle(this.elList, {opacity: 0.3});
		$tx.show(this.elProgress);
	},
	doUpload: function(percent) {
		var progressWidth = 300;
		this.elProgressPercent.style.width = Math.floor(progressWidth * (isNaN(percent)  ? 0: parseFloat(percent) * 0.01)).toPx();
		this.elProgressTicker.innerText = Math.floor( (isNaN(percent)? 0: parseFloat(percent))) + "%";
	},
	endUpload: function() {
		$tx.hide(this.elProgress);
		$tx.setStyle(this.elList, {opacity: 1});
	},
	clickEntry: function(entry) {
		if(this.lastSelectedEntry) {
			if(this.lastSelectedEntry.key == entry.key) {
				return;
			}
			this.datalist.each(
				function(entry){
					entry.makeSelection(false);
				}
			);
		}
		this.elPreviewKind.className = ((entry.boxAttr.className)? entry.boxAttr.className: "");
		entry.makeSelection(true);
		this.imageResizer.execResize(entry.boxAttr.image);
		this.lastSelectedEntry = entry;
	},
	clickEntryWithCtrl: function(entry) {
		if ($tx.hasClassName(entry.elData, 'tx-clicked')) {
			entry.makeSelection(false);
			this.lastSelectedEntry = null;
		}else {
			this.elPreviewKind.className = ((entry.boxAttr.className) ? entry.boxAttr.className : "");
			entry.makeSelection(true);
			this.imageResizer.execResize(entry.boxAttr.image);
			this.lastSelectedEntry = entry;
		}
	},
	clickEntryWithShift: function(entry) {
		if ($tx.hasClassName(entry.elData, 'tx-clicked')) {
			entry.makeSelection(false);
			this.lastSelectedEntry = null;
		}else {
			var idx = this.getIndexOf(entry);
			var targetIdx;
			if (this.lastSelectedEntry) {
				 targetIdx = this.getIndexOf(this.lastSelectedEntry);
			}
			
			var from = targetIdx, to = idx;
			if (idx == targetIdx) {
				from = to = idx;
			} else if (idx < targetIdx) {
				from = idx;
				to = targetIdx;
			}	 
			
			this.elPreviewKind.className = ((entry.boxAttr.className) ? entry.boxAttr.className : "");
			for(var i = from; i < to + 1 ; i++){
				this.datalist[i].makeSelection(true);
			}
			
			this.imageResizer.execResize(entry.boxAttr.image);
			this.lastSelectedEntry = entry;
		}
	},
	getIndexOf: function(entry){
		var i, matched;
		for(i = 0; i<this.datalist.length ; i++){
			if(this.datalist[i] === entry){
				matched = true;
				break;				
			}
		}
		return matched ? i : -1;
	},
	getSelectedList: function(attachType){
		var _list = [];
		var _source;
		if(attachType){
			_source = this.getAttachments(attachType);
		}else{
			_source = this.datalist; 
		}
		_source.each(
				function(entry){
					if($tx.hasClassName(entry.elData, "tx-clicked")){
						_list.push(entry);	
					}
				}
			);
		return _list;		
	},
	removeSelection: function(datalist){
		datalist.each(function(data){
			$tx.removeClassName(data.elData, "tx-clicked");
		})
	}
};
